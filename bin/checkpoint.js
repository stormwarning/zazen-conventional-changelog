const util = require('util')

const chalk = require('chalk')
const figures = require('figures')

module.exports = function (argv, msg, args, figure) {
    const defaultFigure = args.dryRun
        ? chalk.yellow(figures.tick)
        : chalk.green(figures.tick)

    if (!argv.silent) {
        // eslint-disable-next-line no-console
        console.info(
            (figure || defaultFigure) +
                ' ' +
                util.format.apply(
                    util,
                    [msg].concat(
                        args.map(function (arg) {
                            return chalk.bold(arg)
                        }),
                    ),
                ),
        )
    }
}
