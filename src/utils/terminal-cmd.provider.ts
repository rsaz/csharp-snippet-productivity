/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";

export type Message = {
    command: string;
    filepath: string;
    solution: string;
    project: string;
    template: string;
    framework: string;
    noHttps?: boolean;
    docker?: boolean;
    containerOs?: string;
    containerBuildType?: string;
    openApi?: boolean;
    noTopLevelStatements?: boolean;
    useControllers?: boolean;
};

export type TemplateCompatibility = {
    [key: string]: string[];
};

export const TEMPLATE_COMPATIBILITY: TemplateCompatibility = {
    react: ["net5.0", "net6.0", "net7.0"],
    maui: ["net7.0", "net8.0"],
    "maui-blazor": ["net7.0", "net8.0"],
    mauilib: ["net7.0", "net8.0"],
    "maui-page-csharp": ["net7.0", "net8.0"],
    "maui-page-xaml": ["net7.0", "net8.0"],
    "maui-view-csharp": ["net7.0", "net8.0"],
    "maui-view-xaml": ["net7.0", "net8.0"],
    "maui-dict-xaml": ["net7.0", "net8.0"],
    android: ["net6.0", "net7.0", "net8.0"],
    androidlib: ["net6.0", "net7.0", "net8.0"],
    webapi: ["netcoreapp3.1", "net5.0", "net6.0", "net7.0", "net8.0"],
    webapiaot: ["net8.0"],
    apicontroller: ["net5.0", "net6.0", "net7.0", "net8.0"],
    blazorserver: ["netcoreapp3.1", "net5.0", "net6.0", "net7.0"],
    "blazorserver-empty": ["net7.0"],
    blazor: ["net5.0", "net6.0", "net7.0", "net8.0"],
    "blazorwasm-empty": ["net5.0", "net6.0", "net7.0", "net8.0"],
    blazorwasm: ["net5.0", "net6.0", "net7.0", "net8.0"],
    classlib: [
        "netstandard2.0",
        "netstandard2.1",
        "net5.0",
        "net6.0",
        "net7.0",
        "net8.0",
    ],
    console: ["net5.0", "net6.0", "net7.0", "net8.0"],
    "console-framework": [
        "net48",
        "net472",
        "net471",
        "net47",
        "net462",
        "net461",
        "net46",
        "net452",
        "net451",
        "net45",
    ],
    grpc: ["net5.0", "net6.0", "net7.0", "net8.0"],
    mvc: ["net5.0", "net6.0", "net7.0", "net8.0"],
    webapp: ["net5.0", "net6.0", "net7.0", "net8.0"],
    angular: ["net5.0", "net6.0", "net7.0", "net8.0"],
    ios: ["net6.0", "net7.0", "net8.0"],
    ioslib: ["net6.0", "net7.0", "net8.0"],
    mstest: ["net5.0", "net6.0", "net7.0", "net8.0"],
    "mstest-playwright": ["net6.0", "net7.0", "net8.0"],
    nunit: ["net5.0", "net6.0", "net7.0", "net8.0"],
    "nunit-playwright": ["net6.0", "net7.0", "net8.0"],
    xunit: ["net5.0", "net6.0", "net7.0", "net8.0"],
    winforms: ["net5.0", "net6.0", "net7.0", "net8.0"],
    wpf: ["net5.0", "net6.0", "net7.0", "net8.0"],
    // ... Add more templates as needed
};

export class Command {
    protected terminal: vscode.Terminal;
    protected message: Message;

    constructor(terminal: vscode.Terminal, message: Message) {
        this.terminal = terminal;
        this.message = message;
    }

    executeCommonCommands() {
        this.terminal.sendText(
            `mkdir '${this.message.filepath}\\${this.message.solution}'`
        );
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
        this.terminal.sendText(
            `code '${this.message.filepath}\\${this.message.solution}' -r`
        );
    }

    execute() {
        // This method will be overridden in derived classes
    }

    isFrameworkCompatible() {
        // Verify if template is not undefined
        if (
            !this.message.template ||
            !(this.message.template in TEMPLATE_COMPATIBILITY)
        ) {
            return true;
        }
        return TEMPLATE_COMPATIBILITY[this.message.template].includes(
            this.message.framework
        );
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

export class DefaultCommand extends Command {
    execute() {
        if (!this.isFrameworkCompatible()) {
            // Format list of compatible frameworks
            const compatibleFrameworks = TEMPLATE_COMPATIBILITY[
                this.message.template
            ]
                .map((f) => `'${f.substring(3)}'`)
                .join(", ");

            vscode.window.showWarningMessage(
                `Please select a compatible framework for ${
                    this.message.template
                } - [${compatibleFrameworks || "None"}]`
            );
            return;
        }

        this.executeCommonCommands();
        const noHttpsFlag = this.message.noHttps ? " --no-https" : "";
        const useControllers = this.message.useControllers
            ? " --use-controllers"
            : " -minimal";
        const noTopLevelStatements = this.message.noTopLevelStatements
            ? " --use-program-main"
            : "";
        this.terminal.sendText(
            `dotnet new ${this.message.template}${useControllers} --language c# -n ${this.message.project} -o '${this.message.filepath}\\${this.message.solution}\\${this.message.project}' --framework ${this.message.framework}${noHttpsFlag}${noTopLevelStatements} --force`
        );
        this.addProjectToSolution();
        this.openInVsCode();
    }
}

export class CommandFactory {
    static getCommand(terminal: vscode.Terminal, message: Message): Command {
        switch (message.template) {
            case "grpc":
                return new GrpcCommand(terminal, message);
            case "console":
                return new FrameworkConsoleCommand(terminal, message);
            case "webapi":
                return new DefaultCommand(terminal, message);
            default:
                return new DefaultCommand(terminal, message);
        }
    }
}

export class FrameworkConsoleCommand extends Command {
    execute() {
        if (!this.isFrameworkCompatible()) {
            const compatibleFrameworks = TEMPLATE_COMPATIBILITY[
                this.message.template
            ]
                .map((f) => `'${f.substring(3)}'`)
                .join(", ");

            vscode.window.showWarningMessage(
                `Please select a compatible framework for ${
                    this.message.template
                } - [${compatibleFrameworks || "None"}]`
            );
            return;
        }

        this.executeCommonCommands();
        const noHttpsFlag = this.message.noHttps ? " --no-https" : "";
        this.terminal.sendText(
            `dotnet new console --language c# -n ${this.message.project} -o '${this.message.filepath}\\${this.message.solution}\\${this.message.project}' --framework ${this.message.framework}${noHttpsFlag} --force`
        );
        this.addProjectToSolution();
        this.openInVsCode();
    }
}
