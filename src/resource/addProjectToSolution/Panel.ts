import {window, Uri, ViewColumn, WebviewPanel, ExtensionContext, WebviewOptions, workspace} from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class Panel {
    
    readonly _context: ExtensionContext;    
    private _webViewPanel: WebviewPanel | undefined = undefined;
    private _vscodeCss!: Uri;
    private _resetCss!: Uri;
    private _script!: Uri;
    private _projectName: string;
    private _solution: string;
    private _sdks!: Uri;
     
    constructor(
    context: ExtensionContext,
    projectName: string,
    solution: string,
    title: string,
    iconPath: {folder: string, file: string} = {folder:'', file:''},
    viewColumn: ViewColumn = ViewColumn.One,
    preserveFocus: boolean = false,
    enableFindWidget: boolean = false,
    retainContextWhenHidden: boolean = false
    ) {
        // context from the extension main entry point
        this._context = context;
        this._projectName = projectName;
        this._solution = solution;

        let _viewType:string = title.replace(/[^A-Z0-9]/ig,"-");
        
        if (this._webViewPanel) {
          this._webViewPanel.reveal(window.activeTextEditor?.viewColumn);
        } else {
           // creating the panel
          this._webViewPanel = window.createWebviewPanel(_viewType, title, {preserveFocus, viewColumn},{enableFindWidget, retainContextWhenHidden});
          this._webViewPanel.iconPath = Uri.file(path.join(this._context.extensionPath,iconPath.folder, iconPath.file));
        
          // webview options
          this._webViewPanel.webview.options = {
            enableCommandUris: false,
            enableScripts: true,
            localResourceRoots: [
              Uri.file(path.join(this._context.extensionPath, 'media')),
              Uri.file(path.join(this._context.extensionPath, 'out')),
            ],
            portMapping: []
          };

          // html content
          // Review: review th sdks. They are manually being inserted currently
         //this._sdks = this._webViewPanel.webview.asWebviewUri(Uri.file(path.join(this._context.extensionPath, 'media', 'sdks.txt')));
         //this._sdks = this.getTargetFrameworks(sdksResource);
          this._resetCss = this._webViewPanel.webview.asWebviewUri(Uri.file(path.join(this._context.extensionPath, 'media', 'reset.css')));
          this._vscodeCss = this._webViewPanel.webview.asWebviewUri(Uri.file(path.join(this._context.extensionPath, 'media', 'vscode.css')));
          this._script = this._webViewPanel.webview.asWebviewUri(Uri.file(path.join(this._context.extensionPath, 'media', 'addProject.js')));
          this._webViewPanel.webview.html = this.baseHtml('index.html', this._resetCss, this._vscodeCss,this._script);
        }

        // control event listener
        this._webViewPanel.webview.onDidReceiveMessage(
          async (message) => {
            switch (message.command) {
              case "addProject": 
              await this.addProject(message);
              return;
            }
          }
        );
    }

    // TODO: Add the framework list in the add project load
    private getSDKs(sdksResource: Uri): string[] {

        const sdksList: string = fs.readFileSync(sdksResource.fsPath, 'utf8');
		let lines: string[] = sdksList.split('\n');
		let sdks: string[] = [];
		
		lines.forEach((line: string) => {
			let lineUpdated: string = line.replace(/\s+/g, '');
			lineUpdated = lineUpdated.replace(/[^a-z0-9A-Z.]/g,'');
			let sdk: string = lineUpdated.substring(0,3);
      if (sdk) {
        sdks.push(sdk);
      }
		});

		// Eliminate duplicates
		sdks = sdks.filter((value, index, self) => self.indexOf(value) === index);
    
        return sdks;

    }

    private async addProject(message: any): Promise<void> {

      let root = workspace.workspaceFolders?.map(folder => folder.uri.path)[0]
        .replace(/\//g,'\\');
      root = root?.slice(1, root.length);
      
      const terminal = window.createTerminal();
      terminal.show(true);  
      terminal.sendText("dotnet new "+message.template+" --language c# -n "+message.project+" -o "+root+"\\"+message.project+" -f "+message.framework+" --force");
      terminal.sendText("dotnet sln "+this._solution+" add "+root+"\\"+message.project+"\\"+message.project+".csproj");
    }

    private getNonce() {
      let text = '';
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i:number = 0; i < 32; i++)
      {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

    public get webViewPanel(): WebviewPanel | undefined {return this._webViewPanel;}
    public set webViewPanel(panelInstance: WebviewPanel | undefined) { this._webViewPanel = panelInstance;}

    public set iconPath(icon: {folder: string, file: string} | {folder: string, file: string}[]) {
      if (this._webViewPanel) {
        if (Array.isArray(icon)) {
          this._webViewPanel.iconPath = {
            dark: Uri.file(path.join(this._context.extensionPath,icon[0].folder, icon[0].file)),
            light: Uri.file(path.join(this._context.extensionPath,icon[1].folder, icon[1].file))
          };  
        } else {
          this._webViewPanel.iconPath = Uri.file(path.join(this._context.extensionPath,icon.folder, icon.file));
        }
      }
    }

    public set options(options: WebviewOptions) {
      if (this._webViewPanel) {
        this._webViewPanel.webview.options = options;
      }
    }
    public allowedLocalResource(...folders: string[])
    {
      if (this._webViewPanel) {
        let foldersRoot: Uri[] = [];

        for (let i:number = 0; i < folders.length; i++)
        {
          foldersRoot[i] = Uri.file(path.join(this._context.extensionPath, folders[i]));
        }

        this._webViewPanel.webview.options = {
          localResourceRoots: foldersRoot
        };
      }
    }

    public set html(htmlDoc: string) {
      if (this._webViewPanel) {
        this._webViewPanel.webview.html = htmlDoc;
      };
    }

    public addResource(content: {folder: string, resource: string}): Uri | undefined {
      const diskResource = Uri.file(path.join(this._context.extensionPath, content.folder, content.resource));
      return this._webViewPanel?.webview.asWebviewUri(diskResource);
    }

    private baseHtml(page:string, ...resource: Uri[]): string {
      let html = fs.readFileSync(path.join(this._context.extensionPath, 'media', page), 'utf-8');
      html = html.replace(`{{project}}`, this._projectName);  
      html = html.replace(`{{stylesResetUri}}`, resource[0].toString());  
      html = html.replace(`{{stylesMainUri}}`, resource[1].toString()); 
      html = html.replace(`{{script}}`, resource[2].toString());
      if (this._webViewPanel) {
          html = html.split(`{{nonce}}`).join(this.getNonce());
          html = html.split(`{{cspSource}}`).join( this._webViewPanel.webview.cspSource);
      };
      return html.toString();
    }
}