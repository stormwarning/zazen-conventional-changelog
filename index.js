'use strict'

const Q = require(`q`)

const conventionalChangelog = require(`./conventional-changelog`)
const recommendedBumpOpts = require(`./conventional-recommended-bump`)
const parserOpts = require(`./parser-opts`)
const writerOpts = require(`./writer-opts`)

function presetOpts (cb) {
    Q.all([
        conventionalChangelog,
        parserOpts,
        recommendedBumpOpts,
        writerOpts,
    ]).spread(
        (
            conventionalChangelog,
            parserOpts,
            recommendedBumpOpts,
            writerOpts
        ) => {
            cb(null, {
                conventionalChangelog,
                parserOpts,
                recommendedBumpOpts,
                writerOpts,
            })
        }
    )
}

module.exports = presetOpts
