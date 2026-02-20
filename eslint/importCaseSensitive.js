import fs from 'fs';
import path from 'path';

export default {
  meta: {
    type: 'problem',
    fixable: 'code', // ✅ makes it auto-fixable
    docs: {
      description: 'Ensure import matches the exact case of the file',
      recommended: 'error'
    },
    schema: []
  },
  create (context) {
    return {
      ImportDeclaration (node) {
        const importPath = node.source.value; // './MyFile'
        if (!importPath.startsWith('.')) { return; } // only local files

        const filePath = path.resolve(path.dirname(context.getFilename()), importPath);
        if (!fs.existsSync(filePath)) { return; }

        const realFileName = fs.readdirSync(path.dirname(filePath))
          .find(f => f.toLowerCase() === path.basename(filePath).toLowerCase());

        if (realFileName && realFileName !== path.basename(filePath)) {
          context.report({
            node: node.source,
            message: `Import case does not match file name: expected "${realFileName}"`,
            fix (fixer) {
              const fixedPath = path.join(path.dirname(importPath), realFileName).replace(/\\/g, '/');
              return fixer.replaceText(node.source, `'${fixedPath}'`);
            }
          });
        }
      }
    };
  }
};
