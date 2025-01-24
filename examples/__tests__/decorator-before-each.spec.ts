import { defineTest } from "jscodeshift/src/testUtils";

describe("decorator-before-each", () => {
  defineTest(
    __dirname,
    "./decorator-before-each",
    null,
    "decorator-before-each/with-before-each",
    { parser: "tsx" }
  );
});
