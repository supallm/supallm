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
          ts.isCallExpression(declaration.initializer!) &&
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

export const TypeScriptTypes = [
  "number",
  "string",
  "object",
  "boolean",
  "any",
  "void",
  "unknown",
  "undefined",
] as const;
export type TypeScriptType = (typeof TypeScriptTypes)[number];

export const parseCodeForInputs = (
  code: string,
): { type: string; name: string }[] => {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true,
  );

  const inputs: Array<{
    name: string;
    type: string;
  }> = [];

  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && node.name?.text === "main") {
      node.parameters.forEach((param) => {
        const name = param.name.getText();
        const typeNode = param.type;

        let type: TypeScriptType = "any";

        const typeText = typeNode?.getText() ?? "any";

        if (!typeNode) {
          inputs.push({ name, type: "any" });
          return;
        }

        console.log(
          "typeText",
          typeNode.getText(),
          ts.isArrayTypeNode(typeNode),
        );

        if (TypeScriptTypes.includes(typeText as TypeScriptType)) {
          inputs.push({ name, type: typeText as TypeScriptType });
          return;
        }

        if (ts.isTupleTypeNode(typeNode)) {
          const elementTypes = typeNode.elements
            .map((el) => el.getText())
            .join(", ");
          inputs.push({ name, type: `[${elementTypes}]` });
          return;
        }

        if (ts.isArrayTypeNode(typeNode)) {
          inputs.push({ name, type: "array" });
          return;
        }

        if (ts.isTypeLiteralNode(typeNode)) {
          inputs.push({ name, type: "object" });
          return;
        }

        if (ts.isUnionTypeNode(typeNode)) {
          const unionTypes = typeNode.types.map((t) => t.getText()).join(" | ");
          inputs.push({ name, type: unionTypes });
          return;
        }

        inputs.push({ name, type });
      });
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return inputs;
};

export const parseFunctionOutput = (
  code: string,
  functionName: string = "main",
): { keys: string[] } => {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true,
  );
  let keys: string[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && node.name?.text === "main") {
      if (node.body) {
        node.body.forEachChild((child) => {
          if (ts.isReturnStatement(child) && child.expression) {
            const returnExpr = child.expression;

            if (ts.isObjectLiteralExpression(returnExpr)) {
              keys = returnExpr.properties
                .map((prop) => {
                  if (
                    ts.isPropertyAssignment(prop) &&
                    ts.isIdentifier(prop.name)
                  ) {
                    return prop.name.text;
                  } else if (ts.isShorthandPropertyAssignment(prop)) {
                    return prop.name.text;
                  }
                  return "";
                })
                .filter(Boolean);
            }
          }
        });
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return { keys };
};

export const validateMainFunctionExists = (code: string): boolean => {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true,
  );

  let mainFunctionExists = false;

  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && node.name?.text === "main") {
      mainFunctionExists = true;
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return mainFunctionExists;
};
