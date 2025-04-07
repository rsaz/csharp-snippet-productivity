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

    // Initialize the UI
    function init() {
        updateTemplateGrid();
        createFrameworkOptions();
        setupEventListeners();
    }

    // Event Listeners
    function setupEventListeners() {
        prevButton.addEventListener("click", () => navigateStep(-1));
        nextButton.addEventListener("click", () => navigateStep(1));
        createButton.addEventListener("click", createProject);

        projectGroupSelect.addEventListener("change", () => {
            updateTemplateGrid();
        });

        templateSearch.addEventListener("input", (e) => {
            filterTemplates(e.target.value);
        });

        projectNameInput.addEventListener("input", (e) => {
            solutionInput.value = e.target.value;
            validateForm();
        });

        solutionInput.addEventListener("input", validateForm);

        selectFolderButton.addEventListener("click", () => {
            vscode.postMessage({
                command: "selectDirectory",
                projectGroupSelect: projectGroupSelect.value,
                template: selectedTemplate?.shortName || "",
            });
        });
    }

    // Template Grid
    function updateTemplateGrid() {
        const group = projectGroupSelect.value;
        const templates =
            group === "all"
                ? Object.values(projectGroupToTemplates).flat()
                : projectGroupToTemplates[group] || [];

        templateGrid.innerHTML = templates
            .map((template) => createTemplateCard(template))
            .join("");

        // Add click handlers to template cards
        document.querySelectorAll(".template-card").forEach((card) => {
            card.addEventListener("click", () => {
                const templateShortName = card.dataset.template;
                selectTemplate(templateShortName);

                // Update visual selection
                document.querySelectorAll(".template-card").forEach((c) => {
                    c.classList.toggle(
                        "selected",
                        c.dataset.template === templateShortName
                    );
                });
            });
        });
    }

    function createTemplateCard(template) {
        // Determine which icon to use
        let iconKey = template.shortName;
        if (template.shortName.includes("webapi")) {
            iconKey = "webapi";
        } else if (template.shortName.includes("blazor")) {
            iconKey = "blazor";
        } else if (template.shortName.includes("web")) {
            iconKey = "web";
        } else if (template.shortName.includes("lib")) {
            iconKey = "classlib";
        } else if (template.tags.includes("Test")) {
            iconKey = "test";
        }

        const icon = templateIcons[iconKey] || templateIcons.default;

        return `
            <div class="template-card ${
                selectedTemplate?.shortName === template.shortName
                    ? "selected"
                    : ""
            }" 
                 data-template="${template.shortName}">
                <div class="template-icon">
                    ${icon}
                </div>
                <div class="template-content">
                    <div class="template-name">${template.templateName}</div>
                    <div class="template-description">${
                        template.description
                    }</div>
                    <div class="template-tags">
                        ${template.tags
                            .map(
                                (tag) =>
                                    `<span class="template-tag">${tag}</span>`
                            )
                            .join("")}
                    </div>
                </div>
            </div>
        `;
    }

    function selectTemplate(templateShortName) {
        const group = projectGroupSelect.value;
        const templates =
            group === "all"
                ? Object.values(projectGroupToTemplates).flat()
                : projectGroupToTemplates[group] || [];

        selectedTemplate = templates.find(
            (t) => t.shortName === templateShortName
        );

        // Enable next button if a template is selected
        if (currentStep === 1) {
            nextButton.disabled = !selectedTemplate;
        }

        validateForm();
    }

    // Framework Selection
    function createFrameworkOptions() {
        const frameworks = Array.from(frameworkSelect.options).map(
            (option) => ({
                value: option.value,
                label: option.text,
            })
        );

        console.log("Available frameworks:", frameworks);

        const frameworkCards = frameworks
            .map(
                (framework) => `
            <div class="framework-card ${
                selectedFramework === framework.value ? "selected" : ""
            }"
                 data-framework="${framework.value}">
                <div class="framework-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M11.7 20H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v7.3c-.6-.3-1.3-.5-2-.5-2.8 0-5 2.2-5 5 0 .8.2 1.5.5 2.2-.3 0-.5-.1-.8-.1zM7 13c0 .6.4 1 1 1h5.5c.2-.7.5-1.4 1-2H8c-.6 0-1 .4-1 1zm1-3h10c.6 0 1-.4 1-1s-.4-1-1-1H8c-.6 0-1 .4-1 1s.4 1 1 1zm13.3 10.7c-.2.2-.5.3-.7.3-.3 0-.5-.1-.7-.3l-2-2c-.6.4-1.3.6-2 .6-2 0-3.5-1.5-3.5-3.5S15.8 12 17.8 12s3.5 1.5 3.5 3.5c0 .7-.2 1.4-.6 2l2 2c.4.4.4 1 0 1.4zM17.8 14c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5z"/>
                    </svg>
                </div>
                <div class="framework-content">
                    <div class="framework-version">${framework.label}</div>
                    <div class="framework-description">Target Framework</div>
                </div>
            </div>
        `
            )
            .join("");

        frameworkGrid.innerHTML = frameworkCards;

        // Add click handlers to framework cards
        document.querySelectorAll(".framework-card").forEach((card) => {
            card.addEventListener("click", () => {
                selectedFramework = card.dataset.framework;
                console.log("Framework selected:", selectedFramework);

                // Update visual selection
                document.querySelectorAll(".framework-card").forEach((c) => {
                    c.classList.toggle(
                        "selected",
                        c.dataset.framework === selectedFramework
                    );
                });
                // Update the hidden select element
                frameworkSelect.value = selectedFramework;
                validateForm();
            });
        });

        // If we have frameworks but none selected, select the first one
        if (frameworks.length > 0 && !selectedFramework) {
            const firstCard = document.querySelector(".framework-card");
            if (firstCard) {
                firstCard.click();
            }
        }
    }

    // Navigation
    function navigateStep(direction) {
        const newStep = currentStep + direction;

        if (newStep < 1 || newStep > 3) return;

        if (direction > 0 && !validateCurrentStep()) return;

        currentStep = newStep;
        updateUI();
    }

    function updateUI() {
        // Update steps
        wizardSteps.forEach((step) => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle("active", stepNum === currentStep);
        });

        // Update pages
        wizardPages.forEach((page, index) => {
            page.classList.toggle("active", index + 1 === currentStep);
        });

        // Update buttons
        prevButton.disabled = currentStep === 1;
        nextButton.style.display = currentStep === 3 ? "none" : "block";
        createButton.style.display = currentStep === 3 ? "block" : "none";

        // Validate form for current step
        validateForm();
    }

    // Validation
    function validateCurrentStep() {
        switch (currentStep) {
            case 1:
                if (!selectedTemplate) {
                    vscode.postMessage({
                        command: "error",
                        text: "Please select a template",
                    });
                    return false;
                }
                return true;
            case 2:
                if (
                    !projectNameInput.value ||
                    !solutionInput.value ||
                    !locationInput.value
                ) {
                    vscode.postMessage({
                        command: "error",
                        text: "Please fill in all required fields",
                    });
                    return false;
                }
                return true;
            case 3:
                if (!selectedFramework) {
                    vscode.postMessage({
                        command: "error",
                        text: "Please select a framework version",
                    });
                    return false;
                }
                return true;
        }
        return true;
    }

    function validateForm() {
        const isValid = (() => {
            switch (currentStep) {
                case 1:
                    return !!selectedTemplate;
                case 2:
                    return !!(
                        projectNameInput.value &&
                        solutionInput.value &&
                        locationInput.value
                    );
                case 3:
                    const frameworkValid = !!selectedFramework;
                    console.log("Framework validation:", {
                        selectedFramework,
                        frameworkSelectValue: frameworkSelect.value,
                        isValid: frameworkValid,
                    });
                    return frameworkValid;
                default:
                    return false;
            }
        })();

        console.log("Form validation:", {
            currentStep,
            isValid,
            selectedTemplate: !!selectedTemplate,
            projectName: !!projectNameInput.value,
            solution: !!solutionInput.value,
            location: !!locationInput.value,
            framework: !!selectedFramework,
        });

        nextButton.disabled = !isValid;
        createButton.disabled = !isValid;
        return isValid;
    }

    // Project Creation
    function createProject() {
        if (!validateForm()) {
            console.log("Form validation failed", {
                currentStep,
                selectedTemplate: selectedTemplate?.shortName,
                projectName: projectNameInput.value,
                solution: solutionInput.value,
                location: locationInput.value,
                framework: selectedFramework || frameworkSelect.value,
            });
            return;
        }

        // Get the selected framework value and ensure it has the 'net' prefix
        let frameworkValue = selectedFramework || frameworkSelect.value;
        if (!frameworkValue.startsWith("net")) {
            frameworkValue = "net" + frameworkValue;
        }

        if (!selectedTemplate || !frameworkValue) {
            console.log("Missing required values:", {
                template: selectedTemplate?.shortName,
                framework: frameworkValue,
            });
            return;
        }

        const message = {
            command: "createProject",
            template: selectedTemplate.shortName,
            project: projectNameInput.value,
            solution: solutionInput.value,
            framework: frameworkValue,
            filepath: locationInput.value,
            https: httpsCheckbox.checked,
            docker: dockerCheckbox.checked,
        };

        console.log("Sending create project message:", message);
        vscode.postMessage(message);
    }

    // Filter templates
    function filterTemplates(searchTerm) {
        const templates = document.querySelectorAll(".template-card");
        const term = searchTerm.toLowerCase();

        templates.forEach((template) => {
            const name = template
                .querySelector(".template-name")
                .textContent.toLowerCase();
            const description = template
                .querySelector(".template-description")
                .textContent.toLowerCase();
            const tags = Array.from(
                template.querySelectorAll(".template-tag")
            ).map((tag) => tag.textContent.toLowerCase());

            const matches =
                name.includes(term) ||
                description.includes(term) ||
                tags.some((tag) => tag.includes(term));

            template.classList.toggle("hidden", !matches);
        });
    }

    // Message handling
    window.addEventListener("message", (event) => {
        const message = event.data;

        switch (message.command) {
            case "updateState":
                if (message.projectGroup) {
                    projectGroupSelect.value = message.projectGroup;
                }
                if (message.selectedTemplate) {
                    selectTemplate(message.selectedTemplate);
                }
                break;
            case "updateLocation":
                if (message.filepath) {
                    locationInput.value = message.filepath;
                    validateForm();
                }
                break;
        }
    });

    // Initialize the UI
    init();
})();
