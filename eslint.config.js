// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier');

/**
 * El front no tenía linter: ni reglas de TypeScript ni las de Angular, así
 * que nada avisaba de un `any`, de un Observable sin suscribir o de un
 * componente mal nombrado. Esta configuración es la recomendada por el
 * equipo de Angular, con dos ajustes:
 *
 * - El formato lo decide Prettier (eslint-config-prettier apaga las reglas
 *   de estilo), igual que en RestCamintra.
 * - Lo que hay que limpiar con calma -- los `any` heredados -- entra como
 *   aviso, no como error, para que `npm run lint` sirva de guardia desde
 *   hoy en vez de quedar en rojo permanente y que nadie lo mire.
 */
module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],

      // Deuda heredada: avisa, no bloquea
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // En una intranet los mensajes van a la pantalla, no a la consola
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      // Las plantillas vienen con mucho que corregir en accesibilidad:
      // se deja como aviso para irlo arreglando pantalla por pantalla.
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/label-has-associated-control': 'warn',
      '@angular-eslint/template/alt-text': 'warn',
      '@angular-eslint/template/elements-content': 'warn',
    },
  },
  {
    // Las pruebas pueden usar any y tipos sueltos para armar los dobles
    files: ['**/*.spec.ts', 'src/testing/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    ignores: ['dist/', '.angular/', 'coverage/', 'node_modules/'],
  }
);
