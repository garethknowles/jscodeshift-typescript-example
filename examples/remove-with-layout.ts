// find . -iname '*.stories.*' -print | xargs npx jscodeshift -t ./remove-with-layout.js --extensions=ts,tsx --parser=tsx --print --dry

import { API, FileInfo } from "jscodeshift";

export default function transformer(fileInfo: FileInfo, api: API) {
  const index = api.jscodeshift;
  const root = index(fileInfo.source);

  // Find all decorators called withLayout and remove them
  root
    .find(index.CallExpression, {
      callee: {
        name: "withLayout",
      },
    })
    .forEach((path) => {
      // Remove the decorator
      index(path).remove();
    });

  return root.toSource();
}
