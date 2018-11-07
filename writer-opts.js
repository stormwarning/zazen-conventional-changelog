'use strict'

const resolve = require(`path`).resolve

const compareFunc = require(`compare-func`)
const Q = require(`q`)
const capitalize = require('lodash.capitalize')
const availableTypes = require('@zazen/commit-types').types

const readFile = Q.denodeify(require(`fs`).readFile)

const typeGroups = [
    'Removed',
    'Deprecated',
    'Changed',
    'Added',
    'Fixed',
    'Security',
]

function buildCompareUrl (context) {
    let { repository, repoUrl, previousTag, currentTag } = context

    let host = context.host ? `${context.host}/` : ''
    let owner = context.owner ? `${context.owner}/` : ''
    let urlBase = repository ? `${host}${owner}${repository}` : repoUrl
    let compare = `/compare/${previousTag}...${currentTag}`

    return `[${context.version}](${urlBase}${compare})`
}

function buildCommitUrl (commit, context) {
    let { hash } = commit
    let { repository, repoUrl } = context

    let host = context.host ? `${context.host}/` : ''
    let owner = context.owner ? `${context.owner}/` : ''
    let urlBase = repository ? `${host}${owner}${repository}` : repoUrl
    let tail = `/${context.commit}/${hash}`

    return `([${hash}](${urlBase}${tail}))`
}

function buildCommitRefs (commit, context) {
    let { references } = commit
    let { repository, repoUrl, linkReferences } = context

    let host = context.host ? `${context.host}/` : ''
    let owner = context.owner ? `${context.owner}/` : ''
    let commitRefs = references
        .map((ref) => {
            let { issue } = ref

            let refRepo = ref.repository || ''
            let refOwner = ref.owner ? `${ref.owner}/` : ''
            let refIssue = `${refOwner}${refRepo}#${issue}`
            let urlBase = repository ? `${host}` : repoUrl
            let refUrl = refRepo
                ? `${refOwner}${refRepo}`
                : `${owner}${repository}`

            return linkReferences
                ? `[${refIssue}](${urlBase}${refUrl}/${context.issue}/${issue})`
                : refIssue
        })
        .join(' ')

    return `, closes ${commitRefs}`
}

function getWriterOpts () {
    return {
        /**
         * Prepare template strings here so there isn't a bunch of
         * conditional blocks inside the Markdown template.
         */
        finalizeContext: (context) => {
            let compareUrl = buildCompareUrl(context)
            let headingVersion = context.linkCompare
                ? `${compareUrl}`
                : `${context.version}`
            let headingTitle = context.title ? ` “${context.title}”` : ''
            let headingDate = context.date ? ` — ${context.date}` : ''

            context.releaseTitle = `## ${headingVersion}${headingTitle}${headingDate}`

            return context
        },
        transform: (commit, context) => {
            let currentEmoji = commit.emoji
            let issues = []
            let emojiLength

            if (!commit.emoji || typeof commit.emoji !== `string`) {
                return
            }

            commit.notes.forEach((note) => {
                note.title = `BREAKING CHANGES`
            })

            if (availableTypes[currentEmoji]) {
                commit.type = capitalize(availableTypes[currentEmoji].group)
            } else {
                commit.type = 'Other updates'
            }

            if (commit.scope === `*`) {
                commit.scope = ``
            }

            commit.emoji = commit.emoji.substring(0, 72)
            emojiLength = commit.emoji.length

            if (typeof commit.hash === `string`) {
                commit.hash = commit.hash.substring(0, 7)
            }

            if (typeof commit.message === `string`) {
                commit.message = commit.message.substring(0, 72 - emojiLength)

                let url = context.repository
                    ? `${context.host}/${context.owner}/${context.repository}`
                    : context.repoUrl

                if (url) {
                    url = `${url}/issues/`
                    // Issue URLs.
                    commit.message = commit.message.replace(
                        /#([0-9]+)/g,
                        (_, issue) => {
                            issues.push(issue)
                            return `[#${issue}](${url}${issue})`
                        }
                    )
                }

                if (context.host) {
                    // User URLs.
                    commit.message = commit.message.replace(
                        /\B@([a-z0-9](?:-?[a-z0-9]){0,38})/g,
                        `[@$1](${context.host}/$1)`
                    )
                }
            }

            // Remove references that already appear in the message.
            commit.references = commit.references.filter((reference) => {
                if (issues.indexOf(reference.issue) === -1) {
                    return true
                }

                return false
            })

            let commitScope = commit.scope ? ` **${commit.scope}:**` : ''
            let commitMsg = commit.message || commit.header
            let commitHash = context.linkReferences
                ? buildCommitUrl(commit, context)
                : commit.hash
            let commitRefs = commit.references.length
                ? buildCommitRefs(commit, context)
                : ''
            let commitBody = commit.body ? ` \\\n  ${commit.body}` : ''

            commit.logString = `- ${currentEmoji}${commitScope} ${commitMsg} ${commitHash}${commitRefs}${commitBody}`

            return commit
        },
        groupBy: `type`,
        commitGroupsSort: typeGroups,
        commitsSort: [`scope`, `hash`, `message`],
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
    let writerOpts = getWriterOpts()

    writerOpts.mainTemplate = template
    writerOpts.headerPartial = header
    writerOpts.commitPartial = commit
    writerOpts.footerPartial = footer

    return writerOpts
})
