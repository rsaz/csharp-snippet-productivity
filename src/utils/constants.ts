/**
 * Centralized constants for the C# Toolbox extension.
 *
 * All magic strings, command IDs, configuration keys, and well-known values
 * should live here so the rest of the codebase reads as intent, not literals.
 */

/** Extension identifier prefix used for commands and configuration. */
export const EXTENSION_ID = "csharp-snippet-productivity";

/** Display name used in command palette categories and notifications. */
export const EXTENSION_DISPLAY_NAME = "C# Toolbox";

/** All command identifiers contributed by the extension. */
export const COMMANDS = {
    CREATE_PROJECT: `${EXTENSION_ID}.createProject`,
    ADD_PROJECT_TO_SOLUTION: `${EXTENSION_ID}.addProjectToSolution`,
    CREATE_CLASS: `${EXTENSION_ID}.createClass`,
    CREATE_INTERFACE: `${EXTENSION_ID}.createInterface`,
    CREATE_STRUCT: `${EXTENSION_ID}.createStruct`,
    CREATE_RECORD: `${EXTENSION_ID}.createRecord`,
    SCAFFOLD_CLEAN_ARCHITECTURE: `${EXTENSION_ID}.scaffoldCleanArchitecture`,
    SCAFFOLD_DDD: `${EXTENSION_ID}.scaffoldDdd`,
    QUICK_ADD_NUGET: `${EXTENSION_ID}.quickAddNuget`,
    ANALYZE_SOLUTION: `${EXTENSION_ID}.analyzeSolution`,
    OPEN_WALKTHROUGH: `${EXTENSION_ID}.openWalkthrough`,
} as const;

/** Walkthrough identifier (matches `contributes.walkthroughs[].id`). */
export const WALKTHROUGH_ID = "csharp-toolbox-getting-started";

/** Configuration keys (under `csharp-snippet-productivity.*`). */
export const CONFIG_KEYS = {
    DEFAULT_FOLDER: "defaultFolderForProjectCreation",
    MULTILINE_COMMENTS: "multilineComments",
    HIGHLIGHT_PLAIN_TEXT: "highlightPlainText",
    TAGS: "tags",
    TELEMETRY_ENABLED: "telemetry.enabled",
    NUGET_POPULAR_PACKAGES: "nuget.popularPackages",
} as const;

/** Globally persisted state keys. */
export const STATE_KEYS = {
    FRAMEWORK: "framework",
} as const;

/** Webview message commands (sent between extension and wizard webview). */
export const WEBVIEW_COMMANDS = {
    GET_TEMPLATES: "getTemplates",
    TEMPLATES: "templates",
    GET_SDK_VERSIONS: "getSDKVersions",
    SDK_VERSIONS: "sdkVersions",
    CREATE_PROJECT: "createProject",
    SELECT_DIRECTORY: "selectDirectory",
    UPDATE_LOCATION: "updateLocation",
    CREATION_STARTED: "creationStarted",
    CREATION_COMPLETED: "creationCompleted",
    CREATION_FAILED: "creationFailed",
    CLOSE_PANEL: "closePanel",
    SHOW_TOAST: "showToast",
    ERROR: "error",
} as const;

/** Recommended (latest LTS / current) .NET frameworks. */
export const RECOMMENDED_FRAMEWORKS = ["net9.0", "net8.0"] as const;

/** Long-term support .NET frameworks. */
export const LTS_FRAMEWORKS = ["net8.0", "net6.0"] as const;

/** Default timeouts (in milliseconds) for various operations. */
export const TIMEOUTS = {
    SDK_DETECTION_MS: 5000,
    PROJECT_CREATION_MS: 60000,
    PANEL_DISPOSE_DELAY_MS: 1500,
} as const;

/** Regex used to validate .NET project / namespace names. */
export const PROJECT_NAME_REGEX = /^[A-Za-z_][A-Za-z0-9_.]*$/;
