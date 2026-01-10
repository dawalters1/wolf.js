// ChatGPT speciality

export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce spacing around = and two spaces before enum member names in TypeScript enums',
      category: 'Stylistic Issues'
    },
    fixable: 'whitespace',
    schema: []
  },

  create (context) {
    const sourceCode = context.getSourceCode();

    return {
      TSEnumMember (node) {
        const enumMemberToken = sourceCode.getFirstToken(node);
        const lineStartIndex = sourceCode.getText().lastIndexOf('\n', enumMemberToken.range[0]) + 1;
        const leadingText = sourceCode.getText().slice(lineStartIndex, enumMemberToken.range[0]);

        // Enforce exactly two spaces before the enum member name
        if (leadingText !== '  ') {
          context.report({
            node: enumMemberToken,
            message: 'Enum member should be preceded by exactly two spaces',
            fix (fixer) {
              return fixer.replaceTextRange(
                [lineStartIndex, enumMemberToken.range[0]],
                '  '
              );
            }
          });
        }

        // Enforce spacing around '='
        if (node.initializer) {
          const equalToken = sourceCode.getTokenBefore(node.initializer, token => token.value === '=');

          if (equalToken) {
            const before = sourceCode.getTokenBefore(equalToken);
            const after = sourceCode.getTokenAfter(equalToken);

            const hasSpaceBefore = sourceCode.isSpaceBetweenTokens(before, equalToken);
            const hasSpaceAfter = sourceCode.isSpaceBetweenTokens(equalToken, after);

            if (!hasSpaceBefore || !hasSpaceAfter) {
              context.report({
                node: equalToken,
                message: 'Equals sign in enum member should have a space before and after',
                fix (fixer) {
                  return fixer.replaceText(equalToken, ' = ');
                }
              });
            }
          }
        }
      }
    };
  }
};