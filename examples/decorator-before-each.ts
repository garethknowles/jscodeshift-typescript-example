// find ../native -iname '*.stories.*' -print | xargs npx jscodeshift -t ./examples/decorator-before-each.ts --extensions=ts,tsx --parser=tsx --print --dry

import { API, FileInfo } from "jscodeshift";

const decoratorNames = ["withUser", "withActiveUser", "withNoUser", "withOnboardingUser"];
// const decoratorNames = ["withApolloMocks", "withSuccessfulRecoveryMocks", "withSuccessfulBiometricsMocks", "withOnboardingLimitedCompanyMocks", "withOnboardingSoleTraderWithTddMocks", "withOnboardingSoleTraderMocks", "withMocks", "withBannerMock", "withOutboundTransactionTypeMocks", "withCreateQuote", "withEditQuote", "withAcceptQuote", "withDeleteQuote", "withConvertQuote", "withMockFetch", "withNavigate", "withNavigateOnAppStart"];

const exclude = ["withRemoteConfigFromArgs", "withMockFeaturesFromArgs", "withFeaturesProvider", "withFeaturesProviderOptimizely", "withController", "withExcludePlatform", "withGestureHandlerRootView", "withMettleDatePickerProvider"]

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
      const decorators = decoratorsPropIndex
        .find(index.Identifier)
        .paths()
        .map((path) => {
          if (path.parentPath.value.type === "CallExpression") {
            return path.parentPath;
          }

          return path
        })
        .filter((path) => {
          if (path.parentPath.value.type === "ObjectProperty") {
            return false
          }
          if (path.node?.callee?.type === "Identifier") {
            return !exclude.includes(path.node.callee.name);
          }

          return !exclude.includes(path.node.value);
        })

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
            elements.push(decorator.node);
            index(decorator).remove();
          });

          const decoratorsArray = decoratorsPropIndex
            .find(index.ArrayExpression)
            .at(0);

          if (decoratorsArray.get("elements").value.length === 0) {
            decoratorsPropIndex.remove();
          }
        });
    });

  return root.toSource();
}
