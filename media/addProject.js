// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    // vscode api
    const vscode = acquireVsCodeApi();

    // Html elements bindings
    const buttonCreateProject = document.getElementById("create-project-button");
    const template = document.getElementById("custom-select");
    const project = document.getElementById("projectName");
    const framework = document.getElementById("custom-select2");
    const projectGroupSelect = document.getElementById("project-group-select");

    document.addEventListener("DOMContentLoaded", function (event) {
        populateTemplateSelect(projectGroupSelect.value);
        buttonCreateProject.disabled = "true";
        buttonCreateProject.style.backgroundColor = "#3C3C3C";
        fieldValidation();
    });

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

    function populateTemplateSelect(group) {
        const templates = projectGroupToTemplates[group] || [];

        template.innerHTML = templates
            .map(
                (template) =>
                    `<option value="${template.shortName}">${template.templateName}</option>`
            )
            .join("");
    }

    /* Project group select */
    projectGroupSelect.addEventListener("change", () => {
        populateTemplateSelect(projectGroupSelect.value);
    });

    function fieldValidation() {
        if (project.value === "") {
            buttonCreateProject.disabled = true;
        } else {
            buttonCreateProject.disabled = false;
            buttonCreateProject.style.backgroundColor = "#0E639C";
        }
    }

    template.addEventListener("keydown" | "click", () => {
        project.focus();
    });

    project.addEventListener("change", () => {
        fieldValidation();
        solution.value = project.value;
    });

    // create console project
    buttonCreateProject.addEventListener("click", () => {
        let frameworkSelected = framework.options[framework.selectedIndex].value;

        // verify if project has white spaces
        let projectTrimmed = project.value.replace(/\s/g, "");

        vscode.postMessage({
            command: "addProject",
            template: template.options[template.selectedIndex].value,
            project: projectTrimmed,
            framework: frameworkSelected,
        });
    });
})();
