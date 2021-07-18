import {EventEmitter, GlobPattern, workspace, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri} from 'vscode';
import { COMMANDS, EXCLUDE, INCLUDE, MAX_RESULTS, REGEX, TODO } from './Constants';
import { Decoration } from './Decoration';

export class TodoListProvider implements TreeDataProvider<TodoItem> {
    
    private _onDidChangeTreeData = new EventEmitter<TodoItem | void | null | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event; 
    
    getTreeItem(element: TodoItem): TreeItem {
        return element;
    }
    
    async getChildren(element?: TodoItem): Promise<TodoItem[]> {
        if (!element)
        {
            return Promise.resolve(await this.getTodoList());
        }
        return Promise.resolve(element.children ?? []); 
    }

    private async getTodoList(): Promise<TodoItem[]> {
        const arr1: TodoItem[] = [];
        const files = await workspace.findFiles(
          pattern(Decoration.include(), INCLUDE),
          pattern(Decoration.exclude(), EXCLUDE),
          MAX_RESULTS
        );
    
        if (files.length) {
          for (let i = 0; i < files.length; i++) {
            const arr2: TodoItem[] = [];
            const file = files[i];
            const doc = await workspace.openTextDocument(file);
            const docUri = doc.uri;
            const fileName = doc.fileName
              .replace(/\\/g, '/')
              .split('/').pop()
              ?? 'unknown';
            let k = 1;
    
            for (let j = 0; j < doc.lineCount; j++) {
              const text = doc.lineAt(j).text;
    
              if (REGEX.test(text)) {
                const todoText = text.slice(text.indexOf(TODO) + TODO.length + 1, text.length);
                if (todoText) {
                  arr2.push(new TodoItem(`${k}. ${todoText}`, undefined, docUri, j));
                  k++;
                }
              }
            }
    
            if (arr2.length) {
                arr1.push(new TodoItem(fileName, arr2, docUri));
            }
          }
        }
    
        return arr1.sort(({ label: label1 }, { label: label2 }) => {
          const l1 = label1.toLowerCase();
          const l2 = label2.toLowerCase();
    
          if (l1 < l2) {
            return -1;
          }
          else
          {
            return 1;
          } 

          return 0;
        });
      }
    
      refresh(): void {
        this._onDidChangeTreeData.fire();
      }
}

class TodoItem extends TreeItem {
    label: string;
    children: TodoItem[] | undefined;
    
    constructor(label: string, children?: TodoItem[], path?: Uri, col?: number) {
        super(label, children? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.None);
        
        this.label = label;
        this.children = children;
        this.iconPath = new ThemeIcon('file');
        if (path) {
            this.resourceUri = path;
        }
        this.description = !children;
        this.command =  {
            command: COMMANDS.OPEN_FILE,
            title: 'Open file',
            arguments: [path, col]
        };
    }
    
}

function pattern(glob: string[], def: string[]): GlobPattern {
    if (Array.isArray(glob) && glob.length) {
      return '{' + glob.join(',') + '}';
    }
  
    return '{' + def.join(',') + '}';
  }