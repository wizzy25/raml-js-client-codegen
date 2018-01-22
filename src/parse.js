const raml2obj = require('raml2obj');

// Flatten the methods in the resources
function flattenMethods(resource) {
  const { methods, ...restResource } = resource;
  return methods.map((method) => {
    return { ...method, ...restResource };
  });
}

// Flatten the resources recursively
function flattenResources({ resources }) {
  let tempResources = [];
  const endPoints = [];

  const recursiveFlat = (resources) => {
    resources.forEach((resource) => {
      const { resources, ...flatResource } = resource;
      endPoints.push(`${resource.parentUrl}${resource.relativeUri}`);
      tempResources = [...tempResources, ...flattenMethods(flatResource)];
      if (resources) recursiveFlat(resources);
    });
    return { resources: tempResources, endPoints };
  };
  return recursiveFlat(resources);
}


// Parse RAML spec to javascript object
export default async function parser(ramlFile) {
  try {
    const apiSpec = await raml2obj.parse(ramlFile);
    const flatAPI = { ...apiSpec, ...flattenResources(apiSpec) };
    return flatAPI;
  } catch (error) {
    process.stderr.write(error.toString());
    process.stderr.write(error.stack);
    return error;
  }
}