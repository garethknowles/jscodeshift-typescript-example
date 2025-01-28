// find ../native -iname '*.stories.*' -print | xargs npx jscodeshift -t ./examples/decorator-before-each.ts --extensions=ts,tsx --parser=tsx --print --dry

import { API, ASTPath, FileInfo } from "jscodeshift";

const decoratorNames = ["withStorybookApolloProvider", "withApolloMocks"];
// const decoratorNames = ["withApolloMocks", "withSuccessfulRecoveryMocks", "withSuccessfulBiometricsMocks", "withOnboardingLimitedCompanyMocks", "withOnboardingSoleTraderWithTddMocks", "withOnboardingSoleTraderMocks", "withMocks", "withBannerMock", "withOutboundTransactionTypeMocks", "withCreateQuote", "withEditQuote", "withAcceptQuote", "withDeleteQuote", "withConvertQuote", "withMockFetch", "withNavigate", "withNavigateOnAppStart"];

export default function transformer(fileInfo: FileInfo, api: API) {
  const index = api.jscodeshift;
  const root = index(fileInfo.source);

  root
    .find(index.ObjectProperty, {
      key: {
        name: "decorators",
      },
    })
    .forEach((decoratorsPath) => {
      const decoratorsPropIndex = index(decoratorsPath);
      const decorators: ASTPath[] = decoratorsPropIndex
        .find(index.Identifier)
        .paths()
        .map((path) => {
          if (path.parentPath.value.type === "CallExpression") {
            return path.parentPath;
          }

          return path;
        })
        .filter((path) => {
          if (path.parentPath.value.type === "ObjectProperty") {
            return false;
          }
          if (path.node?.callee?.type === "Identifier") {
            return decoratorNames.includes(path.node.callee.name);
          }

          return decoratorNames.includes(path.node.value);
        });

      if (decorators.length === 0) {
        return;
      }

      const objectIndex = index(decoratorsPath.parentPath);
      const beforeEachPath = objectIndex.find(index.ObjectProperty, {
        key: {
          name: "beforeEach",
        },
      });

      if (beforeEachPath.length === 0) {
        decoratorsPropIndex.insertBefore(
          index.objectProperty(
            index.identifier("beforeEach"),
            index.arrayExpression([])
          )
        );
      }

      let customerContextToAdd = undefined;

      objectIndex
        .find(index.ObjectProperty, {
          key: {
            name: "beforeEach",
          },
        })
        .forEach((path) => {
          const beforeEachArray = index(path).find(index.ArrayExpression).at(0);
          const elements = beforeEachArray.get("elements");

          decorators.forEach((decorator) => {
            let newNode = decorator.node;
            if ("callee" in newNode && "name" in newNode.callee) {
              newNode.callee.name = "mockGraphQL";
            }
            if ("arguments" in newNode) {
              let mocks = undefined;

              newNode.arguments.forEach((arg) => {
                if ("properties" in arg) {
                  arg.properties.forEach((prop) => {
                    if ("key" in prop && prop.key.type === "Identifier") {
                      if (
                        (prop.key.name === "mocks" || prop.key.name === "operationMocks") &&
                        prop.type === "ObjectProperty"
                      ) {
                        mocks = prop.value;
                      } else if (prop.key.name === "customerContext") {
                        customerContextToAdd = prop;
                      }
                    }
                  });
                }
              });

              if (mocks) {
                newNode.arguments = [mocks];
                elements.push(newNode);
              }
            }

            index(decorator).remove();
          });
        });


      const decoratorsPath2 = objectIndex.find(index.ObjectProperty, {
        key: {
          name: "decorators",
        },
      });
      if (decoratorsPath2.find(index.ArrayExpression).at(0).nodes().at(0)?.elements.length === 0) {
        decoratorsPath2.remove();
      }

      const beforeEachPath2 = objectIndex.find(index.ObjectProperty, {
        key: {
          name: "beforeEach",
        },
      });
      if (beforeEachPath2.find(index.ArrayExpression).at(0).nodes().at(0)?.elements.length === 0) {
        beforeEachPath2.remove();
      }

      if (customerContextToAdd) {
        const argsPath = objectIndex.find(index.ObjectProperty, {
          key: {
            name: "args",
          },
        });

        if (argsPath.length === 0) {
          decoratorsPropIndex.insertAfter(
            index.objectProperty(
              index.identifier("args"),
              index.objectExpression([customerContextToAdd])
            )
          );
        } else {
          const argPath = argsPath.at(0);
          const existingArgs = argPath.nodes()[0].value;
          if ('properties' in existingArgs){
            argPath.replaceWith(
              index.objectProperty(
                index.identifier("args"),
                index.objectExpression([...existingArgs.properties, customerContextToAdd])
              )
            );
          }

        }
      }
    });

  // Replace the import statement
  root
    .find(index.ImportDeclaration)
    .filter(
      (path) =>
        path.node.source.value ===
          "~/../storybook/withRootDecorator/withStorybookApolloProvider" ||
        path.node.source.value ===
          "../withRootDecorator/withStorybookApolloProvider"
    )
    .forEach((path) => {
      path.node.source.value = "~/../storybook/mocking/mockGraphQL";
      if (path.node.specifiers?.[0]?.local) {
        path.node.specifiers[0].local.name = "mockGraphQL";
      }
    });

  return root.toSource();
}
