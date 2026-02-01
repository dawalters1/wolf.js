export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Alphabetize private fields, getters, and constructor private assignments'
    },
    fixable: 'code',
    schema: []
  },

  create (context) {
    const sourceCode = context.getSourceCode();
    const sourceText = sourceCode.text;

    /* ---------------------------------- utils ---------------------------------- */

    function areContiguousIgnoringComments (a, b) {
      return sourceCode.getTokensBetween(a, b).length === 0;
    }

    function splitIntoGroups (nodes) {
      const groups = [];
      let current = [];

      for (const node of nodes) {
        if (
          !current.length ||
          areContiguousIgnoringComments(
            current[current.length - 1],
            node
          )
        ) {
          current.push(node);
        } else {
          groups.push(current);
          current = [node];
        }
      }

      if (current.length) { groups.push(current); }
      return groups;
    }

    function getNodeWithLeadingCommentsRange (node) {
      const comments = sourceCode.getCommentsBefore(node);

      if (!comments.length) { return node.range; }

      const first = comments[0];

      // Attach only JSDoc-style comments directly above
      if (
        first.type === 'Block' &&
        sourceText.slice(first.range[0], first.range[1]).startsWith('/**')
      ) {
        return [first.range[0], node.range[1]];
      }

      return node.range;
    }

    function getTextByRange (range) {
      return sourceText.slice(range[0], range[1]);
    }

    function buildFix (group, getName, getRange) {
      const names = group.map(getName);
      const sorted = [...names].sort((a, b) => a.localeCompare(b));

      if (names.every((n, i) => n === sorted[i])) {
        return null;
      }

      const sortedNodes = [...group].sort((a, b) =>
        getName(a).localeCompare(getName(b))
      );

      const ranges = group.map(n => getRange(n));
      const start = Math.min(...ranges.map(r => r[0]));
      const end = Math.max(...ranges.map(r => r[1]));

      return fixer =>
        fixer.replaceTextRange(
          [start, end],
          sortedNodes
            .map(n => getTextByRange(getRange(n)))
            .join('\n')
        );
    }

    function reportGroups (groups, message, getName, getRange) {
      for (const group of groups) {
        const fix = buildFix(group, getName, getRange);
        if (!fix) { continue; }

        context.report({
          node: group[0],
          message,
          fix
        });
      }
    }

    /* ---------------------------------- rule ---------------------------------- */

    return {
      ClassBody (node) {
        /* ---------- private fields ---------- */
        const privateFields = node.body.filter(
          el =>
            el.type === 'PropertyDefinition' &&
            el.key.type === 'PrivateIdentifier'
        );

        reportGroups(
          splitIntoGroups(privateFields),
          'Private class fields should be alphabetized',
          n => n.key.name,
          getNodeWithLeadingCommentsRange
        );

        /* ---------- getters ---------- */
        const getters = node.body.filter(
          el =>
            el.type === 'MethodDefinition' &&
            el.kind === 'get' &&
            el.key.type === 'Identifier'
        );

        reportGroups(
          splitIntoGroups(getters),
          'Getter methods should be alphabetized',
          n => n.key.name,
          getNodeWithLeadingCommentsRange
        );

        /* ---------- constructor assignments ---------- */
        const ctor = node.body.find(
          el =>
            el.type === 'MethodDefinition' &&
            el.kind === 'constructor'
        );

        if (!ctor?.value?.body?.body) { return; }

        const assignments = ctor.value.body.body.filter(stmt => {
          if (stmt.type !== 'ExpressionStatement') { return false; }

          const expr = stmt.expression;
          return (
            expr.type === 'AssignmentExpression' &&
            expr.left.type === 'MemberExpression' &&
            expr.left.object.type === 'ThisExpression' &&
            expr.left.property.type === 'PrivateIdentifier'
          );
        });

        reportGroups(
          splitIntoGroups(assignments),
          'Constructor private property assignments should be alphabetized',
          stmt => stmt.expression.left.property.name,
          stmt => stmt.range
        );
      }
    };
  }
};
