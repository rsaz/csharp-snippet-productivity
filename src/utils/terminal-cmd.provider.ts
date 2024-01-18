import * as vscode from "vscode";

export type Message = {
    command: string;
    filepath: string;
    solution: string;
    project: string;
    template: string;
    framework: string;
};

export type TemplateCompatibility = {
    [key: string]: string[];
};

export const TEMPLATE_COMPATIBILITY: TemplateCompatibility = {
    react: ["net5.0", "net6.0", "net7.0"],
    // add other templates here
};

export class Command {
    protected terminal: vscode.Terminal;
    protected message: Message;

    constructor(terminal: vscode.Terminal, message: Message) {
        this.terminal = terminal;
        this.message = message;
    }

    executeCommonCommands() {
        this.terminal.sendText(`mkdir '${this.message.filepath}\\${this.message.solution}'`);
        this.terminal.sendText(
            `dotnet new sln -n ${this.message.solution} -o '${this.message.filepath}\\${this.message.solution}' --force`
        );
        this.terminal.sendText(
            `mkdir '${this.message.filepath}\\${this.message.solution}\\${this.message.project}'`
        );
    }

    addProjectToSolution() {
        this.terminal.sendText(
            `dotnet sln '${this.message.filepath}\\${this.message.solution}\\${this.message.solution}.sln' add '${this.message.filepath}\\${this.message.solution}\\${this.message.project}\\${this.message.project}.csproj'`
        );
    }

    openInVsCode() {
        this.terminal.sendText(`code '${this.message.filepath}\\${this.message.solution}' -r`);
    }

    execute() {
        // This method will be overridden in derived classes
    }

    isFrameworkCompatible() {
        // Verify if template is not undefined
        if (!this.message.template || !(this.message.template in TEMPLATE_COMPATIBILITY)) {
            return true;
        }
        return TEMPLATE_COMPATIBILITY[this.message.template].includes(this.message.framework);
    }
}

export class GrpcCommand extends Command {
    execute(): void {
        this.executeCommonCommands();
        this.terminal.sendText(
            `dotnet new grpc -n ${this.message.project} -o '${this.message.filepath}\\${this.message.solution}\\${this.message.project}' --force`
        );
        this.addProjectToSolution();
        this.openInVsCode();
    }
}

export class MinWebApiCommand extends Command {
    execute() {
        if (this.message.framework !== "net6.0") {
            vscode.window.showWarningMessage("Please select net6.0 for Minimal WebAPI");
            return;
        }
        this.executeCommonCommands();
        this.terminal.sendText(
            `dotnet new webapi -minimal --language c# -n ${this.message.project} -o '${this.message.filepath}\\${this.message.solution}\\${this.message.project}' --framework ${this.message.framework} --force`
        );
        this.addProjectToSolution();
        this.openInVsCode();
    }
}

export class DefaultCommand extends Command {
    execute() {
        if (!this.isFrameworkCompatible()) {
            // Format list of compatible frameworks
            const compatibleFrameworks = TEMPLATE_COMPATIBILITY[this.message.template]
                .map((f) => `'${f.substring(3)}'`)
                .join(", ");

            vscode.window.showWarningMessage(
                `Please select a compatible framework for ${this.message.template} - [${
                    compatibleFrameworks || "None"
                }]`
            );
            return;
        }

        this.executeCommonCommands();
        this.terminal.sendText(
            `dotnet new ${this.message.template} -n ${this.message.project} -o '${this.message.filepath}\\${this.message.solution}\\${this.message.project}' --framework ${this.message.framework} --force`
        );
        this.addProjectToSolution();
        this.openInVsCode();
    }
}

export class CommandFactory {
    static getCommand(terminal: vscode.Terminal, message: Message) {
        switch (message.template) {
            case "grpc":
                return new GrpcCommand(terminal, message);
            case "minwebapi":
                return new MinWebApiCommand(terminal, message);
            // Cases for other templates...
            default:
                return new DefaultCommand(terminal, message);
        }
    }
}
