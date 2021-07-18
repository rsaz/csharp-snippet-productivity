"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXCLUDE = exports.INCLUDE = exports.REGEX = exports.TODO = exports.MAX_RESULTS = exports.COMMANDS = exports.VIEWS = exports.EXTENSION_ID = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
exports.EXTENSION_ID = 'csharp-snippet-productivity';
exports.VIEWS = {
    TODO_LIST: 'todo-list'
};
exports.COMMANDS = {
    REFRESH: exports.EXTENSION_ID + '.refreshList',
    OPEN_FILE: exports.EXTENSION_ID + '.openFile'
};
exports.MAX_RESULTS = 512;
exports.TODO = 'TODO:';
exports.REGEX = new RegExp(exports.TODO, 'g');
exports.INCLUDE = [
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
exports.EXCLUDE = [
    '**/node_modules/**',
    '**/bower_components/**',
    '**/dist/**',
    '**/out/**',
    '**/build/**',
    '**/.*/**'
];
//# sourceMappingURL=Constants.js.map