module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    // 'plugin:sonarjs/recommended', // Temporarily removed to check warning
    'plugin:security/recommended',
    'next/core-web-vitals',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'import',
    'jsx-a11y',
    'react-hooks',
    'sonarjs',
    'security',
    'prettier',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    // React specific rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-props-no-spreading': 'warn',
    'react/function-component-definition': ['warn', {
      namedComponents: 'function-declaration',
      unnamedComponents: 'arrow-function'
    }],
    
    // Import organization
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/prefer-default-export': 'off',
    
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // General coding practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'sonarjs/cognitive-complexity': ['warn', 15],
    'max-lines-per-function': ['warn', 200],
    'complexity': ['warn', 10],
    
    // Next.js specific
    '@next/next/no-img-element': 'error',
    '@next/next/no-html-link-for-pages': 'error',
    
    // Accessibility
    'jsx-a11y/anchor-is-valid': ['error', {
      components: ['Link'],
      specialLink: ['hrefLeft', 'hrefRight'],
      aspects: ['invalidHref', 'preferButton']
    }],
    
    // To gradually adopt these rules
    'sonarjs/no-duplicate-string': 'warn',
    'security/detect-object-injection': 'warn',
  },
  // You can ignore specific files
  ignorePatterns: [
    'node_modules/**',
    '.next/**',
    'public/**',
    '*.d.ts',
    'build/**',
    'dist/**'
  ]
};