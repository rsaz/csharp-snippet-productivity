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
const AddProjectToSolution_1 = require("./resource/addProjectToSolution/AddProjectToSolution");
/**
 * Singleton class to hold all CommandRegister configuration
 * This class is used to register new CommandRegister available in the system
 */
class CommandRegister {
    constructor() { }
    static getInstance() {
        if (!CommandRegister._instance) {
            CommandRegister._instance = new CommandRegister();
        }
        return CommandRegister._instance;
    }
    // Initialize all commands
    initializeCommands(context) {
        this.context = context;
        this.createProject();
        this.addProjectToSolution();
        this.menuActivation();
        this.smartCommentsActivation();
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
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createStruct', (uri) => __awaiter(this, void 0, void 0, function* () {
            ContextualMenu_1.ContextualMenu.init(uri, 'struct');
        })));
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createRecord', (uri) => __awaiter(this, void 0, void 0, function* () {
            ContextualMenu_1.ContextualMenu.init(uri, 'record');
        })));
    }
    addProjectToSolution() {
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.addProjectToSolution', (uri) => __awaiter(this, void 0, void 0, function* () {
            AddProjectToSolution_1.AddProjectToSolution.init(uri, this.context);
        })));
    }
}
exports.CommandRegister = CommandRegister;
//# sourceMappingURL=CommandRegister.js.map