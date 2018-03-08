'use strict'

module.exports = {
    whatBump: (commits) => {
        let level = 2
        let breakings = 0
        let features = 0

        commits.forEach((commit) => {
            if (commit.notes.length > 0) {
                breakings += commit.notes.length
                level = 0
            } else if (commit.emoji === `:gift:`) {
                features += 1
                if (level === 2) {
                    level = 1
                }
            }
        })

        return {
            level: level,
            reason: `There are ${breakings} BREAKING CHANGES and ${features} features`,
        }
    },

    parserOpts: {
        headerPattern: /^(:.*?:)(?:\((.*)\))?:? (.*)$/,
        headerCorrespondence: [`emoji`, `scope`, `subject`],
        noteKeywords: [`BREAKING CHANGE`, `BREAKING CHANGES`, `:bomb:`],
        revertPattern: /^:rewind:\s([\s\S]*?)\s*This reverts commit (\w*)\./,
        revertCorrespondence: [`header`, `hash`],
    },
}
