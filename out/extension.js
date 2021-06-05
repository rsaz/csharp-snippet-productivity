"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const CommandRegister_1 = require("./CommandRegister");
function activate(context) {
    const commands = CommandRegister_1.CommandRegister.getInstance();
    commands.initializeCommands(context);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map