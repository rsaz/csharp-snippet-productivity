"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProjectToSolution = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const Panel_1 = require("./Panel");
class AddProjectToSolution {
    static init(uri, context) {
        vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Type the project name', value: 'New project name' })
            .then((newFileName) => {
            var _a, _b;
            if (typeof (newFileName) === undefined || newFileName === '') {
                vscode.window.showErrorMessage('Please input a valid name or press Scape to cancel the operation!');
                return this.init(uri, context);
            }
            // Acquiring the solution root folder
            let root = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.map(folder => folder.uri.path)[0].replace(/\//g, '\\');
            root = root === null || root === void 0 ? void 0 : root.slice(1, root.length);
            // Removing white spaces within the new project name
            if (newFileName)
                newFileName = newFileName.replace(/\s/g, "");
            // Setting the new project path
            const newFilePath = root + path.sep + newFileName;
            // Verify if project already exist
            if (fs.existsSync(newFilePath)) {
                vscode.window.showErrorMessage(`Project ${newFileName} already exist`);
                return this.init(uri, context);
            }
            let rootDir = getProjectRootDirOrFilePath(root);
            if (rootDir === null) {
                vscode.window.showErrorMessage('Unable to find *.sln (solution)');
                return;
            }
            // Create a project
            // TODO: Pass project solution, project name
            if (newFileName) {
                const panel = new Panel_1.Panel(context, newFileName, rootDir, "Add Project", { folder: 'media', file: 'addProjectIcon.png' });
                (_b = panel.webViewPanel) === null || _b === void 0 ? void 0 : _b.onDidDispose(() => { panel.webViewPanel = undefined; }, context.subscriptions);
            }
            ;
        });
    }
}
exports.AddProjectToSolution = AddProjectToSolution;
// function to detect the root directory where the .csproj is included
function getProjectRootDirOrFilePath(filePath) {
    const paths = filePath.split("\\");
    const solution = filePath + path.sep + paths[paths.length - 1] + '.sln';
    if (!fs.existsSync(solution)) {
        return null;
    }
    return solution;
}
//# sourceMappingURL=AddProjectToSolution.js.map