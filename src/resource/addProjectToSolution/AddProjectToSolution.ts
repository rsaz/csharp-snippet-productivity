import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { Panel } from "./Panel";

export class AddProjectToSolution {
    public static init(uri: vscode.Uri, context: vscode.ExtensionContext) {
        vscode.window
            .showInputBox({
                ignoreFocusOut: true,
                prompt: "Type the project name",
                value: "New project name",
            })
            .then((newFileName) => {
                if (typeof newFileName === undefined || newFileName === "") {
                    vscode.window.showErrorMessage(
                        "Please input a valid name or press Scape to cancel the operation!"
                    );
                    return this.init(uri, context);
                }

                // Acquiring the solution root folder
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders || workspaceFolders.length === 0) {
                    vscode.window.showErrorMessage(
                        "No workspace folder is open"
                    );
                    return;
                }

                let root = workspaceFolders[0].uri.path.replace(/\//g, "\\");
                root = root.slice(1, root.length);

                // Removing white spaces within the new project name
                if (newFileName) {
                    newFileName = newFileName.replace(/\s/g, "");
                }

                // Setting the new project path
                if (!newFileName) {
                    vscode.window.showErrorMessage(
                        "Project name cannot be empty"
                    );
                    return;
                }
                const newFilePath = path.join(root, newFileName);

                // Verify if project already exist
                if (fs.existsSync(newFilePath)) {
                    vscode.window.showErrorMessage(
                        `Project ${newFileName} already exist`
                    );
                    return this.init(uri, context);
                }

                let rootDir = getProjectRootDirOrFilePath(root);

                if (rootDir === null) {
                    vscode.window.showErrorMessage(
                        "Unable to find *.sln (solution)"
                    );
                    return;
                }

                // Create a project
                if (newFileName) {
                    const panel = new Panel(
                        context,
                        newFileName,
                        rootDir,
                        "Add Project",
                        {
                            folder: "media",
                            file: "addProjectIcon.png",
                        }
                    );
                    panel.webViewPanel?.onDidDispose(() => {
                        panel.webViewPanel = undefined;
                    }, context.subscriptions);
                }
            });
    }
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
