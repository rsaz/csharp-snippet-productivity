import * as vscode from "vscode";
import { EXTENSION_DISPLAY_NAME } from "./constants";

/**
 * Log severity levels.
 */
export enum LogLevel {
    Trace = 0,
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
    Off = 5,
}

/**
 * Lazy-initialised, singleton logger that writes to a dedicated VS Code
 * Output channel and (in development) to the JS console.
 *
 * Usage:
 * ```ts
 * Logger.info("Project created", { name });
 * Logger.error("Failed to create project", err);
 * ```
 *
 * Replace ad-hoc `console.log` / `console.error` calls with the appropriate
 * Logger method to give users a single place to inspect extension output.
 */
export class Logger {
    private static _channel: vscode.OutputChannel | undefined;
    private static _level: LogLevel = LogLevel.Info;

    private constructor() {}

    /**
     * Returns the underlying output channel, creating it on first use.
     */
    private static getChannel(): vscode.OutputChannel {
        if (!Logger._channel) {
            Logger._channel = vscode.window.createOutputChannel(
                EXTENSION_DISPLAY_NAME
            );
        }
        return Logger._channel;
    }

    /** Sets the minimum log level emitted by the logger. */
    public static setLevel(level: LogLevel): void {
        Logger._level = level;
    }

    /** Reveals the output channel in the VS Code UI. */
    public static show(preserveFocus = true): void {
        Logger.getChannel().show(preserveFocus);
    }

    /** Disposes the underlying output channel. */
    public static dispose(): void {
        Logger._channel?.dispose();
        Logger._channel = undefined;
    }

    public static trace(message: string, ...args: unknown[]): void {
        Logger.write(LogLevel.Trace, "TRACE", message, args);
    }

    public static debug(message: string, ...args: unknown[]): void {
        Logger.write(LogLevel.Debug, "DEBUG", message, args);
    }

    public static info(message: string, ...args: unknown[]): void {
        Logger.write(LogLevel.Info, "INFO ", message, args);
    }

    public static warn(message: string, ...args: unknown[]): void {
        Logger.write(LogLevel.Warn, "WARN ", message, args);
    }

    public static error(message: string, error?: unknown, ...args: unknown[]): void {
        const errPayload =
            error instanceof Error
                ? { name: error.name, message: error.message, stack: error.stack }
                : error;
        Logger.write(LogLevel.Error, "ERROR", message, [errPayload, ...args]);
    }

    private static write(
        level: LogLevel,
        label: string,
        message: string,
        args: unknown[]
    ): void {
        if (level < Logger._level) {
            return;
        }
        const timestamp = new Date().toISOString();
        const formatted = `[${timestamp}] [${label}] ${message}`;

        const channel = Logger.getChannel();
        channel.appendLine(formatted);
        if (args.length > 0) {
            for (const arg of args) {
                if (arg === undefined) {
                    continue;
                }
                try {
                    channel.appendLine(`  ${JSON.stringify(arg, null, 2)}`);
                } catch {
                    channel.appendLine(`  ${String(arg)}`);
                }
            }
        }
    }
}
