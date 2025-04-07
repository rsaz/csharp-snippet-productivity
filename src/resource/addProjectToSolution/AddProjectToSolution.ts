import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { getTargetFrameworks } from "../../utils/sdk.provider";
import { getNonce } from "../createProjectWebView/GetNonce";
import {
    CommandFactory,
    TEMPLATE_COMPATIBILITY,
    Message,
} from "../../utils/terminal-cmd.provider";

type FrameworkCommand = {
    [key: string]: string;
};

const frameworkCommands: FrameworkCommand = {
    ["3.1"]: "netcoreapp3.1",
    ["5.0"]: "net5.0",
    ["6.0"]: "net6.0",
    ["7.0"]: "net7.0",
    ["8.0"]: "net8.0",
};

export class AddProjectToSolution {
    private static context: vscode.ExtensionContext;
    private static _panel: vscode.WebviewPanel;
    private static _disposables: vscode.Disposable[] = [];
    private static _sdks: string[] = [];
    private static _csp: string;
    private static _solution: string;

    public static init(uri: vscode.Uri, context: vscode.ExtensionContext) {
        this.context = context;

        // Get the solution file path
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage("No workspace folder is open");
            return;
        }

        let root = workspaceFolders[0].uri.path.replace(/\//g, "\\");
        root = root.slice(1, root.length);
        const solutionPath = getProjectRootDirOrFilePath(root);

        if (solutionPath === null) {
            vscode.window.showErrorMessage("Unable to find *.sln (solution)");
            return;
        }
        this._solution = solutionPath;

        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (AddProjectToSolution._panel) {
            AddProjectToSolution._panel.reveal(column);
            AddProjectToSolution.update();
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            "add-project",
            "Add Project",
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

        AddProjectToSolution.defaultConstructor(panel);
    }

    private static async defaultConstructor(panel: vscode.WebviewPanel) {
        this._panel = panel;

        // OnPanel Close
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case "addProject":
                        await this.addProject(message);
                        return;
                }
            },
            null,
            this._disposables
        );

        // Set the Webview initial html content
        this.update();
    }

    private static async addProject(message: Message): Promise<void> {
        let root = vscode.workspace.workspaceFolders?.map(
            (folder) => folder.uri.fsPath
        )[0];

        if (!root) {
            vscode.window.showErrorMessage("No workspace folder is open");
            return;
        }

        // Get the framework command
        message.framework = frameworkCommands[message.framework];

        const terminal = vscode.window.createTerminal();
        terminal.show(true);

        if (!isFrameworkCompatible(message)) {
            // Format list of compatible frameworks
            const compatibleFrameworks = TEMPLATE_COMPATIBILITY[
                message.template
            ]
                .map((f: string) => `'${f.substring(3)}'`)
                .join(", ");

            vscode.window.showWarningMessage(
                `Please select a compatible framework for ${
                    message.template
                } - [${compatibleFrameworks || "None"}]`
            );

            setTimeout(() => {
                terminal.dispose();
            }, 5000);

            return;
        }

        try {
            // Create the project first
            const projectPath = path.join(root, message.project);
            const createProjectCommand = `dotnet new ${message.template} --language c# -n ${message.project} -o "${projectPath}" -f ${message.framework} --force`;
            terminal.sendText(createProjectCommand);

            // Wait for project creation to complete (3 seconds should be enough for most cases)
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Now add the project to the solution
            const projectFile = path.join(
                projectPath,
                `${message.project}.csproj`
            );
            const addToSolutionCommand = `dotnet sln "${this._solution}" add "${projectFile}"`;
            terminal.sendText(addToSolutionCommand);

            // Show success message and dispose terminal after a delay
            setTimeout(() => {
                vscode.window.showInformationMessage(
                    `Successfully added project ${message.project} to solution`
                );
                terminal.dispose();

                // Close the WebView after the project is created
                if (this._panel) {
                    this._panel.dispose();
                }
            }, 2000);
        } catch (error: any) {
            console.error("Error creating project:", error);
            vscode.window.showErrorMessage(
                `Failed to create project: ${error?.message || "Unknown error"}`
            );
            terminal.dispose();
        }
    }

    private static async update(
        projectGroupName: any = "Select Project Type",
        projectGroup: any = "api",
        templateName: any = "Select Template",
        template: any = "console",
        project: any = "",
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

    private static dispose() {
        AddProjectToSolution._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}

function isFrameworkCompatible(message: Message): boolean {
    // Verify if template is not undefined
    if (!message.template || !(message.template in TEMPLATE_COMPATIBILITY)) {
        return true;
    }
    return TEMPLATE_COMPATIBILITY[message.template].includes(message.framework);
}

// function to detect the root directory where the .csproj is included
function getProjectRootDirOrFilePath(filePath: string): string | null {
    if (!filePath) {
        return null;
    }

    const paths = filePath.split("\\");
    if (paths.length === 0) {
        return null;
    }

    const solution = path.join(filePath, `${paths[paths.length - 1]}.sln`);

    if (!fs.existsSync(solution)) {
        return null;
    }
    return solution;
}
