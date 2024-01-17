import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as parentFinder from "find-parent-dir";
import * as os from "os";
const findUpGlob = require("find-up-glob");
const lineByLine = require("n-readlines");

class ContextualMenu {
    public static async init(uri: vscode.Uri, fileType: string, framework: string) {
        // Ensure that a project is selected
        const projectRoot = await selectProject();

        if (!projectRoot) {
            vscode.window.showErrorMessage("No project selected");
            return;
        }

        // Open folder picker at the root of the selected project
        const selectedFolder = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
            defaultUri: vscode.Uri.file(projectRoot),
            openLabel: "Select folder",
        });

        if (!selectedFolder || selectedFolder.length === 0) {
            vscode.window.showErrorMessage("No folder selected");
            return;
        }

        const pathSelected = selectedFolder[0].fsPath;

        vscode.window
            .showInputBox({
                ignoreFocusOut: true,
                prompt: "Type the file name",
                value: "New " + fileType + ".cs",
            })
            .then((newFileName) => {
                if (typeof newFileName === undefined || newFileName === "") {
                    vscode.window.showErrorMessage(
                        "Please input a valid name or press Scape to cancel the operation!"
                    );
                    return this.init(uri, fileType, framework);
                }

                if (newFileName) {
                    newFileName = newFileName.replace(/\s/g, "");
                } else {
                    newFileName = "New" + fileType + ".cs";
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
                    vscode.window.showErrorMessage("Unable to find *.csproj or project.json");
                    return;
                }

                let rootNamespace: any = checkRootNameOnCsproj(newFilePath);

                // Review: removing trailing separator. Check if works in other OS languages
                rootDir =
                    rootDir[rootDir.length - 1] === path.sep
                        ? rootDir.substring(0, rootDir.length - 1)
                        : rootDir;

                let projRootDir = rootDir.substring(rootDir.lastIndexOf(path.sep) + 1);
                let childFilePath = newFilePath.substring(newFilePath.lastIndexOf(projRootDir));

                if (rootNamespace !== null) {
                    childFilePath = childFilePath.replace(
                        childFilePath.substring(0, childFilePath.indexOf("\\")),
                        rootNamespace
                    );
                }

                // set the regex pattern for path structure
                let pathSepRegEX = /\//g;
                if (os.platform() === "win32") {
                    pathSepRegEX = /\\/g;
                }

                // replace \\ for . in following the namespace convention
                let namespace = path.dirname(childFilePath);
                namespace = namespace.replace(pathSepRegEX, ".");

                // replace file name empty space or dash by underscore
                namespace = namespace.replace(/\s+/g, "_");
                namespace = namespace.replace(/-/g, "_");

                newFilePath = path.basename(newFilePath, ".cs");

                loadTemplate(fileType, namespace, newFilePath, originalFilePath, framework);
            });
    }
}

export { ContextualMenu };

// function to fix the file extension in case user forget to input .cs
function correctFileNameExtension(fileName: any) {
    if (path.extname(fileName) !== ".cs") {
        if (fileName.endsWith(".")) {
            fileName = fileName + "cs";
        } else {
            fileName = fileName + ".cs";
        }
    }
    return fileName;
}

// function to detect the root directory where the .csproj is included
function getProjectRootDirOrFilePath(filePath: any) {
    var projectRootDir = parentFinder.sync(path.dirname(filePath), "project.json");
    if (projectRootDir === null) {
        let csProjFiles = findUpGlob.sync("*.csproj", { cwd: path.dirname(filePath) });

        if (csProjFiles === null) {
            return null;
        }
        projectRootDir = path.dirname(csProjFiles[0]);
    }
    return projectRootDir;
}

// load the template, replace by current values and create the document in the folder selected
function loadTemplate(
    templateType: string,
    namespace: string,
    newFilepath: string,
    originalFilePath: string,
    framework: string
) {
    let fileTemplate: string = "";

    if (framework === "net6.0") {
        fileTemplate = templateType + "6.mdl";
    } else {
        fileTemplate = templateType + ".mdl";
    }

    vscode.workspace
        .openTextDocument(
            vscode.extensions.getExtension("richardzampieriprog.csharp-snippet-productivity")
                ?.extensionPath +
                "/models/" +
                fileTemplate
        )
        .then((doc: vscode.TextDocument) => {
            let content = doc.getText();
            content = content.replace("${namespace}", namespace);
            content = content.replace("${fileName}", newFilepath);
            let cursorPos = findCursorPos(content);
            content = content.replace("${cursor}", "");
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
function findCursorPos(content: string) {
    let cursorPos = content.indexOf("${cursor}");
    let beforePos = content.substring(0, cursorPos);
    let line = beforePos.match(/\n/gi)?.length;
    let charId = beforePos.substring(beforePos.lastIndexOf("\n")).length;
    return new vscode.Position(line !== undefined ? line : 0, charId);
}

// function to check root namespace in the csproj file
function checkRootNameOnCsproj(filePath: string) {
    let rootNamespace: string = findUpGlob.sync("*.csproj", { cwd: path.dirname(filePath) })[0];
    const liner = new lineByLine(rootNamespace);
    let line;

    while ((line = liner.next())) {
        let l = line.toString("ascii");
        let result: string = l.match(/<RootNamespace>(.*?)<\/RootNamespace>/g);
        if (result === null) {
            continue;
        }
        let content = result[0];

        let root: string = content.substring(content.indexOf(">") + 1, content.indexOf("</"));

        if (root !== null && root !== "") {
            return root;
        }
    }

    return null;
}

// Updated function to list project folders
async function selectProject(): Promise<string | undefined> {
    const solutionFolders = vscode.workspace.workspaceFolders;
    if (!solutionFolders || solutionFolders.length === 0) {
        return undefined;
    }

    const csprojFiles = await vscode.workspace.findFiles("**/*.csproj");
    const projects = csprojFiles.map((file) => {
        return {
            label: path.basename(file.fsPath),
            detail: path.dirname(file.fsPath),
        };
    });

    const selectedProject = await vscode.window.showQuickPick(projects, {
        placeHolder: "Select a project",
    });

    return selectedProject?.detail;
}
