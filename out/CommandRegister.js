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
exports.CommandRegister = void 0;
const vscode = require("vscode");
const CreateProject_1 = require("./resource/createProjectWebView/CreateProject");
const SmartComments_1 = require("./resource/smartComments/SmartComments");
const ContextualMenu_1 = require("./resource/contextualMenu/ContextualMenu");
const TodoListProvider_1 = require("./resource/todoList/TodoListProvider");
const Constants_1 = require("./resource/todoList/Constants");
const Decoration_1 = require("./resource/todoList/Decoration");
/**
 * Singleton class to hold all CommandRegister configuration
 * This class is used to register new CommandRegister available in the system
 */
class CommandRegister {
    constructor() {
    }
    static getInstance() {
        if (!CommandRegister.instance) {
            CommandRegister.instance = new CommandRegister();
        }
        return CommandRegister.instance;
    }
    // Initialize all CommandRegister
    initializeCommands(context) {
        this.context = context;
        this.createProject();
        this.menuActivation();
        this.smartCommentsActivation();
        //this.activateTodoList();
    }
    // ****** Command registration ******
    smartCommentsActivation() {
        let smartComment = new SmartComments_1.SmartComments(this.context);
        smartComment.activateSmartComments();
    }
    createProject() {
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createProject', () => __awaiter(this, void 0, void 0, function* () {
            CreateProject_1.CreateProjectPanel.createOrShow(this.context.extensionUri);
        })));
    }
    menuActivation() {
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createClass', (uri) => __awaiter(this, void 0, void 0, function* () {
            ContextualMenu_1.ContextualMenu.init(uri, 'class');
        })));
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createInterface', (uri) => __awaiter(this, void 0, void 0, function* () {
            ContextualMenu_1.ContextualMenu.init(uri, 'interface');
        })));
    }
    activateTodoList() {
        const todoListProvider = new TodoListProvider_1.TodoListProvider();
        let editor = vscode.window.activeTextEditor;
        vscode.window.registerTreeDataProvider(Constants_1.VIEWS.TODO_LIST, todoListProvider);
        Decoration_1.Decoration.config(vscode.workspace.getConfiguration(Constants_1.EXTENSION_ID));
        styleText(editor);
        this.context.subscriptions.push(vscode.commands.registerCommand(Constants_1.COMMANDS.REFRESH, () => { todoListProvider.refresh(); }));
        this.context.subscriptions.push(vscode.commands.registerCommand(Constants_1.COMMANDS.OPEN_FILE, (uri, col) => {
            vscode.window.showTextDocument(uri)
                .then((editor) => {
                const pos = new vscode.Position(col, 0);
                editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
                editor.selection = new vscode.Selection(pos, pos);
            });
        }));
        vscode.window.onDidChangeActiveTextEditor((e) => { if (e) {
            editor = e;
            styleText(e);
        } });
        vscode.workspace.onDidChangeTextDocument(() => { styleText(editor); });
        vscode.workspace.onDidSaveTextDocument(() => { todoListProvider.refresh(); });
        vscode.workspace.onDidChangeConfiguration(() => __awaiter(this, void 0, void 0, function* () {
            Decoration_1.Decoration.config(vscode.workspace.getConfiguration(Constants_1.EXTENSION_ID));
            styleText(editor);
            todoListProvider.refresh();
        }));
    }
}
exports.CommandRegister = CommandRegister;
// supporting function to activate todo list
function styleText(editor) {
    if (!editor) {
        return;
    }
    const doc = editor.document;
    const str = doc.getText();
    let match;
    while ((match = Constants_1.REGEX.exec(str))) {
        editor.setDecorations(vscode.window.createTextEditorDecorationType(Decoration_1.Decoration.decoration()), [new vscode.Range(doc.positionAt(match.index), doc.positionAt(match.index + Constants_1.TODO.length))]);
    }
}
//# sourceMappingURL=CommandRegister.js.map