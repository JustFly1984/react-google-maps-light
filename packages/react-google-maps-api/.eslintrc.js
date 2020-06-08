module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:cypress/recommended',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'plugin:json/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:optimize-regex/all',
    'plugin:promise/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-perf/all',
    'standard',
    'standard-react',
    // Prettier always last
    'prettier',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
    'prettier/react',
    'prettier/standard',
  ],
  plugins: [
    'chai-expect',
    'import', // connects in extends
    '@typescript-eslint', // connects in extends
    'react', // connects in extends
    'jsx-a11y', // connects in extends
    'react-hooks', // connects in extends
    'react-perf', // connects in extends
    'jest', // connects in extends
    'no-inferred-method-name',
    'optimize-regex', // connects in extends
    'promise', // connects in extends
    'cypress', // connects in extends
    'prettier', // connects in extends
    'standard', // connects in extends
    'markdown',
    'json', // connects in extends
    'xss', // unused
    'perf-standard',
    'es',
    'babel', // unused
    'tree-shaking', // unused
  ],
  settings: {
    react: {
      version: 'detect',
    },
    node: {
      allowModules: ['src'],
      resolvePaths: [__dirname],
      tryExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
  },
  env: {
    'cypress/globals': true,
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    __DEV__: false,
    __PROD__: false,
    __PLAYER_DEBUG__: false,
    __BASENAME__: false,
    google: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  rules: {
    camelcase: 'off',
    'jest/expect-expect': 'off',
    'no-useless-return': 'off',
    'node/no-missing-import': 'off',
    'node/no-missing-require': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'sort-requires/sort-requires': 'off',
    'no-console': ['error', { allow: ['warn', 'error', 'info', 'table'] }],
    'no-unused-vars': 'off',
    'no-restricted-globals': [
      'error',
      {
        name: 'name',
        message: 'Use local parameter instead.',
      },
      {
        name: 'event',
        message: 'Use local parameter instead.',
      },
      {
        name: 'fdescribe',
        message: 'Do not commit fdescribe. Use describe instead.',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      { allowExpressions: true },
    ],
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      { functions: false, classes: false, typedefs: false },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'optimize-regex/optimize-regex': 'warn',
    'es/no-async-iteration': 'error',
    'es/no-malformed-template-literals': 'error',
    'es/no-regexp-lookbehind-assertions': 'error',
    'es/no-regexp-named-capture-groups': 'error',
    'es/no-regexp-s-flag': 'error',
    'es/no-regexp-unicode-property-escapes': 'error',
    'chai-expect/missing-assertion': 2,
    'chai-expect/terminating-properties': 1,
    'no-inferred-method-name/no-inferred-method-name': 'error',
    // "tree-shaking/no-side-effects-in-initialization": 2,
  },
  overrides: [
    // Override some TypeScript rules just for .js files
    {
      files: ['*.js'],
      rules: {
        semi: ['error', 'never'],
        'jsx-quotes': ['error', 'prefer-single'],
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ],
}
