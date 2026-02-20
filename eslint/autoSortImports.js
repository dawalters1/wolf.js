export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Sort import and export statements alphabetically by identifier name'
    },
    fixable: 'code',
    schema: []
  },

  create (context) {
    return {
      Program (node) {
        const sourceCode = context.getSourceCode();

        const importNodes = node.body.filter(n => n.type === 'ImportDeclaration');
        const exportNodes = node.body.filter(
          n => n.type === 'ExportNamedDeclaration' && n.source === null
        );

        const isServerTypeExport = (n) => {
          if (!n.declaration) { return false; }
          const decl = n.declaration;
          return (
            (decl.type === 'TSInterfaceDeclaration' || decl.type === 'TSTypeAliasDeclaration') &&
            decl.id?.name?.startsWith('Server')
          );
        };

        const getImportName = (n) => {
          if (!n.specifiers || n.specifiers.length === 0) {
            return n.source.value?.toLowerCase() || '';
          }

          const spec = n.specifiers.find(s => s.local?.name);
          return spec?.local?.name?.toLowerCase() || n.source.value?.toLowerCase() || '';
        };

        const getExportName = (n) => {
          if (n.declaration?.declarations?.[0]?.id?.name) {
            return n.declaration.declarations[0].id.name.toLowerCase();
          }
          if (n.declaration?.id?.name) {
            return n.declaration.id.name.toLowerCase();
          }
          return '';
        };

        const sortAndCompare = (nodes, type, getSortKey) => {
          if (nodes.length < 2) { return; }

          // Split into contiguous blocks
          const blocks = [];
          let current = [];

          for (let i = 0; i < nodes.length; i++) {
            const prev = current[current.length - 1];
            const curr = nodes[i];

            if (
              !prev ||
      sourceCode.text.slice(prev.range[1], curr.range[0]).trim() === ''
            ) {
              current.push(curr);
            } else {
              blocks.push(current);
              current = [curr];
            }
          }

          if (current.length) {
            blocks.push(current);
          }

          // Largest block is considered sortable, others unsortable
          const sortableBlock =
    blocks.reduce((a, b) => (b.length > a.length
      ? b
      : a), []);

          const unsortableBlocks = blocks.filter(b => b !== sortableBlock);

          const toSort = type === 'Export'
            ? sortableBlock.filter(n => !isServerTypeExport(n))
            : sortableBlock;

          if (toSort.length < 2) { return; }

          const sorted = [...toSort].sort((a, b) =>
            getSortKey(a).localeCompare(getSortKey(b))
          );

          const isSorted = toSort.every((n, i) => n === sorted[i]);
          if (isSorted && unsortableBlocks.length === 0) {
            return;
          }

          const buildText = (group) =>
            group.map(n => sourceCode.getText(n)).join('\n');

          const finalText = [
            buildText(sorted),
            ...unsortableBlocks.map(buildText)
          ].join('\n\n');

          context.report({
            node: nodes[0],
            message: `${type} statements should be sorted alphabetically (unsortable ${type.toLowerCase()}s moved to bottom)`,
            fix: fixer =>
              fixer.replaceTextRange(
                [nodes[0].range[0], nodes[nodes.length - 1].range[1]],
                finalText
              )
          });
        };

        if (importNodes.length > 1) {
          sortAndCompare(importNodes, 'Import', getImportName);
        }

        if (exportNodes.length > 1) {
          sortAndCompare(exportNodes, 'Export', getExportName);
        }
      }
    };
  }
};