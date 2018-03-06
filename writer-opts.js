'use strict'

const Q = require(`q`)
const readFile = Q.denodeify(require(`fs`).readFile)
const resolve = require(`path`).resolve

function getWriterOpts () {
    return {
        transform: (commit, context) => {
            let emojiLength

            if (!commit.emoji || typeof commit.emoji !== `string`) {
                return
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
