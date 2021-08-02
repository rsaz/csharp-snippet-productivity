"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Panel = void 0;
const vscode_1 = require("vscode");
const path = require("path");
const fs = require("fs");
class Panel {
    constructor(context, projectName, solution, title, iconPath = { folder: '', file: '' }, viewColumn = vscode_1.ViewColumn.One, preserveFocus = false, enableFindWidget = false, retainContextWhenHidden = false) {
        var _a;
        this._webViewPanel = undefined;
        // context from the extension main entry point
        this._context = context;
        this._projectName = projectName;
        this._solution = solution;
        let _viewType = title.replace(/[^A-Z0-9]/ig, "-");
        if (this._webViewPanel) {
            this._webViewPanel.reveal((_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.viewColumn);
        }
        else {
            // creating the panel
            this._webViewPanel = vscode_1.window.createWebviewPanel(_viewType, title, { preserveFocus, viewColumn }, { enableFindWidget, retainContextWhenHidden });
            this._webViewPanel.iconPath = vscode_1.Uri.file(path.join(this._context.extensionPath, iconPath.folder, iconPath.file));
            // webview options
            this._webViewPanel.webview.options = {
                enableCommandUris: false,
                enableScripts: true,
                localResourceRoots: [
                    vscode_1.Uri.file(path.join(this._context.extensionPath, 'media')),
                    vscode_1.Uri.file(path.join(this._context.extensionPath, 'out')),
                ],
                portMapping: []
            };
            // html content
            // Review: review th sdks. They are manually being inserted currently
            //this._sdks = this._webViewPanel.webview.asWebviewUri(Uri.file(path.join(this._context.extensionPath, 'media', 'sdks.txt')));
            //this._sdks = this.getTargetFrameworks(sdksResource);
            this._resetCss = this._webViewPanel.webview.asWebviewUri(vscode_1.Uri.file(path.join(this._context.extensionPath, 'media', 'reset.css')));
            this._vscodeCss = this._webViewPanel.webview.asWebviewUri(vscode_1.Uri.file(path.join(this._context.extensionPath, 'media', 'vscode.css')));
            this._script = this._webViewPanel.webview.asWebviewUri(vscode_1.Uri.file(path.join(this._context.extensionPath, 'media', 'addProject.js')));
            this._webViewPanel.webview.html = this.baseHtml('index.html', this._resetCss, this._vscodeCss, this._script);
        }
        // control event listener
        this._webViewPanel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            switch (message.command) {
                case "addProject":
                    yield this.addProject(message);
                    return;
            }
        }));
    }
    // TODO: Add the framework list in the add project load
    getSDKs(sdksResource) {
        const sdksList = fs.readFileSync(sdksResource.fsPath, 'utf8');
        let lines = sdksList.split('\n');
        let sdks = [];
        lines.forEach((line) => {
            let lineUpdated = line.replace(/\s+/g, '');
            lineUpdated = lineUpdated.replace(/[^a-z0-9A-Z.]/g, '');
            let sdk = lineUpdated.substring(0, 3);
            if (sdk) {
                sdks.push(sdk);
            }
        });
        // Eliminate duplicates
        sdks = sdks.filter((value, index, self) => self.indexOf(value) === index);
        return sdks;
    }
    addProject(message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let root = (_a = vscode_1.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.map(folder => folder.uri.path)[0].replace(/\//g, '\\');
            root = root === null || root === void 0 ? void 0 : root.slice(1, root.length);
            const terminal = vscode_1.window.createTerminal();
            terminal.show(true);
            terminal.sendText("dotnet new " + message.template + " --language c# -n " + message.project + " -o " + root + "\\" + message.project + " -f " + message.framework + " --force");
            terminal.sendText("dotnet sln " + this._solution + " add " + root + "\\" + message.project + "\\" + message.project + ".csproj");
        });
    }
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    get webViewPanel() { return this._webViewPanel; }
    set webViewPanel(panelInstance) { this._webViewPanel = panelInstance; }
    set iconPath(icon) {
        if (this._webViewPanel) {
            if (Array.isArray(icon)) {
                this._webViewPanel.iconPath = {
                    dark: vscode_1.Uri.file(path.join(this._context.extensionPath, icon[0].folder, icon[0].file)),
                    light: vscode_1.Uri.file(path.join(this._context.extensionPath, icon[1].folder, icon[1].file))
                };
            }
            else {
                this._webViewPanel.iconPath = vscode_1.Uri.file(path.join(this._context.extensionPath, icon.folder, icon.file));
            }
        }
    }
    set options(options) {
        if (this._webViewPanel) {
            this._webViewPanel.webview.options = options;
        }
    }
    allowedLocalResource(...folders) {
        if (this._webViewPanel) {
            let foldersRoot = [];
            for (let i = 0; i < folders.length; i++) {
                foldersRoot[i] = vscode_1.Uri.file(path.join(this._context.extensionPath, folders[i]));
            }
            this._webViewPanel.webview.options = {
                localResourceRoots: foldersRoot
            };
        }
    }
    set html(htmlDoc) {
        if (this._webViewPanel) {
            this._webViewPanel.webview.html = htmlDoc;
        }
        ;
    }
    addResource(content) {
        var _a;
        const diskResource = vscode_1.Uri.file(path.join(this._context.extensionPath, content.folder, content.resource));
        return (_a = this._webViewPanel) === null || _a === void 0 ? void 0 : _a.webview.asWebviewUri(diskResource);
    }
    baseHtml(page, ...resource) {
        let html = fs.readFileSync(path.join(this._context.extensionPath, 'media', page), 'utf-8');
        html = html.replace(`{{project}}`, this._projectName);
        html = html.replace(`{{stylesResetUri}}`, resource[0].toString());
        html = html.replace(`{{stylesMainUri}}`, resource[1].toString());
        html = html.replace(`{{script}}`, resource[2].toString());
        if (this._webViewPanel) {
            html = html.split(`{{nonce}}`).join(this.getNonce());
            html = html.split(`{{cspSource}}`).join(this._webViewPanel.webview.cspSource);
        }
        ;
        return html.toString();
    }
}
exports.Panel = Panel;
//# sourceMappingURL=Panel.js.map