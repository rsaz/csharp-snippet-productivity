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
    maui: ["net7.0", "net8.0", "net9.0"],
    "maui-blazor": ["net7.0", "net8.0", "net9.0"],
    mauilib: ["net7.0", "net8.0", "net9.0"],
    "maui-page-csharp": ["net7.0", "net8.0", "net9.0"],
    "maui-page-xaml": ["net7.0", "net8.0", "net9.0"],
    "maui-view-csharp": ["net7.0", "net8.0", "net9.0"],
    "maui-view-xaml": ["net7.0", "net8.0", "net9.0"],
    "maui-dict-xaml": ["net7.0", "net8.0", "net9.0"],
    android: ["net6.0", "net7.0", "net8.0", "net9.0"],
    androidlib: ["net6.0", "net7.0", "net8.0", "net9.0"],
    webapi: [
        "netcoreapp3.1",
        "net5.0",
        "net6.0",
        "net7.0",
        "net8.0",
        "net9.0",
    ],
    webapiaot: ["net8.0", "net9.0"],
    apicontroller: ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
    blazorserver: ["netcoreapp3.1", "net5.0", "net6.0", "net7.0"],
    "blazorserver-empty": ["net7.0"],
    blazor: ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
    "blazorwasm-empty": ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
    blazorwasm: ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
    classlib: [
        "netstandard2.0",
        "netstandard2.1",
        "net5.0",
        "net6.0",
        "net7.0",
        "net8.0",
        "net9.0",
    ],
    console: ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
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
    grpc: ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
    mvc: ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
    webapp: ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
    web: ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
    angular: ["net5.0", "net6.0", "net7.0", "net8.0"],
    ios: ["net6.0", "net7.0", "net8.0", "net9.0"],
    ioslib: ["net6.0", "net7.0", "net8.0", "net9.0"],
    mstest: ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
    "mstest-playwright": ["net6.0", "net7.0", "net8.0", "net9.0"],
    nunit: ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
    "nunit-playwright": ["net6.0", "net7.0", "net8.0", "net9.0"],
    xunit: ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
    winforms: ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
    wpf: ["net5.0", "net6.0", "net7.0", "net8.0", "net9.0"],
    worker: ["net6.0", "net7.0", "net8.0", "net9.0"],
    razorclasslib: ["net6.0", "net7.0", "net8.0", "net9.0"],
    aspire: ["net8.0", "net9.0"],
    "aspire-starter": ["net8.0", "net9.0"],
};

export class Command {
    protected terminal: vscode.Terminal;
    protected message: Message;

    constructor(terminal: vscode.Terminal, message: Message) {
        this.terminal = terminal;
        this.message = message;
    }

    executeCommonCommands() {
        console.log(
            `[CSP] Creating solution directory: '${this.message.filepath}\\${this.message.solution}'`
        );
        this.terminal.sendText(
            `mkdir '${this.message.filepath}\\${this.message.solution}'`
        );
        console.log(
            `[CSP] Creating solution: ${this.message.solution} at '${this.message.filepath}\\${this.message.solution}'`
        );
        this.terminal.sendText(
            `dotnet new sln -n ${this.message.solution} -o '${this.message.filepath}\\${this.message.solution}' --force`
        );
        console.log(
            `[CSP] Creating project directory: '${this.message.filepath}\\${this.message.solution}\\${this.message.project}'`
        );
        this.terminal.sendText(
            `mkdir '${this.message.filepath}\\${this.message.solution}\\${this.message.project}'`
        );
    }

    addProjectToSolution() {
        console.log(
            `[CSP] Adding project to solution: '${this.message.filepath}\\${this.message.solution}\\${this.message.solution}.sln' -> '${this.message.filepath}\\${this.message.solution}\\${this.message.project}\\${this.message.project}.csproj'`
        );
        this.terminal.sendText(
            `dotnet sln '${this.message.filepath}\\${this.message.solution}\\${this.message.solution}.sln' add '${this.message.filepath}\\${this.message.solution}\\${this.message.project}\\${this.message.project}.csproj'`
        );
    }

    openInVsCode() {
        console.log(
            `[CSP] Opening solution in VSCode: '${this.message.filepath}\\${this.message.solution}'`
        );
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

    /**
     * Builds the dotnet new command string for the given template and options.
     * Derived classes can override or extend this for custom templates.
     */
    protected buildDotnetNewCommand(): string {
        // Default implementation for most templates
        const {
            template,
            project,
            filepath,
            solution,
            framework,
            noHttps,
            noTopLevelStatements,
            useControllers,
        } = this.message;
        const projectPath = `'${filepath}\\${solution}\\${project}'`;
        const noHttpsFlag = noHttps ? " --no-https" : "";
        const useControllersFlag = useControllers
            ? " --use-controllers"
            : " -minimal";
        const noTopLevelStatementsFlag = noTopLevelStatements
            ? " --use-program-main"
            : "";
        return `dotnet new ${template}${useControllersFlag} --language c# -n ${project} -o ${projectPath} --framework ${framework}${noHttpsFlag}${noTopLevelStatementsFlag} --force`;
    }

    /**
     * Validates the message object for required properties and value constraints.
     * Returns true if valid, otherwise shows a warning and returns false.
     */
    protected validateMessage(): boolean {
        const requiredFields = [
            { key: "template", value: this.message.template },
            { key: "project", value: this.message.project },
            { key: "solution", value: this.message.solution },
            { key: "framework", value: this.message.framework },
            { key: "filepath", value: this.message.filepath },
        ];
        for (const field of requiredFields) {
            if (
                !field.value ||
                typeof field.value !== "string" ||
                field.value.trim() === ""
            ) {
                vscode.window.showWarningMessage(
                    `Invalid or missing value for '${field.key}'. Please provide a valid ${field.key}.`
                );
                return false;
            }
        }
        // Optionally, add more specific validation (e.g., allowed templates/frameworks)
        return true;
    }
}

export class GrpcCommand extends Command {
    protected buildDotnetNewCommand(): string {
        const { project, filepath, solution } = this.message;
        const projectPath = `'${filepath}\\${solution}\\${project}'`;
        return `dotnet new grpc -n ${project} -o ${projectPath} --force`;
    }

    execute(): void {
        if (!this.validateMessage()) {
            return;
        }
        console.log(
            `[CSP] Executing GrpcCommand for project: ${this.message.project}`
        );
        this.executeCommonCommands();
        const cmd = this.buildDotnetNewCommand();
        console.log(`[CSP] Running command: ${cmd}`);
        this.terminal.sendText(cmd);
        this.addProjectToSolution();
        this.openInVsCode();
    }
}

export class DefaultCommand extends Command {
    execute() {
        if (!this.validateMessage()) {
            return;
        }
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
        console.log(
            `[CSP] Executing DefaultCommand for project: ${this.message.project}`
        );
        this.executeCommonCommands();
        const cmd = this.buildDotnetNewCommand();
        console.log(`[CSP] Running command: ${cmd}`);
        this.terminal.sendText(cmd);
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
    protected buildDotnetNewCommand(): string {
        const { project, filepath, solution, framework, noHttps } =
            this.message;
        const projectPath = `'${filepath}\\${solution}\\${project}'`;
        const noHttpsFlag = noHttps ? " --no-https" : "";
        return `dotnet new console --language c# -n ${project} -o ${projectPath} --framework ${framework}${noHttpsFlag} --force`;
    }

    execute() {
        if (!this.validateMessage()) {
            return;
        }
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
        console.log(
            `[CSP] Executing FrameworkConsoleCommand for project: ${this.message.project}`
        );
        this.executeCommonCommands();
        const cmd = this.buildDotnetNewCommand();
        console.log(`[CSP] Running command: ${cmd}`);
        this.terminal.sendText(cmd);
        this.addProjectToSolution();
        this.openInVsCode();
    }
}
