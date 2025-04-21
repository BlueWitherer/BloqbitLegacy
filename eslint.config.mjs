import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      "reserves/**",
      "node_modules/**",
    ],
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-undef': 'error',
      'no-console': 'off',
      'eqeqeq': 'error',
      'prefer-const': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-var': 'error',
      'semi': ['error', 'always'],
      'no-eval': 'error',
    },
  },
];