#! /usr/bin/env node

const cmd = require('./cmd')
const release = require('./release')

release(cmd.argv).catch(() => {
    process.exit(1)
})
