/* eslint-disable curly */
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    // vscode api
    const vscode = acquireVsCodeApi();

    // Html elements bindings
    const buttonCreateProject = document.getElementById("create-project-button");
    const buttonFilePicker = document.getElementById("selectFolder");
    const projectGroupSelect = document.getElementById("project-group-select");
    const template = document.getElementById("custom-select");
    const project = document.getElementById("projectName");
    const filePath = document.getElementById("inputLocal");
    const solution = document.getElementById("solution");
    const framework = document.getElementById("custom-select2");

    document.addEventListener("DOMContentLoaded", function (event) {
        buttonCreateProject.disabled = "true";
        buttonCreateProject.style.backgroundColor = "#3C3C3C";
        fieldValidation();
    });

    function fieldValidation() {
        if (project.value === "" || solution.value === "") {
            buttonCreateProject.disabled = true;
        } else {
            buttonCreateProject.disabled = false;
            buttonCreateProject.style.backgroundColor = "#0E639C";
        }
    }

    /* Project group select */
    const projectGroupToTemplates = {
        api: [
            { templateName: ".NET Core Web API", shortName: "webapi" },
            { templateName: ".NET Core Web API (native AOT)", shortName: "webapiaot" },
            { templateName: "API Controller", shortName: "apicontroller" },
        ],
        blazor: [
            { templateName: ".NET MAUI Blazor Hybrid App", shortName: "maui-blazor" },
            { templateName: "Blazor Server App", shortName: "blazorserver" },
            { templateName: "Blazor Server App Empty", shortName: "blazorserver-empty" },
            { templateName: "Blazor Web App", shortName: "blazor" },
            { templateName: "Blazor WebAssembly App Empty", shortName: "blazorwasm-empty" },
            { templateName: "Blazor WebAssembly Standalone App", shortName: "blazorwasm" },
        ],
        cloud: [], // No specific templates for cloud in the given list
        console: [{ templateName: "Console App", shortName: "console" }],
        desktop: [
            { templateName: "Windows Forms App", shortName: "winforms" },
            { templateName: "Windows Forms Class Library", shortName: "winformslib" },
            { templateName: "Windows Forms Control Library", shortName: "winformscontrollib" },
            { templateName: "WPF Application", shortName: "wpf" },
            { templateName: "WPF Class Library", shortName: "wpflib" },
            { templateName: "WPF Custom Control Library", shortName: "wpfcustomcontrollib" },
            { templateName: "WPF User Control Library", shortName: "wpfusercontrollib" },
        ],
        extensions: [], // No specific templates for extensions in the given list
        game: [], // No specific templates for game in the given list
        iot: [], // No specific templates for IoT in the given list
        lib: [
            { templateName: "Class Library", shortName: "classlib" },
            { templateName: ".NET MAUI Class Library", shortName: "mauilib" },
            { templateName: "Android Class Library", shortName: "androidlib" },
            { templateName: "iOS Class Library", shortName: "ioslib" },
            { templateName: "Mac Catalyst Class Library", shortName: "maccatalystlib" },
            { templateName: "Razor Class Library", shortName: "razorclasslib" },
        ],
        machinelearning: [], // No specific templates for machine learning in the given list
        maui: [
            { templateName: ".NET MAUI App", shortName: "maui" },
            { templateName: ".NET MAUI ContentPage (C#)", shortName: "maui-page-csharp" },
            { templateName: ".NET MAUI ContentPage (XAML)", shortName: "maui-page-xaml" },
            { templateName: ".NET MAUI ContentView (C#)", shortName: "maui-view-csharp" },
            { templateName: ".NET MAUI ContentView (XAML)", shortName: "maui-view-xaml" },
            { templateName: ".NET MAUI ResourceDictionary (XAML)", shortName: "maui-dict-xaml" },
        ],
        mobile: [
            { templateName: "Android Application", shortName: "android" },
            { templateName: "Android Wear Application", shortName: "androidwear" },
            { templateName: "iOS Application", shortName: "ios" },
            { templateName: "iOS Tabbed Application", shortName: "ios-tabbed" },
        ],
        test: [
            { templateName: "MSTest Test Project", shortName: "mstest" },
            { templateName: "MSTest Playwright Test Project", shortName: "mstest-playwright" },
            { templateName: "NUnit 3 Test Project", shortName: "nunit" },
            { templateName: "NUnit 3 Test Item", shortName: "nunit-test" },
            { templateName: "NUnit Playwright Test Project", shortName: "nunit-playwright" },
            { templateName: "xUnit Test Project", shortName: "xunit" },
        ],
        web: [
            { templateName: "ASP.NET Core Empty", shortName: "web" },
            { templateName: "ASP.NET Core gRPC Service", shortName: "grpc" },
            { templateName: "ASP.NET Core Web App (Model-View-Controller)", shortName: "mvc" },
            { templateName: "ASP.NET Core Web App (Razor Pages)", shortName: "webapp" },
            { templateName: "ASP.NET Core with Angular", shortName: "angular" },
            { templateName: "ASP.NET Core with React.js", shortName: "react" },
            { templateName: "ASP.NET Core with React.js and Redux", shortName: "reactredux" },
            { templateName: "Razor Component", shortName: "razorcomponent" },
            { templateName: "Razor Page", shortName: "page" },
            { templateName: "Razor View", shortName: "view" },
        ],
    };

    // Update template select based on selected project group
    function updateTemplateSelect(group) {
        template.innerHTML = ""; // Clear existing options

        // Add default 'Select Template' option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select Template";
        template.appendChild(defaultOption);

        // Check if a project group is selected before populating templates
        if (group && projectGroupToTemplates[group]) {
            const templates = projectGroupToTemplates[group];
            templates.forEach((tmpl) => {
                const option = document.createElement("option");
                option.value = tmpl.shortName;
                option.textContent = tmpl.templateName;
                template.appendChild(option);
            });
        }
    }

    // Event listener for project group selection
    projectGroupSelect.addEventListener("change", function () {
        updateTemplateSelect(this.value);
    });

    // Initialize the template select with the default or initial project group
    document.addEventListener("DOMContentLoaded", function () {
        updateTemplateSelect(""); // Initialize with default option
        fieldValidation();
    });
    /* Project group select End of Implementation */

    template.addEventListener("keydown" | "click", () => {
        project.focus();
    });

    project.addEventListener("change", () => {
        solution.value = project.value;
        fieldValidation();
    });

    solution.addEventListener("keyup", () => {
        fieldValidation();
    });

    filePath.addEventListener("keyup" | "focus", () => {
        fieldValidation();
    });

    filePath.addEventListener("keydown", () => {
        buttonFilePicker.focus();
    });

    // create console project
    buttonCreateProject.addEventListener("click", () => {
        let frameworkSelected = framework.options[framework.selectedIndex].value;
        let frameworkRun = "";

        if (frameworkSelected === "2.0") frameworkRun = "netcoreapp2.0";
        else if (frameworkSelected === "2.1") frameworkRun = "netcoreapp2.1";
        else if (frameworkSelected === "2.2") frameworkRun = "netcoreapp2.2";
        else if (frameworkSelected === "3.0") frameworkRun = "netcoreapp3.0";
        else if (frameworkSelected === "3.1") frameworkRun = "netcoreapp3.1";
        else if (frameworkSelected === "5.0") frameworkRun = "net5.0";
        else if (frameworkSelected === "6.0") frameworkRun = "net6.0";
        else if (frameworkSelected === "7.0") frameworkRun = "net7.0";
        else if (frameworkSelected === "8.0") frameworkRun = "net8.0";

        vscode.postMessage({
            command: "createProject",
            template: template.options[template.selectedIndex].value,
            project: project.value,
            filePath: filePath.value,
            solution: solution.value,
            framework: frameworkRun,
        });
    });

    // file picker to save the project in a specific location
    buttonFilePicker.addEventListener("click", () => {
        solution.focus();
        vscode.postMessage({
            command: "selectDirectory",
            templateName: template.options[template.selectedIndex].text,
            template: template.options[template.selectedIndex].value,
            project: project.value,
            solution: solution.value,
            framework: framework.options[framework.selectedIndex].value,
        });
    });
})();
