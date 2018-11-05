'use strict'

/**
 * Requires Unicode-aware regex in ES6. Fallbacks are:
 *
 * headerPattern: /^((?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){1})(?:\((.*)\):)? (.*)$/,
 * revertPattern: /^\u23EA\s([\s\S]*?)\s*This reverts commit (\w*)\./,
 */
module.exports = {
    headerPattern: /^(.{1})(?:\((.*)\):)? (.*)$/u,
    headerCorrespondence: [`emoji`, `scope`, `message`],
    noteKeywords: [`BREAKING CHANGE`, `BREAKING CHANGES`, `💣`],
    revertPattern: /^⏪\s([\s\S]*?)\s*This reverts commit (\w*)\./u,
    revertCorrespondence: [`header`, `hash`],
}
