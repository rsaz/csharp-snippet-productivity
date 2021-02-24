"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartComments = void 0;
const vscode = require("vscode");
const parser_1 = require("./parser");
class SmartComments {
    constructor(context) {
        this.context = context;
    }
    activateSmartComments() {
        let activeEditor;
        let parser = new parser_1.Parser();
        // Called to handle events below
        let updateDecorations = function (useHash = false) {
            // if no active window is open, return
            if (!activeEditor) {
                return;
            }
            // check language support
            if (!parser.supportedLanguage) {
                return;
            }
            // Finds the single line comments using the language comment delimiter
            parser.FindSingleLineComments(activeEditor);
            // Finds the multi line comments using the language comment delimiter
            parser.FindBlockComments(activeEditor);
            // Finds the jsdoc comments
            parser.FindJSDocComments(activeEditor);
            // Apply the styles set in the package.json
            parser.ApplyDecorations(activeEditor);
        };
        // Get the active editor for the first time and initialize the regex
        if (vscode.window.activeTextEditor) {
            activeEditor = vscode.window.activeTextEditor;
            // Set the regex patterns for the specified language's comments
            parser.SetRegex(activeEditor.document.languageId);
            // Trigger first update of decorators
            triggerUpdateDecorations();
        }
        // * Handle active file changed
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                activeEditor = editor;
                // Set regex for updated language
                parser.SetRegex(editor.document.languageId);
                // Trigger update to set decorations for newly active file
                triggerUpdateDecorations();
            }
        }, null, this.context.subscriptions);
        // * Handle file contents changed
        vscode.workspace.onDidChangeTextDocument(event => {
            // Trigger updates if the text was changed in the same document
            if (activeEditor && event.document === activeEditor.document) {
                triggerUpdateDecorations();
            }
        }, null, this.context.subscriptions);
        // * IMPORTANT:
        // To avoid calling update too often,
        // set a timer for 200ms to wait before updating decorations
        var timeout;
        function triggerUpdateDecorations() {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(updateDecorations, 200);
        }
    }
}
exports.SmartComments = SmartComments;
//# sourceMappingURL=smartComments.js.map