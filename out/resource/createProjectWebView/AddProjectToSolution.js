"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProjectToSolution = void 0;
const vscode = require("vscode");
const parentFinder = require("find-parent-dir");
const path = require("path");
const fs = require("fs");
const findUpGlob = require('find-up-glob');
class AddProjectToSolution {
    static init(uri) {
        // TODO: verify if solution exist, if exist create a project with terminal
        let pathSelected = uri.fsPath;
        vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Type the project name', value: 'New project name' })
            .then((newFileName) => {
            if (typeof (newFileName) === undefined || newFileName === '') {
                vscode.window.showErrorMessage('Please input a valid name or press Scape to cancel the operation!');
                return this.init(uri);
            }
            let newFilePath = pathSelected + path.sep + newFileName;
            if (fs.existsSync(newFilePath)) {
                vscode.window.showErrorMessage(`Project ${newFileName} already exist`);
                return;
            }
            let rootDir = getProjectRootDirOrFilePath(newFilePath);
            if (rootDir === null) {
                vscode.window.showErrorMessage('Unable to find *.csproj or project.json');
                return;
            }
        });
    }
}
exports.AddProjectToSolution = AddProjectToSolution;
// function to detect the root directory where the .csproj is included
function getProjectRootDirOrFilePath(filePath) {
    var projectRootDir = parentFinder.sync(path.dirname(filePath), 'project.json');
    if (projectRootDir === null) {
        let csProjFiles = findUpGlob.sync('*.csproj', { cwd: path.dirname(filePath) });
        if (csProjFiles === null) {
            return null;
        }
        projectRootDir = path.dirname(csProjFiles[0]);
    }
    return projectRootDir;
}
//# sourceMappingURL=AddProjectToSolution.js.map