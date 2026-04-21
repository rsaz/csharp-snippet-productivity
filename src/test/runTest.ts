/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Standalone Mocha test runner.
 *
 * This runner registers a `vscode` module mock by patching
 * `Module.prototype.require`. Production code that does
 * `import * as vscode from "vscode"` then resolves against our mock when run
 * under tests, without any modifications to production source.
 *
 * Usage: `npm test` (after `npm run compile:test`).
 */
import * as path from "path";
import { vscodeMock } from "./mocks/vscode.mock";

const Module = require("module");
const originalRequire = Module.prototype.require;

Module.prototype.require = function patchedRequire(this: NodeModule, id: string) {
    if (id === "vscode") {
        return vscodeMock;
    }
    return originalRequire.apply(this, [id]);
};

const Mocha = require("mocha");
const glob = require("glob");

async function run(): Promise<void> {
    const mocha = new Mocha({
        ui: "bdd",
        color: true,
        timeout: 10000,
    });

    const testsRoot = path.resolve(__dirname, "suite");
    const files: string[] = await glob.glob("**/*.test.js", { cwd: testsRoot });

    files.forEach((file: string) =>
        mocha.addFile(path.resolve(testsRoot, file))
    );

    await new Promise<void>((resolve, reject) => {
        mocha.run((failures: number) => {
            if (failures > 0) {
                reject(new Error(`${failures} test(s) failed.`));
            } else {
                resolve();
            }
        });
    });
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
