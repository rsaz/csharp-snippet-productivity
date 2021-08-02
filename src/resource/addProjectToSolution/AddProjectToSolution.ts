import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Panel } from './Panel';


export class AddProjectToSolution {
    
    public static init(uri: vscode.Uri, context: vscode.ExtensionContext) {
            vscode.window.showInputBox({ignoreFocusOut: true, prompt: 'Type the project name', value: 'New project name'})
                .then((newFileName) => {
                    if (typeof(newFileName) === undefined || newFileName === '') {
                        vscode.window.showErrorMessage('Please input a valid name or press Scape to cancel the operation!');
                        return this.init(uri, context); 
                    }
                    
                    // Acquiring the solution root folder
                    let root = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0]
                    .replace(/\//g,'\\');
                    root = root?.slice(1, root.length);
                    
                    // Removing white spaces within the new project name
                    if (newFileName) newFileName = newFileName.replace(/\s/g, "");

                    // Setting the new project path
                    const newFilePath = root + path.sep + newFileName;
    
                    // Verify if project already exist
                    if (fs.existsSync(newFilePath)) {
                        vscode.window.showErrorMessage(`Project ${newFileName} already exist`);
                        return this.init(uri, context);    
                    }
                    
                    let rootDir = getProjectRootDirOrFilePath(root);
    
                    if (rootDir === null){
                        vscode.window.showErrorMessage('Unable to find *.sln (solution)');
                        return;
                    }
                    
                    // Create a project
                    // TODO: Pass project solution, project name
                    if (newFileName) {
                        const panel = new Panel(context, newFileName, rootDir, "Add Project", {folder: 'media', file: 'addProjectIcon.png'});
                        panel.webViewPanel?.onDidDispose(()=> {panel.webViewPanel = undefined;}, context.subscriptions);
                        
                    };
                }
            ); 
    }
}

// function to detect the root directory where the .csproj is included
function getProjectRootDirOrFilePath(filePath: any){
    const paths : string[] = filePath.split("\\");
    const solution: string = filePath + path.sep + paths[paths.length-1] + '.sln';
    
    if (!fs.existsSync(solution)) {
        return null;
    }
    return solution;
}