# Testing Guide

This page describes how the test infrastructure for the **C# Toolbox** extension is wired and how to add a test.

## Why a custom Mocha runner?

Most VS Code extensions test through `@vscode/test-electron`, which downloads VS Code and runs tests inside an Extension Host. That works, but it is:

- Slow (~30–60 s startup).
- Painful in CI, because each platform needs the right VS Code build.
- Overkill for testing pure logic (snippet validation, template metadata, command builders, …).

We instead run a **plain Mocha process** that intercepts `require("vscode")` and returns a small mock from `src/test/mocks/vscode.mock.ts`. This means tests start in well under a second and run identically on every platform.

> If you write a test that exercises real VS Code APIs (UI interactions, language server, etc.), you can still add an integration test pack in a sibling folder using `@vscode/test-electron`. The unit-test runner described here is for pure logic.

## Running the tests

```bash
npm run compile:test   # compiles src/ to ./out-test using tsconfig.test.json
npm test               # runs ./out-test/test/runTest.js
```

The runner uses `glob` to discover every `*.test.js` under `out-test/test/suite`, registers them with Mocha (BDD interface), and exits with a non-zero code on failure. CI uses the same commands.

## Layout

```
src/test/
├── mocks/
│   └── vscode.mock.ts          ← stand-in for the `vscode` module
├── suite/
│   ├── projectTemplates.test.ts
│   ├── snippets.test.ts
│   └── templateCompatibility.test.ts
└── runTest.ts                  ← Mocha bootstrap; injects the vscode mock
```

The runner monkey-patches Node's module resolver **before** any test files are loaded:

```ts
(Module as any)._load = function (request: string, parent: any, ...rest: any[]) {
    if (request === "vscode") return vscodeMock;
    return originalLoad.call(this, request, parent, ...rest);
};
```

So when test code imports `../../utils/terminal-cmd.provider`, and that file does `import * as vscode from "vscode"`, the import resolves to the mock automatically. No changes to production code required.

## Writing a unit test

Create a file under `src/test/suite/` named `<thing>.test.ts`:

```ts
import { strict as assert } from "assert";
import { someFunction } from "../../utils/some-module";

describe("someFunction", () => {
    it("returns the expected value", () => {
        assert.equal(someFunction("input"), "expected");
    });
});
```

Key conventions:

- Use Node's built-in `assert` (`strict` flavour). No need for chai / expect.
- Group with `describe` blocks; one block per public function or behaviour.
- Prefer small, deterministic tests. Avoid touching the file system or network.
- For behaviour that depends on VS Code APIs, you can sub-stub the mock in a `beforeEach`:
    ```ts
    import { vscodeMock } from "../mocks/vscode.mock";
    let originalShow: typeof vscodeMock.window.showInformationMessage;
    beforeEach(() => {
        originalShow = vscodeMock.window.showInformationMessage;
        vscodeMock.window.showInformationMessage = () => Promise.resolve("OK" as any);
    });
    afterEach(() => {
        vscodeMock.window.showInformationMessage = originalShow;
    });
    ```
- The mock currently covers `window`, `workspace`, `commands`, `Uri`, `ViewColumn`, `EventEmitter`, `extensions`, and the `Position`/`Selection`/`Range` constructors. Extend it as needed (please keep additions minimal and obviously-correct).

## Snippet-shape tests

`snippets.test.ts` validates every snippet JSON file:

- Parses as JSON.
- Has at least one snippet.
- Every snippet entry has both `prefix` and `body`.
- No prefix collisions within a file.

Whenever you add or rename a snippet, this suite is your safety net.

## Template-compatibility tests

`templateCompatibility.test.ts` validates the `TEMPLATE_COMPATIBILITY` map in `src/utils/terminal-cmd.provider.ts`:

- Modern templates include `net9.0`.
- Legacy `console-framework` does not.
- Every framework moniker matches a recognised pattern (`netX.Y`, `netcoreappX.Y`, `netstandardX.Y`).

Whenever a new .NET version drops, update the map and add the new moniker to the assertion list.

## CI

`.github/workflows/ci.yml` runs lint + compile + tests on:

- `ubuntu-latest`
- `windows-latest`
- `macos-latest`

…using Node 20.x. PRs must be green before merge.
