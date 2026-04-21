import * as vscode from "vscode";
import { PATTERN_TEMPLATES, PatternTemplate } from "./pattern-templates";
import { EXTENSION_ID } from "../../utils/constants";

/** Internal command id used by the lightbulb actions (not in the palette). */
export const INSERT_PATTERN_COMMAND = `${EXTENSION_ID}.internal.insertPattern`;

/**
 * Provides Quick Fix / `Ctrl+.` actions inside any C# file that let the user
 * insert canonical architectural patterns (Result, Option, Repository, CQRS,
 * Specification, Builder, Unit of Work) at the cursor.
 *
 * The provider is intentionally cheap: it does not parse the file. It always
 * returns the same set of refactor actions whenever the cursor is inside a
 * `.cs` document, leaving the user to decide what fits.
 */
export class PatternCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds: vscode.CodeActionKind[] = [
        vscode.CodeActionKind.RefactorRewrite,
    ];

    public provideCodeActions(
        document: vscode.TextDocument
    ): vscode.CodeAction[] {
        if (document.languageId !== "csharp") {
            return [];
        }
        return PATTERN_TEMPLATES.map((template) =>
            this.buildAction(document, template)
        );
    }

    private buildAction(
        document: vscode.TextDocument,
        template: PatternTemplate
    ): vscode.CodeAction {
        const action = new vscode.CodeAction(
            template.title,
            vscode.CodeActionKind.RefactorRewrite
        );
        action.command = {
            title: template.title,
            command: INSERT_PATTERN_COMMAND,
            arguments: [document.uri, template.id],
        };
        return action;
    }

    /**
     * Registers the provider and the internal insert-pattern command.
     */
    public static register(context: vscode.ExtensionContext): void {
        context.subscriptions.push(
            vscode.languages.registerCodeActionsProvider(
                { language: "csharp" },
                new PatternCodeActionProvider(),
                {
                    providedCodeActionKinds:
                        PatternCodeActionProvider.providedCodeActionKinds,
                }
            ),
            vscode.commands.registerCommand(
                INSERT_PATTERN_COMMAND,
                async (uri: vscode.Uri, templateId: string) => {
                    await PatternCodeActionProvider.insertTemplate(
                        uri,
                        templateId
                    );
                }
            )
        );
    }

    private static async insertTemplate(
        uri: vscode.Uri,
        templateId: string
    ): Promise<void> {
        const template = PATTERN_TEMPLATES.find((t) => t.id === templateId);
        if (!template) {
            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.uri.toString() !== uri.toString()) {
            return;
        }
        await editor.insertSnippet(
            new vscode.SnippetString(template.body),
            editor.selection.active
        );
    }
}
