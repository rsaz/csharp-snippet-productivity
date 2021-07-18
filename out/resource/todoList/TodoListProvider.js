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
exports.TodoListProvider = void 0;
const vscode_1 = require("vscode");
const Constants_1 = require("./Constants");
const Decoration_1 = require("./Decoration");
class TodoListProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!element) {
                return Promise.resolve(yield this.getTodoList());
            }
            return Promise.resolve((_a = element.children) !== null && _a !== void 0 ? _a : []);
        });
    }
    getTodoList() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const arr1 = [];
            const files = yield vscode_1.workspace.findFiles(pattern(Decoration_1.Decoration.include(), Constants_1.INCLUDE), pattern(Decoration_1.Decoration.exclude(), Constants_1.EXCLUDE), Constants_1.MAX_RESULTS);
            if (files.length) {
                for (let i = 0; i < files.length; i++) {
                    const arr2 = [];
                    const file = files[i];
                    const doc = yield vscode_1.workspace.openTextDocument(file);
                    const docUri = doc.uri;
                    const fileName = (_a = doc.fileName
                        .replace(/\\/g, '/')
                        .split('/').pop()) !== null && _a !== void 0 ? _a : 'unknown';
                    let k = 1;
                    for (let j = 0; j < doc.lineCount; j++) {
                        const text = doc.lineAt(j).text;
                        if (Constants_1.REGEX.test(text)) {
                            const todoText = text.slice(text.indexOf(Constants_1.TODO) + Constants_1.TODO.length + 1, text.length);
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
                else {
                    return 1;
                }
                return 0;
            });
        });
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.TodoListProvider = TodoListProvider;
class TodoItem extends vscode_1.TreeItem {
    constructor(label, children, path, col) {
        super(label, children ? vscode_1.TreeItemCollapsibleState.Expanded : vscode_1.TreeItemCollapsibleState.None);
        this.label = label;
        this.children = children;
        this.iconPath = new vscode_1.ThemeIcon('file');
        if (path) {
            this.resourceUri = path;
        }
        this.description = !children;
        this.command = {
            command: Constants_1.COMMANDS.OPEN_FILE,
            title: 'Open file',
            arguments: [path, col]
        };
    }
}
function pattern(glob, def) {
    if (Array.isArray(glob) && glob.length) {
        return '{' + glob.join(',') + '}';
    }
    return '{' + def.join(',') + '}';
}
//# sourceMappingURL=TodoListProvider.js.map