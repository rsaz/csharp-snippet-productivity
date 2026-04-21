/**
 * Minimal VS Code API mock for unit testing.
 *
 * This mock implements just enough of the VS Code API surface to let
 * extension code load and execute in a Node.js test environment without
 * the actual VS Code runtime.
 *
 * Tests that need richer behavior should override individual members
 * via sinon stubs at the start of the test.
 */

class EventEmitterMock<T> {
    private _listeners: Array<(e: T) => void> = [];
    public event = (listener: (e: T) => void) => {
        this._listeners.push(listener);
        return { dispose: () => {} };
    };
    public fire(data: T): void {
        for (const listener of this._listeners) {
            listener(data);
        }
    }
    public dispose(): void {
        this._listeners = [];
    }
}

const vscodeMock = {
    window: {
        showInformationMessage: () => Promise.resolve(undefined),
        showWarningMessage: () => Promise.resolve(undefined),
        showErrorMessage: () => Promise.resolve(undefined),
        showInputBox: () => Promise.resolve(undefined),
        showOpenDialog: () => Promise.resolve(undefined),
        showQuickPick: () => Promise.resolve(undefined),
        createTerminal: () => ({
            sendText: (_t: string) => {},
            show: () => {},
            dispose: () => {},
        }),
        createWebviewPanel: () => ({
            webview: {
                html: "",
                cspSource: "https://example",
                postMessage: () => Promise.resolve(true),
                onDidReceiveMessage: () => ({ dispose: () => {} }),
                asWebviewUri: (uri: any) => uri,
            },
            onDidDispose: () => ({ dispose: () => {} }),
            reveal: () => {},
            dispose: () => {},
            iconPath: undefined,
        }),
        activeTextEditor: undefined,
        activeTerminal: undefined,
        onDidChangeActiveTextEditor: () => ({ dispose: () => {} }),
    },
    workspace: {
        getConfiguration: () => ({
            get: () => undefined,
        }),
        onDidChangeTextDocument: () => ({ dispose: () => {} }),
        openTextDocument: () => Promise.resolve({ getText: () => "" }),
        findFiles: () => Promise.resolve([]),
        workspaceFolders: undefined,
    },
    commands: {
        registerCommand: (_id: string, _cb: any) => ({ dispose: () => {} }),
        executeCommand: () => Promise.resolve(undefined),
    },
    Uri: {
        file: (p: string) => ({ fsPath: p, path: p, toString: () => p }),
        joinPath: (...parts: any[]) => ({
            fsPath: parts.map((p) => p.fsPath || p).join("/"),
            toString: () => parts.map((p) => p.fsPath || p).join("/"),
        }),
    },
    ViewColumn: { One: 1, Two: 2, Three: 3 },
    EventEmitter: EventEmitterMock,
    Position: class {
        constructor(public line: number, public character: number) {}
    },
    Selection: class {
        constructor(public anchor: any, public active: any) {}
    },
    Range: class {
        constructor(public start: any, public end: any) {}
    },
    extensions: {
        getExtension: () => ({ extensionPath: process.cwd() }),
    },
    env: {
        openExternal: () => Promise.resolve(true),
    },
};

export default vscodeMock;
export { vscodeMock };
