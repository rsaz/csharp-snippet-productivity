/* eslint-disable curly */
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    const vscode = acquireVsCodeApi();

    // State management
    let currentStep = 1;
    let selectedTemplate = null;
    let selectedFramework = null;

    // DOM Elements
    const wizardSteps = document.querySelectorAll(".step");
    const wizardPages = document.querySelectorAll(".wizard-page");
    const prevButton = document.getElementById("prev-button");
    const nextButton = document.getElementById("next-button");
    const createButton = document.getElementById("create-project-button");
    const projectGroupSelect = document.getElementById("project-group-select");
    const templateSearch = document.getElementById("template-search");
    const templateGrid = document.getElementById("template-grid");
    const projectNameInput = document.getElementById("projectName");
    const solutionInput = document.getElementById("solution");
    const locationInput = document.getElementById("inputLocal");
    const selectFolderButton = document.getElementById("selectFolder");
    const frameworkGrid = document.getElementById("framework-grid");
    const frameworkSelect = document.getElementById("custom-select2");
    const httpsCheckbox = document.getElementById("https-checkbox");
    const dockerCheckbox = document.getElementById("docker-checkbox");

    // Hide solution input and location input for Add Project
    if (solutionInput) {
        solutionInput.parentElement.style.display = "none";
    }
    if (locationInput) {
        locationInput.parentElement.style.display = "none";
    }
    if (selectFolderButton) {
        selectFolderButton.style.display = "none";
    }

    // Project templates configuration
    const projectGroupToTemplates = {
        api: [
            {
                templateName: ".NET Core Web API",
                shortName: "webapi",
                description:
                    "A project template for creating an ASP.NET Core Web API",
                tags: ["API", "REST", "HTTP"],
            },
            {
                templateName: ".NET Core Web API (native AOT)",
                shortName: "webapiaot",
                description:
                    "A project template for creating an ASP.NET Core Web API with native AOT compilation",
                tags: ["API", "AOT", "Performance"],
            },
            {
                templateName: "API Controller",
                shortName: "apicontroller",
                description: "A template for creating an API Controller",
                tags: ["API", "Controller"],
            },
        ],
        lib: [
            {
                templateName: "Class Library",
                shortName: "classlib",
                description:
                    "A project for creating a class library that targets .NET",
                tags: ["Library", "Class", "Cross-platform"],
            },
            {
                templateName: ".NET MAUI Class Library",
                shortName: "mauilib",
                description: "A project for creating a .NET MAUI class library",
                tags: ["Library", "MAUI", "Mobile"],
            },
            {
                templateName: "Razor Class Library",
                shortName: "razorclasslib",
                description: "A project for creating a Razor class library",
                tags: ["Library", "Razor", "Web"],
            },
            {
                templateName: "Windows Forms Class Library",
                shortName: "winformslib",
                description:
                    "A project for creating a Windows Forms class library",
                tags: ["Library", "Windows Forms", "Desktop"],
            },
            {
                templateName: "WPF Class Library",
                shortName: "wpflib",
                description: "A project for creating a WPF class library",
                tags: ["Library", "WPF", "Desktop"],
            },
        ],
        blazor: [
            {
                templateName: ".NET MAUI Blazor Hybrid App",
                shortName: "maui-blazor",
                description:
                    "A project for creating a .NET MAUI Blazor Hybrid application",
                tags: ["Blazor", "MAUI", "Hybrid"],
            },
            {
                templateName: "Blazor Server App",
                shortName: "blazorserver",
                description:
                    "A project template for creating a Blazor server app",
                tags: ["Blazor", "Server"],
            },
            {
                templateName: "Blazor Web App",
                shortName: "blazor",
                description: "A project template for creating a Blazor web app",
                tags: ["Blazor", "Web"],
            },
        ],
        console: [
            {
                templateName: "Console App",
                shortName: "console",
                description:
                    "A project for creating a command-line application that can run on .NET on Windows, Linux and macOS",
                tags: ["Console", "CLI", "Cross-platform"],
                platforms: ["Windows", "Linux", "macOS"],
            },
            {
                templateName: "Console App (.NET Framework)",
                shortName: "console-framework",
                description:
                    "A project for creating a command-line application that runs on .NET Framework",
                tags: ["Console", "CLI", "Windows"],
                platforms: ["Windows"],
            },
        ],
        web: [
            {
                templateName: "ASP.NET Core Empty",
                shortName: "web",
                description:
                    "An empty project template for creating an ASP.NET Core application",
                tags: ["Web", "Empty"],
            },
            {
                templateName: "ASP.NET Core Web App (MVC)",
                shortName: "mvc",
                description:
                    "A project template for creating an ASP.NET Core application using the Model-View-Controller pattern",
                tags: ["Web", "MVC"],
            },
            {
                templateName: "ASP.NET Core Web App (Razor Pages)",
                shortName: "webapp",
                description:
                    "A project template for creating an ASP.NET Core application using Razor Pages",
                tags: ["Web", "Razor"],
            },
        ],
        // ... other template groups ...
    };

    // Initialize the wizard
    document.addEventListener("DOMContentLoaded", function () {
        updateWizardState();
        populateTemplates();
        populateFrameworks();
        setupEventListeners();
        validateForm();
    });

    function updateWizardState() {
        // Update step indicators
        wizardSteps.forEach((step, index) => {
            if (index + 1 === currentStep) {
                step.classList.add("active");
            } else {
                step.classList.remove("active");
            }
        });

        // Update page visibility
        wizardPages.forEach((page, index) => {
            if (index + 1 === currentStep) {
                page.classList.add("active");
            } else {
                page.classList.remove("active");
            }
        });

        // Update button states
        prevButton.disabled = currentStep === 1;
        if (currentStep === 3) {
            nextButton.classList.add("hidden");
            createButton.classList.remove("hidden");
        } else {
            nextButton.classList.remove("hidden");
            createButton.classList.add("hidden");
        }

        validateForm();
    }

    function validateForm() {
        let isValid = false;

        switch (currentStep) {
            case 1:
                isValid = selectedTemplate !== null;
                break;
            case 2:
                isValid = projectNameInput.value.trim() !== "";
                break;
            case 3:
                isValid = frameworkSelect.value !== "";
                break;
            default:
                isValid = false;
        }

        if (isValid) {
            nextButton.classList.remove("disabled");
            nextButton.disabled = false;
            createButton.classList.remove("disabled");
            createButton.disabled = false;
        } else {
            nextButton.classList.add("disabled");
            nextButton.disabled = true;
            createButton.classList.add("disabled");
            createButton.disabled = true;
        }

        return isValid;
    }

    function populateTemplates() {
        const group = projectGroupSelect.value;
        const searchTerm = templateSearch.value.toLowerCase();
        const templates = projectGroupToTemplates[group] || [];

        const filteredTemplates = templates.filter(
            (template) =>
                template.templateName.toLowerCase().includes(searchTerm) ||
                template.shortName.toLowerCase().includes(searchTerm)
        );

        templateGrid.innerHTML = filteredTemplates
            .map(
                (template) => `
            <div class="template-card ${
                selectedTemplate === template.shortName ? "selected" : ""
            }" 
                 data-template="${template.shortName}">
                <div class="template-content">
                    <div class="template-name">${template.templateName}</div>
                    <div class="template-description">${
                        template.description || ""
                    }</div>
                </div>
            </div>
        `
            )
            .join("");

        // Reattach click handlers after repopulating
        templateGrid.querySelectorAll(".template-card").forEach((card) => {
            card.addEventListener("click", () => {
                selectedTemplate = card.dataset.template;
                templateGrid
                    .querySelectorAll(".template-card")
                    .forEach((c) => c.classList.remove("selected"));
                card.classList.add("selected");
                validateForm();
            });
        });
    }

    function populateFrameworks() {
        const frameworks = Array.from(frameworkSelect.options).map(
            (option) => ({
                value: option.value,
                label: option.text,
            })
        );

        frameworkGrid.innerHTML = frameworks
            .map(
                (framework) => `
            <div class="framework-card ${
                selectedFramework === framework.value ? "selected" : ""
            }"
                 data-framework="${framework.value}">
                <div class="framework-content">
                    <div class="framework-version">${framework.label}</div>
                    <div class="framework-description">Target Framework</div>
                </div>
            </div>
        `
            )
            .join("");

        // Add click handlers to framework cards
        frameworkGrid.querySelectorAll(".framework-card").forEach((card) => {
            card.addEventListener("click", () => {
                const frameworkValue = card.dataset.framework;
                selectedFramework = frameworkValue;
                frameworkSelect.value = frameworkValue;

                // Update visual selection
                frameworkGrid
                    .querySelectorAll(".framework-card")
                    .forEach((c) =>
                        c.classList.toggle(
                            "selected",
                            c.dataset.framework === frameworkValue
                        )
                    );

                validateForm();
            });
        });
    }

    function setupEventListeners() {
        // Navigation
        prevButton.addEventListener("click", () => {
            if (currentStep > 1) {
                currentStep--;
                updateWizardState();
            }
        });

        nextButton.addEventListener("click", () => {
            if (validateForm()) {
                currentStep++;
                updateWizardState();
            }
        });

        // Template selection
        projectGroupSelect.addEventListener("change", () => {
            selectedTemplate = null; // Reset selection when changing groups
            populateTemplates();
            validateForm();
        });

        templateSearch.addEventListener("input", () => {
            populateTemplates();
        });

        // Project name validation
        projectNameInput.addEventListener("input", () => {
            validateForm();
        });

        // Framework selection
        frameworkSelect.addEventListener("change", () => {
            selectedFramework = frameworkSelect.value;
            // Update framework grid selection
            frameworkGrid
                .querySelectorAll(".framework-card")
                .forEach((card) =>
                    card.classList.toggle(
                        "selected",
                        card.dataset.framework === selectedFramework
                    )
                );
            validateForm();
        });

        // Project creation
        createButton.addEventListener("click", () => {
            const projectName = projectNameInput.value.trim();

            if (!projectName || !selectedTemplate || !frameworkSelect.value) {
                vscode.postMessage({
                    command: "error",
                    text: "Please fill in all required fields",
                });
                return;
            }

            vscode.postMessage({
                command: "addProject",
                project: projectName,
                template: selectedTemplate,
                framework: frameworkSelect.value,
                https: httpsCheckbox.checked,
                docker: dockerCheckbox.checked,
            });
        });
    }
})();
