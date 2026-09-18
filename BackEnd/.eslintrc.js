module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  overrides: [
    {
      files: ['src/**/services/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              { group: ['mongoose'], message: 'Service não deve importar mongoose (use o repository)' },
              { group: ['@nestjs/mongoose'], message: 'Service não deve importar @nestjs/mongoose (use o repository)' },
              { group: ['**/schemas/**'], message: 'Service não deve importar schemas diretamente' },
            ],
          },
        ],
      },
    },
    {
      files: ['src/**/controllers/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              { group: ['mongoose'], message: 'Controller não deve importar mongoose' },
              { group: ['@nestjs/mongoose'], message: 'Controller não deve importar @nestjs/mongoose' },
              { group: ['**/repositories/**'], message: 'Controller deve usar Service, não Repository' },
              { group: ['**/schemas/**'], message: 'Controller não deve importar schemas' },
            ],
          },
        ],
      },
    },
    {
      files: ['src/**/repositories/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              { group: ['**/services/**'], message: 'Repository não deve importar Service (inversão de dependência)' },
            ],
          },
        ],
      },
    },
    {
      files: ['src/projects/**/*.ts', 'src/planning/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'warn',
          {
            patterns: [
              { group: ['mongoose'], message: '[LEGADO] Service usa mongoose diretamente — migrar para Repository' },
              { group: ['@nestjs/mongoose'], message: '[LEGADO] Service usa @nestjs/mongoose diretamente — migrar para Repository' },
            ],
          },
        ],
      },
    },
  ],
};
