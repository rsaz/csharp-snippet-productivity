"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentGenerator = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const parentFinder = require("find-parent-dir");
const os = require("os");
const findUpGlob = require('find-up-glob');
class DocumentGenerator {
    static init(uri, fileType) {
        let pathSelected = uri.fsPath;
        vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Type the file name', value: 'New ' + fileType + '.cs' })
            .then((newFileName) => {
            if (typeof (newFileName) === undefined || newFileName === '') {
                vscode.window.showErrorMessage('Please input a valid name or press Scape to cancel the operation!');
                return this.init(uri, fileType);
            }
            let newFilePath = pathSelected + path.sep + newFileName;
            if (fs.existsSync(newFilePath)) {
                vscode.window.showErrorMessage(`File ${newFileName} already exist`);
                return;
            }
            newFilePath = correctFileNameExtension(newFilePath);
            let originalFilePath = newFilePath;
            let rootDir = getProjectRootDirOrFilePath(newFilePath);
            if (rootDir === null) {
                vscode.window.showErrorMessage('Unable to find *.csproj or project.json');
                return;
            }
            // Review: removing trailing separator. Check if works in other OS languages 
            rootDir = (rootDir[rootDir.length - 1] === path.sep) ? rootDir.substring(0, rootDir.length - 1) : rootDir;
            let projRootDir = rootDir.substring(rootDir.lastIndexOf(path.sep) + 1);
            let childFilePath = newFilePath.substring(newFilePath.lastIndexOf(projRootDir));
            // set the regex pattern for path structure
            let pathSepRegEX = /\//g;
            if (os.platform() === 'win32') {
                pathSepRegEX = /\\/g;
            }
            // replace \\ for . in following the namespace convention
            let namespace = path.dirname(childFilePath);
            namespace = namespace.replace(pathSepRegEX, '.');
            // replace file name empty space or dash by underscore
            namespace = namespace.replace(/\s+/g, '_');
            namespace = namespace.replace(/-/g, '_');
            newFilePath = path.basename(newFilePath, '.cs');
            loadTemplate(fileType, namespace, newFilePath, originalFilePath);
        });
    }
}
exports.DocumentGenerator = DocumentGenerator;
// function to fix the file extension in case user forget to input .cs
function correctFileNameExtension(fileName) {
    if (path.extname(fileName) !== '.cs') {
        if (fileName.endsWith('.')) {
            fileName = fileName + 'cs';
        }
        else {
            fileName = fileName + '.cs';
        }
    }
    return fileName;
}
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
// load the template, replace by current values and create the document in the folder selected
function loadTemplate(templateType, namespace, newFilepath, originalFilePath) {
    var _a;
    let fileTemplate = templateType + '.mdl';
    vscode.workspace.openTextDocument(((_a = vscode.extensions.getExtension('richardzampieriprog.csharp-snippet-productivity')) === null || _a === void 0 ? void 0 : _a.extensionPath) + '/models/' + fileTemplate)
        .then((doc) => {
        let content = doc.getText();
        content = content.replace('${namespace}', namespace);
        content = content.replace('${fileName}', newFilepath);
        let cursorPos = findCursorPos(content);
        content = content.replace('${cursor}', '');
        fs.writeFileSync(originalFilePath, content);
        vscode.workspace.openTextDocument(originalFilePath).then((doc) => {
            vscode.window.showTextDocument(doc).then((editor) => {
                let selection = new vscode.Selection(cursorPos, cursorPos);
                editor.selection = selection;
            });
        });
    });
}
// find cursor position in the template file
function findCursorPos(content) {
    var _a;
    let cursorPos = content.indexOf('${cursor}');
    let beforePos = content.substring(0, cursorPos);
    let line = (_a = beforePos.match(/\n/gi)) === null || _a === void 0 ? void 0 : _a.length;
    let charId = beforePos.substring(beforePos.lastIndexOf('\n')).length;
    return new vscode.Position((line !== undefined) ? line : 0, charId);
}
//# sourceMappingURL=createFile.js.map