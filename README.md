# raml-js-client-codegen

Generate a JavaScript client from a RAML API specification

## Installation
`npm install raml-js-client-codegen -g`

## How it works
```bash
Usage: raml-js-client-codegen [options]
A module to generate javascript clients from RAML API specification

Options:
  --help        Show help text.                              [boolean]
  --version     Show version number                          [boolean]
  --input, -i   Path to RAML input specification file       [required]
  --output, -o  Path to JS file to write generated client.
                                                   [default: "stdout"]
  --env, -e     The environment for which the client will run.
                        [choices: "node", "browser"] [default: "node"]
```

Simply pass in parameters as flags:

`raml-js-client-codegen --input /path/to/api-spec.raml --output /path/to/client.js --env node`

## Important
This is still a work in progress, and although usable, the API may constantly change in the near future.

## Contributing
Issues and pull requests are more than always welcome :-)
