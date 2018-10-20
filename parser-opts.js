'use strict'

module.exports = {
    headerPattern: /^(:.*?:)(?:\((.*)\))?:?( )(.*)$/,
    headerCorrespondence: [`emoji`, `scope`, `section`, `subject`],
    noteKeywords: [`BREAKING CHANGE`, `BREAKING CHANGES`, `:bomb:`],
    revertPattern: /^:rewind:\s([\s\S]*?)\s*This reverts commit (\w*)\./,
    revertCorrespondence: [`header`, `hash`],
}
