import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
    getTargetFrameworks,
    getInstalledSDKs,
} from "../../utils/sdk.provider";
import { getNonce } from "./GetNonce";
import { CommandFactory, Message } from "../../utils/terminal-cmd.provider";
import { projectTemplateGroups } from "../../utils/project-templates";
import {
    CONFIG_KEYS,
    EXTENSION_ID,
    STATE_KEYS,
    TIMEOUTS,
    WEBVIEW_COMMANDS,
} from "../../utils/constants";
import { Logger } from "../../utils/logger";

/** Inbound message shape from the webview. */
interface WebviewInboundMessage {
    command: string;
    [key: string]: unknown;
}

/**
 * Webview panel responsible for the "Create Project" wizard experience.
 *
 * The panel hosts an HTML/JS UI that communicates with the extension via the
 * VS Code webview message protocol. This class is intentionally a singleton:
 * only one wizard panel may be open at a time.
 */
export class CreateProjectPanel {
    private static context: vscode.ExtensionContext;
    private static _filepath: string = "";
    private static _panel: vscode.WebviewPanel | undefined;
    private static _disposables: vscode.Disposable[] = [];
    private static _sdks: string[] = [];
    private static _defaultFolder: string | undefined;
    private static _terminal: vscode.Terminal;
    private static _csp: string;
    private static _nonce: string;

    private constructor() {}

    /**
     * Creates the panel if it does not already exist, otherwise reveals the
     * existing panel.
     */
    public static createOrShow(context: vscode.ExtensionContext): void {
        this.context = context;

        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (CreateProjectPanel._panel) {
            CreateProjectPanel._panel.reveal(column);
            CreateProjectPanel.update();
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            "create-project",
            "Create Project",
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, "media"),
                    vscode.Uri.joinPath(context.extensionUri, "out/compiled"),
                ],
            }
        );

        this._nonce = getNonce();
        this._csp = `
            default-src 'none';
            img-src ${panel.webview.cspSource} https: data:;
            script-src ${panel.webview.cspSource} 'nonce-${this._nonce}';
            style-src ${panel.webview.cspSource} 'unsafe-inline' 'self' https://*.vscode-cdn.net;
            font-src ${panel.webview.cspSource};
        `
            .replace(/\s+/g, " ")
            .trim();

        panel.iconPath = vscode.Uri.file(
            path.join(this.context.extensionPath, "media", "addProjectIcon.png")
        );

        CreateProjectPanel.defaultConstructor(panel);
    }

    private static async defaultConstructor(panel: vscode.WebviewPanel) {
        this._panel = panel;

        const cfg = vscode.workspace.getConfiguration(EXTENSION_ID);
        const defaultFolder = cfg.get<string | null>(CONFIG_KEYS.DEFAULT_FOLDER);
        this._defaultFolder = defaultFolder ?? undefined;
        this._filepath = this._defaultFolder ?? "";

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async (message: WebviewInboundMessage) => {
                try {
                    await this.handleWebviewMessage(message);
                } catch (err: unknown) {
                    const text =
                        err instanceof Error ? err.message : String(err);
                    Logger.error("Webview message error", err);
                    this.postToWebview({
                        command: WEBVIEW_COMMANDS.CREATION_FAILED,
                        text: `Unexpected error: ${text}`,
                    });
                }
            },
            null,
            this._disposables
        );

        this.update();

        if (this._filepath) {
            this.postToWebview({
                command: WEBVIEW_COMMANDS.UPDATE_LOCATION,
                filepath: this._filepath,
            });
        }
    }

    private static async handleWebviewMessage(
        message: WebviewInboundMessage
    ): Promise<void> {
        switch (message?.command) {
            case WEBVIEW_COMMANDS.GET_TEMPLATES:
                this.postToWebview({
                    command: WEBVIEW_COMMANDS.TEMPLATES,
                    templates: projectTemplateGroups,
                });
                return;

            case WEBVIEW_COMMANDS.GET_SDK_VERSIONS:
                try {
                    const sdks = await getInstalledSDKs();
                    this.postToWebview({
                        command: WEBVIEW_COMMANDS.SDK_VERSIONS,
                        versions: sdks,
                    });
                } catch (error) {
                    Logger.error("Error getting SDK versions", error);
                    vscode.window.showErrorMessage(
                        "Failed to detect installed .NET SDKs."
                    );
                }
                return;

            case WEBVIEW_COMMANDS.CREATE_PROJECT: {
                this._terminal =
                    vscode.window.activeTerminal === undefined
                        ? vscode.window.createTerminal("C# Toolbox")
                        : vscode.window.activeTerminal;
                const msg = message as unknown as Message;
                this.postToWebview({
                    command: WEBVIEW_COMMANDS.CREATION_STARTED,
                    text: `Creating ${msg.project}...`,
                });
                await this.projectCreation(msg);
                return;
            }

            case WEBVIEW_COMMANDS.SELECT_DIRECTORY: {
                const options: vscode.OpenDialogOptions = {
                    canSelectMany: false,
                    openLabel: "Select",
                    canSelectFiles: false,
                    canSelectFolders: true,
                };
                const result = await vscode.window.showOpenDialog(options);
                if (result && result[0]) {
                    this._filepath = result[0].fsPath;
                    this.postToWebview({
                        command: WEBVIEW_COMMANDS.UPDATE_LOCATION,
                        filepath: this._filepath,
                    });
                }
                return;
            }

            case WEBVIEW_COMMANDS.CLOSE_PANEL:
                this.dispose();
                return;
        }
    }

    private static postToWebview(message: Record<string, unknown>): void {
        this._panel?.webview.postMessage(message);
    }

    private static dispose() {
        if (this._panel) {
            this._panel.dispose();
            CreateProjectPanel._panel = undefined;
        }
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private static async projectCreation(message: Message): Promise<void> {
        message.filepath = this._filepath;
        message.solution = (message.solution || "").replace(/\s+/g, "");
        message.project = (message.project || "").replace(/\s+/g, "");

        if (!message.filepath) {
            this.postToWebview({
                command: WEBVIEW_COMMANDS.CREATION_FAILED,
                text: "Please choose a folder before creating the project.",
            });
            return;
        }

        const solutionPath = path.join(message.filepath, message.solution);
        if (fs.existsSync(solutionPath)) {
            this.postToWebview({
                command: WEBVIEW_COMMANDS.CREATION_FAILED,
                text: "Solution folder already exists at the chosen location.",
            });
            return;
        }

        try {
            Logger.info("Creating project", message);
            const command = CommandFactory.getCommand(this._terminal, message);
            if (!command) {
                this.postToWebview({
                    command: WEBVIEW_COMMANDS.CREATION_FAILED,
                    text: "Failed to create command for project creation.",
                });
                return;
            }

            await command.execute();

            CreateProjectPanel.context.globalState.update(
                STATE_KEYS.FRAMEWORK,
                message.framework
            );

            this.postToWebview({
                command: WEBVIEW_COMMANDS.CREATION_COMPLETED,
                text: `Successfully created project ${message.project}`,
            });

            vscode.window.showInformationMessage(
                `Successfully created project ${message.project}`
            );

            setTimeout(() => this.dispose(), TIMEOUTS.PANEL_DISPOSE_DELAY_MS);
        } catch (error: unknown) {
            const text =
                error instanceof Error ? error.message : String(error);
            Logger.error("Error creating project", error);
            this.postToWebview({
                command: WEBVIEW_COMMANDS.CREATION_FAILED,
                text: `Failed to create project: ${text}`,
            });
        }
    }

    private static async update(): Promise<void> {
        if (!this._panel) {
            return;
        }
        const webview = this._panel.webview;

        const sdksResource: vscode.Uri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "sdks.txt")
        );
        this._sdks = getTargetFrameworks(sdksResource);

        this._panel.webview.html = this.getHtmlForWebview(webview);
    }

    private static getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "main.js")
        );
        const templateIconsScriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.context.extensionUri,
                "media",
                "template-icons.js"
            )
        );
        const stylesResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "reset.css")
        );
        const stylesMainUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "main.css")
        );

        const htmlContent = fs.readFileSync(
            path.join(this.context.extensionPath, "media", "index.html"),
            "utf8"
        );

        return htmlContent
            .replace(/{{nonce}}/g, this._nonce)
            .replace(/{{cspSource}}/g, webview.cspSource)
            .replace(/{{script}}/g, scriptUri.toString())
            .replace(
                /{{templateIconsScript}}/g,
                templateIconsScriptUri.toString()
            )
            .replace(/{{stylesResetUri}}/g, stylesResetUri.toString())
            .replace(/{{stylesMainUri}}/g, stylesMainUri.toString())
            .replace(
                /{{sdkOptions}}/g,
                this._sdks
                    .map((sdk) => `<option value="${sdk}">${sdk}</option>`)
                    .join("")
            );
    }
}
