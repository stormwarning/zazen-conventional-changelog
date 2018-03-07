'use strict'

const Q = require(`q`)
const readFile = Q.denodeify(require(`fs`).readFile)
const resolve = require(`path`).resolve

function getWriterOpts () {
    return {
        transform: (commit, context) => {
            let emojiLength
            let discard = true
            const issues = []

            commit.notes.forEach((note) => {
                note.title = `:bomb:`
                discard = false
            })

            if (!commit.emoji || typeof commit.emoji !== `string`) {
                return
            }

            if (commit.emoji === `feat`) {
                commit.type = `Features`
            } else if (commit.type === `fix`) {
                commit.type = `Bug Fixes`
            } else if (commit.type === `perf`) {
                commit.type = `Performance Improvements`
            } else if (commit.type === `revert`) {
                commit.type = `Reverts`
            } else if (discard) {
                return
            } else if (commit.type === `docs`) {
                commit.type = `Documentation`
            } else if (commit.type === `style`) {
                commit.type = `Styles`
            } else if (commit.type === `refactor`) {
                commit.type = `Code Refactoring`
            } else if (commit.type === `test`) {
                commit.type = `Tests`
            } else if (commit.type === `chore`) {
                commit.type = `Chores`
            }

            commit.emoji = commit.emoji.substring(0, 72)
            emojiLength = commit.emoji.length

            if (typeof commit.hash === `string`) {
                commit.hash = commit.hash.substring(0, 7)
            }

            if (typeof commit.subject === `string`) {
                commit.subject = commit.subject.substring(0, 72 - emojiLength)
            }

            return commit
        },
        groupBy: `emoji`,
        commitGroupsSort: `title`,
        commitsSort: [`emoji`, `subject`],
    }
}

module.exports = Q.all([
    readFile(resolve(__dirname, `./templates/template.hbs`), `utf-8`),
    readFile(resolve(__dirname, `./templates/header.hbs`), `utf-8`),
    readFile(resolve(__dirname, `./templates/commit.hbs`), `utf-8`),
]).spread((template, header, commit) => {
    const writerOpts = getWriterOpts()

    writerOpts.mainTemplate = template
    writerOpts.headerPartial = header
    writerOpts.commitPartial = commit

    return writerOpts
})
