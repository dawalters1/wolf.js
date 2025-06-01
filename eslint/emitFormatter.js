export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce multiline formatting for websocket .emit calls',
    },
    fixable: 'whitespace',
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === 'MemberExpression' &&
          callee.property.name === 'emit' &&
          node.arguments.length === 2 &&
          node.arguments[1].type === 'ObjectExpression'
        ) {
          const sourceCode = context.getSourceCode();
          const [commandArg, dataArg] = node.arguments;

          const emitToken = sourceCode.getFirstToken(callee); // `.emit`
          const openParen = sourceCode.getTokenAfter(callee, { filter: t => t.value === '(' });
          const closeParen = sourceCode.getLastToken(node); // `)`
          const emitLine = emitToken.loc.start.line;
          const openParenLine = openParen.loc.start.line;

          // 1. Ensure `.emit(` is on same line
          if (emitLine !== openParenLine) {
            context.report({
              node: openParen,
              message: 'The opening parenthesis must be on the same line as `.emit`.',
              fix: (fixer) => {
                const beforeParen = sourceCode.getText().slice(
                  sourceCode.getIndexFromLoc(emitToken.loc.end),
                  sourceCode.getIndexFromLoc(openParen.loc.start)
                );
                if (beforeParen.trim() === '') {
                  return fixer.replaceTextRange(
                    [emitToken.range[1], openParen.range[0]],
                    ''
                  );
                }
                return null;
              },
            });
          }

          // 2. Ensure commandArg is on its own line
          if (commandArg.loc.start.line === openParen.loc.start.line) {
            context.report({
              node: commandArg,
              message: 'The command argument must be on a new line.',
              fix: (fixer) => fixer.insertTextBefore(commandArg, '\n'),
            });
          }

          // 3. Ensure dataArg is on its own line
          if (dataArg.loc.start.line === commandArg.loc.end.line) {
            context.report({
              node: dataArg,
              message: 'The data object must be on a new line.',
              fix: (fixer) => fixer.insertTextBefore(dataArg, '\n'),
            });
          }

          // 4. Ensure closing paren is on its own line
          const lastArg = node.arguments[1];
          if (closeParen.loc.start.line === lastArg.loc.end.line) {
            context.report({
              node: closeParen,
              message: 'The closing parenthesis must be on its own line.',
              fix: (fixer) => fixer.insertTextBefore(closeParen, '\n'),
            });
          }

          // 5. Ensure headers/body are multiline
          for (const prop of dataArg.properties) {
            if (
              prop.type === 'Property' &&
              (prop.key.name === 'headers' || prop.key.name === 'body') &&
              prop.value.type === 'ObjectExpression'
            ) {
              const text = sourceCode.getText(prop.value);
              const isSingleLine = text.split('\n').length === 1;

              if (isSingleLine) {
                context.report({
                  node: prop.value,
                  message: `The "${prop.key.name}" object must be multiline formatted.`,
                  fix: (fixer) => {
                    const inner = prop.value.properties.map(p =>
                      `  ${sourceCode.getText(p)},\n`
                    ).join('');
                    return fixer.replaceText(
                      prop.value,
                      `{\n${inner}}`
                    );
                  }
                });
              }
            }
          }
        }
      }
    };
  }
};
