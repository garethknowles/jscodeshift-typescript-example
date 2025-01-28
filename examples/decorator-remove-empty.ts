import { API, FileInfo } from "jscodeshift";

const decoratorNames = ["withStorybookApolloProvider"];

export default function transformer(fileInfo: FileInfo, api: API) {
  const index = api.jscodeshift;
  const root = index(fileInfo.source);

  root.find(index.ObjectExpression).forEach((path) => {
    const decoratorsProperty = path.value.properties.find(
      (prop) =>
        prop.key.name === "decorators" &&
        prop.value.elements.some(
          (element) =>
            element.type === "CallExpression" &&
            element.callee.name === "withStorybookApolloProvider"
        )
    );
    if (
      decoratorsProperty &&
      decoratorsProperty.value.type === "ArrayExpression"
    ) {
      decoratorsProperty.value.elements =
        decoratorsProperty.value.elements.filter((element) => {
          if (
            element.type === "CallExpression" &&
            element.callee.name === "withStorybookApolloProvider"
          ) {
            return element.arguments.length > 0;
          }
          return true;
        });

      if (decoratorsProperty.value.elements.length === 0) {
        path.value.properties = path.value.properties.filter(
          (prop) => prop !== decoratorsProperty
        );
      }
    }
  });

  return root.toSource();
}
