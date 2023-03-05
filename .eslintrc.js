module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    radix: 'off',
    'no-unresolved': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'no-console': 'off',
    // 'max-len': 'off',
  },
};
