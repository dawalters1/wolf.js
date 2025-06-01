// eslint-rules/sort-imports-exports.js
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Sort import and export statements alphabetically by identifier name',
    },
    fixable: 'code',
    schema: [],
  },

  create(context) {
    return {
      Program(node) {
        const sourceCode = context.getSourceCode();

        const importNodes = node.body.filter(n => n.type === 'ImportDeclaration');
        const exportNodes = node.body.filter(
          n => n.type === 'ExportNamedDeclaration' && n.source === null
        );

        const isServerTypeExport = (n) => {
          if (!n.declaration) return false;
          const decl = n.declaration;

          return (
            (decl.type === 'TSInterfaceDeclaration' || decl.type === 'TSTypeAliasDeclaration') &&
            decl.id?.name?.startsWith('Server')
          );
        };

        const getImportName = (n) => {
          const spec = n.specifiers?.[0];
          return spec?.local?.name?.toLowerCase() || '';
        };

        const getExportName = (n) => {
          if (n.declaration?.declarations?.[0]?.id?.name)
            return n.declaration.declarations[0].id.name.toLowerCase();
          if (n.declaration?.id?.name)
            return n.declaration.id.name.toLowerCase();
          return '';
        };

        const sortAndCompare = (nodes, type, getSortKey) => {
          const toSort =
            type === 'Export'
              ? nodes.filter(n => !isServerTypeExport(n))
              : nodes;

          if (toSort.length < 2) return;

          const sorted = [...toSort].sort((a, b) =>
            getSortKey(a).localeCompare(getSortKey(b))
          );

          toSort.forEach((n, i) => {
            if (n !== sorted[i]) {
              context.report({
                node: n,
                message: `${type} statements should be sorted alphabetically by name (A → Z)`,
                fix: fixer => {
                  const text = sorted.map(n => sourceCode.getText(n)).join('\n');
                  return fixer.replaceTextRange(
                    [toSort[0].range[0], toSort[toSort.length - 1].range[1]],
                    text
                  );
                },
              });
            }
          });
        };

        if (importNodes.length > 1)
          sortAndCompare(importNodes, 'Import', getImportName);
        if (exportNodes.length > 1)
          sortAndCompare(exportNodes, 'Export', getExportName);
      },
    };
  },
};
