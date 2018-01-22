const fs = require('fs');
const Handlebars = require('handlebars');
const parser = require('./parse');

Handlebars.registerHelper('toUpperCase', (str) => {
  return str.toUpperCase();
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
        `url = url.replace('{${placeholder}}', parameters['${placeholder}'])`,
      );
    });
  }
  return opts.fn(statements);
});

/* options is an object having the following properties
 * - input {String}: path to the RAML specification file
 * - template {String}: name of template (defaults to `default`)
 * - output {String}: path to location where to write generated file
**/
export default async function generator(options) {
  // Get a parsed JS object from RAML specification file
  let jsApi;
  try {
    jsApi = await parser(options.input);
    const template = fs.readFileSync(
      `../templates/${options.template || 'default'}.handlebars`,
      'utf8',
    );
    const compiledTemplate = Handlebars.compile(template, { noEscape: true });
    const outputPath = options.output.endsWith('.js')
      ? options.output
      : `${options.output}.js`;
    fs.writeFileSync(outputPath, compiledTemplate(jsApi));
  } catch (error) {
    // Handle errors
    console.log(error);
  }

}
