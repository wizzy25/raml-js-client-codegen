const fs = require('fs');
const Handlebars = require('handlebars');
const parser = require('./parse');

Handlebars.registerHelper('toUpperCase', (str) => {
  return str.toUpperCase();
});

Handlebars.registerHelper('parseBaseUri', ({
  baseUri,
  baseUriParameters,
  version
}, opts) => {
  const statements = [];
  if (!baseUriParameters)
    statements.push(`this.baseUri = '${baseUri}'`);
  else {
    if (baseUri.includes('{version}'))
      statements.push(`this.baseUri = '${
        baseUri.replace('{version}', version)}'`);
    else
      statements.push(`this.baseUri = '${baseUri}'`);

    const placeholders = baseUri.split('{')
      .filter((v) => v.indexOf('}') > -1)
      .map((value) => value.split('}')[0]);

    if (placeholders.length)
      placeholders.forEach((placeholder) => {
        if (placeholder === 'version')
          statements.push(`this.baseUri = '${
            baseUri.replace('{version}', version)}'`);
        else
          statements.push(`this.baseUri = this.baseUri.replace('{${
            placeholder}}', options.parameters['${placeholder}'])`,
          );
      });
  }
  return opts.fn(statements);
});

Handlebars.registerHelper('parseHeaders', ({ headers }, opts) => {
  if (!headers)
    return null;

  const statements = [];
  headers.forEach(({ name, required }) => {
    if (required === true) {
      statements.push(`if (!parameters['${name}']) {`);
      statements.push(`  return Promise.reject(new Error('Missing required header: ${name}'))`);
      statements.push('}');
    }
    statements.push(`headers['${name}'] = parameters['${name}']`);
  });
  return opts.fn(statements);
});

Handlebars.registerHelper('parseUri', (
  { absoluteUri, uriParameters },
  opts
) => {
  if (!uriParameters)
    return null;
  const placeholders = absoluteUri.split('{')
    .filter((v) => v.indexOf('}') > -1)
    .map((value) => value.split('}')[0]);
  const statements = [];
  if (placeholders.length) {
    statements.push['\n'];
    placeholders.forEach((placeholder) => {

      uriParameters.forEach(({ name, required }) => {
        if (name === placeholder)
          if (required === true) {
            statements.push(`if (!parameters['${placeholder}']) {`);
            statements.push(
              '  return Promise.reject(new Error('
              + `'Missing required URI parameter: ${placeholder}'))`);
            statements.push('}');
          }

      });

      statements.push(
        `path = path.replace('{${placeholder}}', parameters['${placeholder}'])`,
      );
    });
  }
  return opts.fn(statements);
});

Handlebars.registerHelper('parseQuery', ({ queryParameters }, opts) => {
  if (!queryParameters)
    return null;
  const statements = [];
  queryParameters.forEach(({ name, required }) => {
    if (required === true) {
      statements.push(`if (!parameters['${name}']) {`);
      statements.push(
        '  return Promise.reject(new Error('
        + `'Missing required query parameter: ${name}'))`
      );
      statements.push('}');
    }
  });
  statements.push(
    'const queryString = this._buildQuery(parameters, queryParameters)',
  );
  statements.push('path = `${path}?${queryString}`');
  return opts.fn(statements);
});

Handlebars.registerHelper('parseBody', ({ body }, opts) => {
  if (!body)
    return null;

  const statements = [];
  statements.push('const { body = {} } = parameters');
  statements.push(`headers['Accept'] = '${(body[0].key)}'`);
  statements.push(`headers['Content-Type'] = '${(body[0].key)}'`);
  return opts.fn(statements);
});

/* options is an object having the following properties
 * - input {String}: path to the RAML specification file
 * - template {String}: name of template (defaults to `default`)
 * - output {String}: path to location where to write generated file
**/
async function generator({ env, input, output, templatePath }) {
  // Get a parsed JS object from RAML specification file
  try {
    const isNode = env === 'node' ? true : false
    const jsApi = await parser(input);
    const template = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = Handlebars.compile(template, { noEscape: true });
    output.write(compiledTemplate({ ...jsApi, isNode }));
    return 'Success';
  } catch(error) {
    throw error;
  }
}

module.exports = generator;
