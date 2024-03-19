module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    browser: false,
    es6: true,
    node: true,
    mocha: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    radix: ['error', 'always'],
    'no-unused-vars': 'off',
    'object-shorthand': ['error', 'always'],
    'prettier/prettier': [
      'error',
      {},
      {
        usePrettierrc: true,
      },
    ],
    camelcase: ['error', { ignoreImports: true, properties: 'never' }],
    'prefer-const': 'error',
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'off',
    'no-ex-assign': 'off',
  },
}
