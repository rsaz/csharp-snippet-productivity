export const EXTENSION_ID = 'csharp-snippet-productivity';

export const VIEWS = {
  TODO_LIST: 'todo-list'
};

export const COMMANDS = {
  REFRESH: EXTENSION_ID + '.refreshList',
  OPEN_FILE: EXTENSION_ID + '.openFile'
};

export const MAX_RESULTS = 512;

export const TODO = 'TODO:';

export const REGEX = new RegExp(TODO, 'g');

export const INCLUDE = [
  '**/*.js',
  '**/*.ts',
  '**/*.jsx',
  '**/*.tsx',
  '**/*.html',
  '**/*.vue',
  '**/*.css',
  '**/*.scss',
  '**/*.sass',
  '**/*.less',
  '**/*.styl',
  '**/*.py',
  '**/*.php',
  '**/*.md'
];

export const EXCLUDE = [
  '**/node_modules/**',
  '**/bower_components/**',
  '**/dist/**',
  '**/out/**',
  '**/build/**',
  '**/.*/**'
];
