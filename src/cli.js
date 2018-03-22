const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const generator = require('./generator');
const { name, description } = require('../package.json');

process.title = name;

const args = yargs
  .usage(
    `Usage: $0 [options]
${description}`
  )
  .showHelpOnFail(true)
  .option('help', {
    alias: 'h',
  })
  .help('help', 'Show help text.')
  .version()
  .option('input', {
    alias: 'i',
    describe: 'Path to RAML input specification file',
    demand: true,
  })
  .coerce('input', arg => {
    if (fs.existsSync(arg)) return String(arg)
    throw new Error('Input file cannot be reached or does not exist');
  })
  .option('output', {
    alias: 'o',
    default: 'stdout',
    describe: 'Path to JS file to write generated client.',
  })
  .coerce('output', arg => {
    if (arg !== 'stdout') {
      return fs.createWriteStream(String(arg.endsWith('.js')
        ? arg : `${arg}.js`))
    }
    return process.stdout;
  })
  .option('env', {
    alias: 'e',
    default: 'node',
    choices: ['node', 'browser'],
    describe: 'The environment for which the client will run.',
  }).argv

async function execute({ env, input, output }) {
  const options = {
    env,
    input,
    output,
    templatePath: path.join(__dirname, '../templates/default.handlebars')
  };
  try {
    await generator(options);
    console.log('Client successfully generated to output file');
  } catch(error) {
    console.error('Error occured while generaring client');
    console.error(error);
  }
}

execute(args);
