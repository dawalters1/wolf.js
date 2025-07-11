// ChatGPT speciality

export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce ternary expressions to be split across multiple lines',
      category: 'Stylistic Issues'
    },
    fixable: 'whitespace',
    schema: []
  },

  create (context) {
    const sourceCode = context.getSourceCode();

    return {
      ConditionalExpression (node) {
        const testToken = sourceCode.getFirstToken(node.test);
        const consequentToken = sourceCode.getFirstToken(node.consequent);
        const alternateToken = sourceCode.getFirstToken(node.alternate);

        const testLine = testToken.loc.end.line;
        const consequentLine = consequentToken.loc.start.line;
        const alternateLine = alternateToken.loc.start.line;

        // If any parts are on the same line, enforce line breaks
        if (
          testLine === consequentLine ||
          consequentLine === alternateLine
        ) {
          context.report({
            node,
            message: 'Ternary expressions must be split into multiple lines',
            fix (fixer) {
              const questionToken = sourceCode.getTokenAfter(node.test, token => token.value === '?');
              const colonToken = sourceCode.getTokenAfter(node.consequent, token => token.value === ':');

              const indent = '  ';
              const newText =
                `\n${indent}? ${sourceCode.getText(node.consequent)}\n${indent}: ${sourceCode.getText(node.alternate)}`;

              return fixer.replaceTextRange(
                [questionToken.range[0], node.range[1]],
                newText
              );
            }
          });
        }
      }
    };
  }
};
