'use strict'

module.exports = {
    headerPattern: /^(.{1})(?:\((.*)\))?: (.*)$/u,
    headerCorrespondence: [`emoji`, `scope`, `message`],
    noteKeywords: [`BREAKING CHANGE`, `BREAKING CHANGES`, `💣`],
    revertPattern: /^⏪\s([\s\S]*?)\s*This reverts commit (\w*)\./u,
    revertCorrespondence: [`header`, `hash`],
}
