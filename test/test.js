/* eslint-env mocha */
'use strict'

var betterThanBefore = require('better-than-before')()
var expect = require('chai').expect
var conventionalChangelogCore = require('conventional-changelog-core')
var gitDummyCommit = require('git-dummy-commit')
var mocha = require('mocha')
var path = require('path')
var shell = require('shelljs')
var through = require('through2')

var preset = require('../')

var preparing = betterThanBefore.preparing
var describe = mocha.describe
var it = mocha.it

betterThanBefore.setups([
    function() {
        shell.config.silent = true
        shell.rm('-rf', 'tmp')
        shell.mkdir('tmp')
        shell.cd('tmp')
        shell.mkdir('git-templates')
        shell.exec('git init --template=./git-templates')

        gitDummyCommit('🎁 first commit')
        gitDummyCommit([
            '🎁 amazing new module',
            'BREAKING CHANGE: Not backward compatible.',
        ])
        gitDummyCommit([
            '🐛(compile) avoid a bug',
            'BREAKING CHANGE: The Change is huge.',
        ])
        gitDummyCommit(['🔨(ngOptions) make it faster', ' closes #1, #2'])
        gitDummyCommit('⏪(ngOptions) bad commit')
        gitDummyCommit('🐛 oops')
    },
    function() {
        gitDummyCommit(['🎁(awesome) addresses the issue brought up in #133'])
    },
    function() {
        gitDummyCommit(['🎁(awesome) fix #88'])
    },
    function() {
        gitDummyCommit(['🎁(awesome) issue brought up by @bcoe! on Friday'])
    },
    function() {
        gitDummyCommit([
            '📝(readme) make it clear',
            'BREAKING CHANGE: The Change is huge.',
        ])
        gitDummyCommit([
            '👕(whitespace) make it easier to read',
            'BREAKING CHANGE: The Change is huge.',
        ])
        gitDummyCommit([
            '🔨(code) change a lot of code',
            'BREAKING CHANGE: The Change is huge.',
        ])
        gitDummyCommit([
            '✅ more tests',
            'BREAKING CHANGE: The Change is huge.',
        ])
        gitDummyCommit(['📦 bump', 'BREAKING CHANGE: The Change is huge.'])
    },
    function() {
        gitDummyCommit(['📦 bump', 'BREAKING CHANGES: Also works :)'])
    },
    function() {
        shell.exec('git tag v1.0.0')
        gitDummyCommit('🎁 some more features')
    },
    function() {
        gitDummyCommit(['🎁 implementing #5 by @dlmr', ' closes #10'])
    },
    function() {
        gitDummyCommit(['🐛 use npm@5 (@username)'])
    },
])

describe('zazen preset', function() {
    it('should work if there is no semver tag', function(done) {
        preparing(1)

        conventionalChangelogCore({
            config: preset,
        })
            .on('error', function(err) {
                done(err)
            })
            .pipe(
                through(function(chunk) {
                    chunk = chunk.toString()

                    expect(chunk).to.include('amazing new module')
                    expect(chunk).to.include('avoid a bug')
                    expect(chunk).to.include('make it faster')
                    expect(chunk).to.include(
                        ', closes [#1](https://github.com/stormwarning/zazen-conventional-changelog/issues/1) [#2](https://github.com/stormwarning/zazen-conventional-changelog/issues/2)',
                    )
                    expect(chunk).to.include('Not backward compatible.')
                    expect(chunk).to.include('The Change is huge.')
                    expect(chunk).to.include('Fixed')
                    expect(chunk).to.include('Added')
                    expect(chunk).to.include('bad commit')
                    expect(chunk).to.include('BREAKING CHANGES')

                    // expect(chunk).to.not.include('first commit')
                    // expect(chunk).to.not.include('feat')
                    // expect(chunk).to.not.include('fix')
                    // expect(chunk).to.not.include('perf')
                    // expect(chunk).to.not.include('revert')
                    expect(chunk).to.not.include('***:**')
                    // expect(chunk).to.not.include(': Not backward compatible.')

                    done()
                }),
            )
    })

    it('should replace #[0-9]+ with GitHub issue URL', function(done) {
        preparing(2)

        conventionalChangelogCore({
            config: preset,
        })
            .on('error', function(err) {
                done(err)
            })
            .pipe(
                through(function(chunk) {
                    chunk = chunk.toString()
                    expect(chunk).to.include(
                        '[#133](https://github.com/stormwarning/zazen-conventional-changelog/issues/133)',
                    )
                    done()
                }),
            )
    })

    it('should remove the issues that already appear in the subject', function(done) {
        preparing(3)

        conventionalChangelogCore({
            config: preset,
        })
            .on('error', function(err) {
                done(err)
            })
            .pipe(
                through(function(chunk) {
                    chunk = chunk.toString()
                    expect(chunk).to.include(
                        '[#88](https://github.com/stormwarning/zazen-conventional-changelog/issues/88)',
                    )
                    expect(chunk).to.not.include(
                        'closes [#88](https://github.com/stormwarning/zazen-conventional-changelog/issues/88)',
                    )
                    done()
                }),
            )
    })

    it('should replace @username with GitHub user URL', function(done) {
        preparing(4)

        conventionalChangelogCore({
            config: preset,
        })
            .on('error', function(err) {
                done(err)
            })
            .pipe(
                through(function(chunk) {
                    chunk = chunk.toString()
                    expect(chunk).to.include('[@bcoe](https://github.com/bcoe)')
                    done()
                }),
            )
    })

    // it('should not discard commit if there is BREAKING CHANGE', function (done) {
    //     preparing(5)

    //     conventionalChangelogCore({
    //         config: preset,
    //     })
    //         .on('error', function (err) {
    //             done(err)
    //         })
    //         .pipe(
    //             through(function (chunk) {
    //                 chunk = chunk.toString()

    //                 expect(chunk).to.include('Documentation')
    //                 expect(chunk).to.include('Styles')
    //                 expect(chunk).to.include('Code Refactoring')
    //                 expect(chunk).to.include('Tests')
    //                 expect(chunk).to.include('Chores')

    //                 done()
    //             }),
    //         )
    // })

    it('should BREAKING CHANGES the same as BREAKING CHANGE', function(done) {
        preparing(6)

        conventionalChangelogCore({
            config: preset,
        })
            .on('error', function(err) {
                done(err)
            })
            .pipe(
                through(function(chunk) {
                    chunk = chunk.toString()

                    expect(chunk).to.include('Also works :)')

                    done()
                }),
            )
    })

    it('should work if there is a semver tag', function(done) {
        preparing(7)
        var i = 0

        conventionalChangelogCore({
            config: preset,
            outputUnreleased: true,
        })
            .on('error', function(err) {
                done(err)
            })
            .pipe(
                through(
                    function(chunk, enc, cb) {
                        chunk = chunk.toString()

                        expect(chunk).to.include('some more features')
                        expect(chunk).to.not.include('BREAKING')

                        i++
                        cb()
                    },
                    function() {
                        expect(i).to.equal(1)
                        done()
                    },
                ),
            )
    })

    it('should work with unknown host', function(done) {
        preparing(7)
        var i = 0

        conventionalChangelogCore({
            config: preset,
            pkg: {
                path: path.join(__dirname, 'fixtures/_unknown-host.json'),
            },
        })
            .on('error', function(err) {
                done(err)
            })
            .pipe(
                through(
                    function(chunk, enc, cb) {
                        chunk = chunk.toString()

                        // expect(chunk).to.include('(http://unknown/compare')
                        expect(chunk).to.include('](http://unknown/commits/')

                        i++
                        cb()
                    },
                    function() {
                        expect(i).to.equal(1)
                        done()
                    },
                ),
            )
    })

    it('should work specifying where to find a package.json using conventional-changelog-core', function(done) {
        preparing(8)
        var i = 0

        conventionalChangelogCore({
            config: preset,
            pkg: {
                path: path.join(__dirname, 'fixtures/_known-host.json'),
            },
        })
            .on('error', function(err) {
                done(err)
            })
            .pipe(
                through(
                    function(chunk, enc, cb) {
                        chunk = chunk.toString()

                        // expect(chunk).to.include(
                        //     '(https://github.com/conventional-changelog/example/compare'
                        // )
                        expect(chunk).to.include(
                            '](https://github.com/conventional-changelog/example/commit/',
                        )
                        expect(chunk).to.include(
                            '](https://github.com/conventional-changelog/example/issues/',
                        )

                        i++
                        cb()
                    },
                    function() {
                        expect(i).to.equal(1)
                        done()
                    },
                ),
            )
    })

    // it('should fallback to the closest package.json when not providing a location for a package.json', function (done) {
    //     preparing(8)
    //     var i = 0

    //     conventionalChangelogCore({
    //         config: preset,
    //     })
    //         .on('error', function (err) {
    //             done(err)
    //         })
    //         .pipe(
    //             through(
    //                 function (chunk, enc, cb) {
    //                     chunk = chunk.toString()

    //                     expect(chunk).to.include(
    //                         '(https://github.com/stormwarning/zazen-conventional-changelog/compare'
    //                     )
    //                     expect(chunk).to.include(
    //                         '](https://github.com/stormwarning/zazen-conventional-changelog/commit/'
    //                     )
    //                     expect(chunk).to.include(
    //                         '](https://github.com/stormwarning/zazen-conventional-changelog/issues/'
    //                     )

    //                     i++
    //                     cb()
    //                 },
    //                 function () {
    //                     expect(i).to.equal(1)
    //                     done()
    //                 }
    //             )
    //         )
    // })

    it('should support non public GitHub repository locations', function(done) {
        preparing(8)

        conventionalChangelogCore({
            config: preset,
            pkg: {
                path: path.join(__dirname, 'fixtures/_ghe-host.json'),
            },
        })
            .on('error', function(err) {
                done(err)
            })
            .pipe(
                through(function(chunk) {
                    chunk = chunk.toString()

                    expect(chunk).to.include(
                        '(https://github.internal.example.com/dlmr',
                    )
                    // expect(chunk).to.include(
                    //     '(https://github.internal.example.com/conventional-changelog/internal/compare'
                    // )
                    expect(chunk).to.include(
                        '](https://github.internal.example.com/conventional-changelog/internal/commit/',
                    )
                    expect(chunk).to.include(
                        '5](https://github.internal.example.com/conventional-changelog/internal/issues/5',
                    )
                    expect(chunk).to.include(
                        ' closes [#10](https://github.internal.example.com/conventional-changelog/internal/issues/10)',
                    )

                    done()
                }),
            )
    })

    // it('should only replace with link to user if it is a username', function (done) {
    //     preparing(9)

    //     conventionalChangelogCore({
    //         config: preset,
    //     })
    //         .on('error', function (err) {
    //             done(err)
    //         })
    //         .pipe(
    //             through(function (chunk) {
    //                 chunk = chunk.toString()

    //                 expect(chunk).to.not.include('(https://github.com/5')
    //                 expect(chunk).to.include('(https://github.com/username')

    //                 done()
    //             })
    //         )
    // })
})
