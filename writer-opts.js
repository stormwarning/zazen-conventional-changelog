'use strict'

const resolve = require(`path`).resolve

const compareFunc = require(`compare-func`)
const Q = require(`q`)
const capitalize = require('lodash.capitalize')
const availableTypes = require('@zazen/commit-types').types

const readFile = Q.denodeify(require(`fs`).readFile)

const sections = {
    major: 'a',
    minor: 'b',
    patch: 'c',
    other: 'd',
}

function getWriterOpts () {
    return {
        transform: (commit, context) => {
            const issues = []
            const currentEmoji = commit.emoji

            let emojiLength

            // if (availableTypes) {
            //     console.log('object →', availableTypes[currentEmoji])
            // }

            if (!commit.emoji || typeof commit.emoji !== `string`) {
                return
            }

            commit.notes.forEach((note) => {
                note.title = `BREAKING CHANGES`
            })

            if (availableTypes[currentEmoji]) {
                commit.type =
                    capitalize(availableTypes[currentEmoji].level) + ' changes'
                commit.section = sections[availableTypes[currentEmoji].level]
            } else {
                commit.type = 'Other changes'
                commit.section = 'd'
            }

            if (commit.scope === `*`) {
                commit.scope = ``
            }

            commit.emoji = commit.emoji.substring(0, 72)
            emojiLength = commit.emoji.length

            if (typeof commit.hash === `string`) {
                commit.hash = commit.hash.substring(0, 7)
            }

            if (typeof commit.subject === `string`) {
                commit.subject = commit.subject.substring(0, 72 - emojiLength)

                let url = context.repository
                    ? `${context.host}/${context.owner}/${context.repository}`
                    : context.repoUrl

                if (url) {
                    url = `${url}/issues/`
                    // Issue URLs.
                    commit.subject = commit.subject.replace(
                        /#([0-9]+)/g,
                        (_, issue) => {
                            issues.push(issue)
                            return `[#${issue}](${url}${issue})`
                        },
                    )
                }

                if (context.host) {
                    // User URLs.
                    commit.subject = commit.subject.replace(
                        /\B@([a-z0-9](?:-?[a-z0-9]){0,38})/g,
                        `[@$1](${context.host}/$1)`,
                    )
                }
            }

            // Remove references that already appear in the subject.
            commit.references = commit.references.filter((reference) => {
                if (issues.indexOf(reference.issue) === -1) {
                    return true
                }

                return false
            })

            return commit
        },
        groupBy: `type`,
        commitGroupsSort: `title`,
        commitsSort: [`scope`, `emoji`, `subject`],
        noteGroupsSort: `emoji`,
        notesSort: compareFunc,
    }
}

module.exports = Q.all([
    readFile(resolve(__dirname, `./templates/template.hbs`), `utf-8`),
    readFile(resolve(__dirname, `./templates/header.hbs`), `utf-8`),
    readFile(resolve(__dirname, `./templates/commit.hbs`), `utf-8`),
    readFile(resolve(__dirname, `./templates/footer.hbs`), `utf-8`),
]).spread((template, header, commit, footer) => {
    const writerOpts = getWriterOpts()

    writerOpts.mainTemplate = template
    writerOpts.headerPartial = header
    writerOpts.commitPartial = commit
    writerOpts.footerPartial = footer

    return writerOpts
})
