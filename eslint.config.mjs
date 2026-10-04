// Configuração única do ESLint para o monorepo (flat config).
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * REGRA FUNDAMENTAL: nenhum cliente acessa o banco. No app/PWA o Firebase JS SDK
 * serve só para login (firebase/auth). Dado vem sempre da API.
 */
const ACESSO_DIRETO_AO_BANCO = {
  paths: [
    { name: 'firebase/firestore', message: 'Proibido no cliente: peça o dado à API (src/api).' },
    {
      name: 'firebase/firestore/lite',
      message: 'Proibido no cliente: peça o dado à API (src/api).',
    },
    { name: '@firebase/firestore', message: 'Proibido no cliente: peça o dado à API (src/api).' },
    { name: 'firebase/database', message: 'Proibido no cliente: peça o dado à API (src/api).' },
    { name: 'firebase/storage', message: 'Proibido no cliente: peça o dado à API (src/api).' },
    { name: 'firebase-admin', message: 'O Admin SDK só existe na API.' },
  ],
  patterns: [
    { group: ['firebase/compat/*', 'firebase-admin/*'], message: 'Proibido no cliente.' },
    {
      group: ['**/apps/api/**', '@saude/api', '@saude/api/*'],
      message: 'O app não importa código da API: chame-a por HTTP.',
    },
  ],
};

/** Cor sempre vem dos tokens do tema (src/theme/tokens.ts), nunca escrita no componente. */
const COR_LITERAL = [
  {
    selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
    message: 'Não escreva cor em hexadecimal: use os tokens do tema (useTema().cores).',
  },
  {
    selector: 'Literal[value=/^(?:rgb|rgba|hsl|hsla)\\(/]',
    message: 'Não escreva cor literal: use os tokens do tema (useTema().cores).',
  },
];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.expo/**',
      'design-system/**',
      'gerar-tema.mjs',
      'apps/mobile/src/theme/tokens.ts',
      'apps/mobile/expo-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      eqeqeq: ['error', 'always'],
      'no-console': 'error',
    },
  },
  {
    files: ['**/*.mjs', '**/*.config.{js,ts,mjs}', 'infra/**'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' },
  },

  // --- API ---------------------------------------------------------------
  {
    files: ['apps/api/**/*.ts'],
    languageOptions: { globals: globals.node },
  },

  // --- App (React Native / PWA) ------------------------------------------
  {
    files: ['apps/mobile/**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    languageOptions: { globals: { ...globals.browser, __DEV__: 'readonly' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'no-restricted-imports': ['error', ACESSO_DIRETO_AO_BANCO],
      'no-restricted-syntax': ['error', ...COR_LITERAL],
    },
  },

  prettier,
);
