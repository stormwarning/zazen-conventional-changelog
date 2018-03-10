const fs = require('fs')

const chalk = require('chalk')
const conventionalChangelog = require('conventional-changelog')
const accessSync = require('fs-access').sync

const checkpoint = require('./checkpoint')
const writeFile = require('./write-file')
const config = require('../index')

module.exports = function release (args, newVersion) {
    if (args.skip.changelog) return Promise.resolve()

    return outputChangelog(args, newVersion)
}

function outputChangelog (args, newVersion) {
    return new Promise((resolve, reject) => {
        createIfMissing(args)

        var header = `# Change Log

[![Keep a Changelog][img-changelog]][url-changelog]
[![Semantic Versioning][img-semver]][url-semver]

All notable changes to this project will be documented in this file.
`

        var oldContent = args.dryRun
            ? ''
            : fs.readFileSync(args.infile, 'utf-8')

        // find the position of the last release and remove header:
        if (oldContent.indexOf('<a name=') !== -1) {
            oldContent = oldContent.substring(oldContent.indexOf('<a name='))
        }

        var content = ''
        var context

        if (args.dryRun) context = { version: newVersion }

        var changelogStream = conventionalChangelog(
            {
                // preset: 'angular',
                config,
            },
            context,
            { merges: null },
        ).on('error', function (err) {
            return reject(err)
        })

        changelogStream.on('data', function (buffer) {
            content += buffer.toString()
        })

        changelogStream.on('end', function () {
            checkpoint(args, 'outputting changes to %s', [args.infile])

            if (args.dryRun) {
                // eslint-disable-next-line no-console
                console.info(`\n---\n${chalk.gray(content.trim())}\n---\n`)
            } else {
                writeFile(
                    args,
                    args.infile,
                    header +
                        '\n' +
                        (content + oldContent).replace(/\n+$/, '\n'),
                )
            }

            return resolve()
        })
    })
}

function createIfMissing (args) {
    try {
        accessSync(args.infile, fs.F_OK)
    } catch (err) {
        if (err.code === 'ENOENT') {
            checkpoint(args, 'created %s', [args.infile])
            args.outputUnreleased = true
            writeFile(args, args.infile, '\n')
        }
    }
}
