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

export class CreateProjectPanel {
    private static context: vscode.ExtensionContext;
    private static _filepath: any = "";
    private static _panel: vscode.WebviewPanel;
    private static _disposables: vscode.Disposable[] = [];
    private static _sdks: string[] = [];
    private static _defaultFolder: vscode.WorkspaceConfiguration | undefined;
    private static _terminal: vscode.Terminal;
    private static _csp: string;

    // To avoid direct instantiation use the createOrShow method
    private constructor() {}

    // Main method to create or show the panel
    public static createOrShow(context: vscode.ExtensionContext): void {
        this.context = context;

        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (CreateProjectPanel._panel) {
            CreateProjectPanel._panel.reveal(column);
            CreateProjectPanel.update();
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            "create-project",
            "Create Project",
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, "media"),
                    vscode.Uri.joinPath(context.extensionUri, "out/compiled"),
                ],
            }
        );

        // Get the nonce for CSP
        const nonce = getNonce();

        // Set Content Security Policy
        this._csp = `
            default-src 'none';
            img-src ${panel.webview.cspSource} https:;
            script-src ${panel.webview.cspSource} 'nonce-${nonce}';
            style-src ${panel.webview.cspSource} 'unsafe-inline' 'self' https://*.vscode-cdn.net;
            font-src ${panel.webview.cspSource};
        `
            .replace(/\s+/g, " ")
            .trim();

        // Store nonce in panel for later use
        (panel as any).nonce = nonce;

        // adding panel icon
        panel.iconPath = vscode.Uri.file(
            path.join(this.context.extensionPath, "media", "addProjectIcon.png")
        );

        CreateProjectPanel.defaultConstructor(panel);
    }

    private static async defaultConstructor(panel: vscode.WebviewPanel) {
        this._panel = panel;

        this._defaultFolder = vscode.workspace
            .getConfiguration("csharp-snippet-productivity")
            .get("defaultFolderForProjectCreation");

        this._filepath = this._defaultFolder || "";

        // OnPanel Close
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case "getTemplates":
                        this._panel.webview.postMessage({
                            command: "templates",
                            templates: projectTemplateGroups,
                        });
                        break;

                    case "getSDKVersions":
                        try {
                            const sdks = await getInstalledSDKs();
                            this._panel.webview.postMessage({
                                command: "sdkVersions",
                                versions: sdks,
                            });
                        } catch (error) {
                            console.error("Error getting SDK versions:", error);
                            vscode.window.showErrorMessage(
                                "Failed to get SDK versions"
                            );
                        }
                        break;

                    case "createProject":
                        // Create terminal only when needed
                        this._terminal =
                            vscode.window.activeTerminal === undefined
                                ? vscode.window.createTerminal()
                                : vscode.window.activeTerminal;
                        await this.projectCreation(message);
                        return;

                    case "selectDirectory":
                        const options: vscode.OpenDialogOptions = {
                            canSelectMany: false,
                            openLabel: "Select",
                            canSelectFiles: false,
                            canSelectFolders: true,
                        };
                        vscode.window
                            .showOpenDialog(options)
                            .then((fileUri) => {
                                if (fileUri && fileUri[0]) {
                                    this._filepath = fileUri[0].fsPath;
                                    this._panel.webview.postMessage({
                                        command: "updateLocation",
                                        filepath: this._filepath,
                                    });
                                }
                            });
                        return;
                }
            },
            null,
            this._disposables
        );

        // Set the Webview initial html content
        this.update();
    }

    private static dispose() {
        // Clean up our resources
        this._panel.dispose();

        CreateProjectPanel._panel = undefined as any;

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private static async projectCreation(message: Message) {
        // Adjust filepath from the default or selection
        message.filepath = this._filepath;

        // Remove spaces from project and solution names
        message.solution = message.solution.replace(/\s+/g, "");
        message.project = message.project.replace(/\s+/g, "");

        if (fs.existsSync(this._filepath + "\\" + message.solution)) {
            vscode.window.showErrorMessage("Solution folder already exist");
            return;
        }

        try {
            console.log("Creating project with command factory:", message);
            const command = CommandFactory.getCommand(this._terminal, message);

            if (!command) {
                vscode.window.showErrorMessage(
                    "Failed to create command for project creation"
                );
                return;
            }

            await command.execute();

            // setting the current project framework to define the template namespace to be used
            CreateProjectPanel.context.globalState.update(
                "framework",
                message.framework
            );

            // Show success message
            vscode.window.showInformationMessage(
                `Successfully created project ${message.project}`
            );

            // Close the webview panel
            this.dispose();
        } catch (error: any) {
            console.error("Error creating project:", error);
            vscode.window.showErrorMessage(
                `Failed to create project: ${error?.message || "Unknown error"}`
            );
        }
    }

    private static async update(
        projectGroupName: any = "Select Project Type",
        projectGroup: any = "api",
        templateName: any = "Select Template",
        template: any = "console",
        project: any = "",
        solution: any = "",
        framework: any = ""
    ) {
        const webview = this._panel.webview;

        // list of sdk's
        const sdksResource: vscode.Uri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "sdks.txt")
        );
        this._sdks = getTargetFrameworks(sdksResource);

        this._panel.webview.html = this.getHtmlForWebview(
            webview,
            projectGroupName,
            projectGroup,
            templateName,
            template,
            project,
            solution,
            framework
        );
    }

    private static getHtmlForWebview(
        webview: vscode.Webview,
        projectGroupName: any,
        projectGroup: any,
        templateName: any,
        template: any,
        project: any,
        solution: any,
        framework: any
    ) {
        // main script integration
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "main.js")
        );

        // template icons script integration
        const templateIconsScriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.context.extensionUri,
                "media",
                "template-icons.js"
            )
        );

        // styles integration
        const stylesResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "reset.css")
        );
        const stylesMainUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "main.css")
        );

        // Use the nonce from panel
        const nonce = (this._panel as any).nonce;

        // Get the HTML content
        const htmlContent = fs.readFileSync(
            path.join(this.context.extensionPath, "media", "index.html"),
            "utf8"
        );

        // Replace the placeholders in the HTML
        return htmlContent
            .replace(/{{nonce}}/g, nonce)
            .replace(/{{cspSource}}/g, webview.cspSource)
            .replace(/{{script}}/g, scriptUri.toString())
            .replace(
                /{{templateIconsScript}}/g,
                templateIconsScriptUri.toString()
            )
            .replace(/{{stylesResetUri}}/g, stylesResetUri.toString())
            .replace(/{{stylesMainUri}}/g, stylesMainUri.toString())
            .replace(/{{project}}/g, project)
            .replace(/{{solution}}/g, solution)
            .replace(
                /{{sdkOptions}}/g,
                this._sdks
                    .map((sdk) => `<option value="${sdk}">${sdk}</option>`)
                    .join("")
            )
            .replace(
                "</head>",
                `<meta http-equiv="Content-Security-Policy" content="${this._csp
                    .replace(/\s+/g, " ")
                    .trim()}"></head>`
            );
    }
}
