export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.angular/**',
      '**/*.spec.ts',
      'e2e/**'
    ]
  },
  {
    files: ['**/*.ts'],
    rules: {
      'linebreak-style': 'off',
      'prefer-default-export': 'off',
      'eol-last': 'off',
      'space-in-parens': 'off',
      'no-trailing-spaces': 'off',
      'no-multiple-empty-lines': 'off',
      'lines-between-class-members': 'off',
      'no-unary-operator': 'off',
      'comma-dangle': 'off',
      'operator-linebreak': 'off'
    }
  }
];
