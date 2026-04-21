import * as vscode from "vscode";
import { Parser } from "./Parser";

/**
 * Settings that, when changed, require the Parser to be rebuilt because
 * they're consumed in the field initializer (and therefore frozen at
 * construction time). Keeping this list explicit avoids the cost of tearing
 * down decorations on unrelated config edits like
 * `csharp-snippet-productivity.tags.popularPackages`.
 */
const PARSER_CONFIG_KEYS = [
  "csharp-snippet-productivity.tags",
  "csharp-snippet-productivity.multilineComments",
  "csharp-snippet-productivity.highlightPlainText",
  "csharp-snippet-productivity.useJSDocStyle",
] as const;

export class SmartComments {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public activateSmartComments() {
    let activeEditor: vscode.TextEditor | undefined;
    let parser: Parser = new Parser();

    // Called to handle events below
    const updateDecorations = () => {
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
    vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        if (editor) {
          activeEditor = editor;

          // Set regex for updated language
          parser.SetRegex(editor.document.languageId);

          // Trigger update to set decorations for newly active file
          triggerUpdateDecorations();
        }
      },
      null,
      this.context.subscriptions
    );

    // * Handle file contents changed
    vscode.workspace.onDidChangeTextDocument(
      (event) => {
        // Trigger updates if the text was changed in the same document
        if (activeEditor && event.document === activeEditor.document) {
          triggerUpdateDecorations();
        }
      },
      null,
      this.context.subscriptions
    );

    // * Handle settings changed at runtime.
    // The Parser snapshots tags / multilineComments / highlightPlainText in
    // its field initializer, so changes to those keys can't take effect by
    // mutating the existing instance — rebuild it instead. Disposing the old
    // parser releases its TextEditorDecorationType handles so the editor
    // doesn't keep painting the old colours alongside the new ones.
    vscode.workspace.onDidChangeConfiguration(
      (event) => {
        const affectsParser = PARSER_CONFIG_KEYS.some((key) =>
          event.affectsConfiguration(key)
        );
        if (!affectsParser) {
          return;
        }

        parser.dispose();
        parser = new Parser();

        if (activeEditor) {
          parser.SetRegex(activeEditor.document.languageId);
          triggerUpdateDecorations();
        }
      },
      null,
      this.context.subscriptions
    );

    // Make sure decorations are released when the extension deactivates,
    // even if VS Code doesn't tear the window down before another extension
    // host instance grabs the same handles.
    this.context.subscriptions.push({
      dispose: () => parser.dispose(),
    });

    // * IMPORTANT:
    // To avoid calling update too often,
    // set a timer for 200ms to wait before updating decorations
    let timeout: NodeJS.Timeout | undefined;
    function triggerUpdateDecorations() {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(updateDecorations, 200);
    }
  }
}
