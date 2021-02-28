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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const createProject_1 = require("./createProject");
const smartComments_1 = require("./smartComments");
const createFile_1 = require("./createFile");
function activate(context) {
    // smart comments activation
    let smartComment = new smartComments_1.SmartComments(context);
    smartComment.activateSmartComments();
    context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createProject', () => __awaiter(this, void 0, void 0, function* () {
        createProject_1.CreateProjectPanel.createOrShow(context.extensionUri);
    })));
    context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createClass', (uri) => __awaiter(this, void 0, void 0, function* () {
        createFile_1.DocumentGenerator.init(uri, 'class');
    })));
    context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createInterface', (uri) => __awaiter(this, void 0, void 0, function* () {
        createFile_1.DocumentGenerator.init(uri, 'interface');
    })));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map