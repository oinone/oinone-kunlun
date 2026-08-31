const pluginImport = require('eslint-plugin-import');
const pluginUnusedImports = require('eslint-plugin-unused-imports');

const importExportRules = {
  name: 'oinone/import-export-rules',
  plugins: {
    import: pluginImport,
    unusedImports: pluginUnusedImports
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true
    }
  },
  rules: {
    'import/no-duplicates': 'error',
    'import/newline-after-import': [
      'error',
      {
        count: 1,
        exactCount: false,
        considerComments: true
      }
    ],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'never',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single']
      }
    ],
    'unusedImports/no-unused-imports': 'error'
  }
};

module.exports = importExportRules;
