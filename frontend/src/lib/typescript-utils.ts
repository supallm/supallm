import * as ts from "typescript";

export const parseCodeForRequiredModules = (code: string) => {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true,
  );

  const modules: string[] = [];

  const visit = (node: ts.Node) => {
    // Handle ES Module imports
    if (ts.isImportDeclaration(node)) {
      const moduleName = (node.moduleSpecifier as ts.StringLiteral).text;
      modules.push(moduleName);
    }

    // Handle CommonJS require statements
    if (
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.length > 0
    ) {
      node.declarationList.declarations.forEach((declaration) => {
        if (
          ts.isCallExpression(declaration.initializer) &&
          ts.isIdentifier(declaration.initializer.expression) &&
          declaration.initializer.expression.text === "require" &&
          declaration.initializer.arguments.length === 1 &&
          ts.isStringLiteral(declaration.initializer.arguments[0])
        ) {
          modules.push(declaration.initializer.arguments[0].text);
        }
      });
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return modules;
};

export const parseCodeForInputs = (code: string) => {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true,
  );

  const inputs: Array<{
    name: string;
    type: "number" | "string" | "object";
  }> = [];

  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && node.name?.text === "main") {
      node.parameters.forEach((param) => {
        const name = param.name.getText();
        const typeNode = param.type;
        let type: "number" | "string" | "object" = "string"; // default type

        if (typeNode) {
          const typeText = typeNode.getText();
          if (
            typeText === "number" ||
            typeText === "string" ||
            typeText === "object"
          ) {
            type = typeText as "number" | "string" | "object";
          }
        }

        inputs.push({ name, type });
      });
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return inputs;
};
