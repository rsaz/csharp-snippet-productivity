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

    // Request template data from extension
    vscode.postMessage({
        command: "getTemplates",
    });

    // Handle template data response
    window.addEventListener("message", (event) => {
        const message = event.data;
        console.log("Received message:", message);
        switch (message.command) {
            case "templates":
                populateProjectGroups(message.templates);
                break;
            case "updateLocation":
                locationInput.value = message.filepath;
                validateForm();
                break;
            case "sdkVersions":
                console.log("Received SDK versions:", message.versions);
                populateFrameworks(message.versions);
                break;
        }
    });

    function populateProjectGroups(templateGroups) {
        // Clear existing options
        projectGroupSelect.innerHTML = "";

        // Add default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select Project Type";
        projectGroupSelect.appendChild(defaultOption);

        // Add group options
        templateGroups.forEach((group) => {
            const option = document.createElement("option");
            option.value = group.name;
            option.textContent = group.displayName;
            projectGroupSelect.appendChild(option);
        });

        // Add event listener for group selection
        projectGroupSelect.addEventListener("change", () => {
            const selectedGroup = templateGroups.find(
                (g) => g.name === projectGroupSelect.value
            );
            if (selectedGroup) {
                populateTemplates(selectedGroup.templates);
            }
        });
    }

    function populateTemplates(templates) {
        // Clear existing templates
        templateGrid.innerHTML = "";

        // Add templates to grid
        templates.forEach((template) => {
            const templateCard = createTemplateCard(template);
            templateGrid.appendChild(templateCard);
        });
    }

    function createTemplateCard(template) {
        const card = document.createElement("div");
        card.className = "template-card";
        card.dataset.template = template.shortName;

        // Create card content wrapper
        const content = document.createElement("div");
        content.className = "template-content";

        // Create and style title
        const title = document.createElement("h3");
        title.textContent = template.templateName;
        content.appendChild(title);

        // Add description if available
        if (template.description) {
            const description = document.createElement("p");
            description.textContent = template.description;
            content.appendChild(description);
        }

        // Add tags if available
        if (template.tags && template.tags.length > 0) {
            const tags = document.createElement("div");
            tags.className = "template-tags";
            template.tags.forEach((tag) => {
                const tagElement = document.createElement("span");
                tagElement.className = "tag";
                tagElement.textContent = tag;
                tags.appendChild(tagElement);
            });
            content.appendChild(tags);
        }

        // Add platforms if available
        if (template.platforms && template.platforms.length > 0) {
            const platforms = document.createElement("div");
            platforms.className = "template-platforms";
            const platformText = document.createElement("small");
            platformText.textContent = `Platforms: ${template.platforms.join(
                ", "
            )}`;
            platforms.appendChild(platformText);
            content.appendChild(platforms);
        }

        card.appendChild(content);

        // Add click handler
        card.addEventListener("click", () => {
            document
                .querySelectorAll(".template-card")
                .forEach((c) => c.classList.remove("selected"));
            card.classList.add("selected");
            selectedTemplate = template.shortName;
            validateForm();
        });

        return card;
    }

    function populateFrameworks(sdks) {
        const frameworkGrid = document.getElementById("framework-grid");
        frameworkGrid.innerHTML = "";

        // Parse SDK versions and group by major.minor version
        const versionGroups = new Map();
        sdks.forEach((sdk) => {
            const match = sdk.match(/^(\d+)\.(\d+)\.\d+/);
            if (match) {
                const majorVersion = match[1];
                const minorVersion = match[2];
                const version = `${majorVersion}.${minorVersion}`;
                const fullVersion = sdk.split(" ")[0];
                if (
                    !versionGroups.has(version) ||
                    versionGroups
                        .get(version)
                        .localeCompare(fullVersion, undefined, {
                            numeric: true,
                        }) < 0
                ) {
                    versionGroups.set(version, fullVersion);
                }
            }
        });

        // Convert to array and sort by version descending
        const sortedVersions = Array.from(versionGroups.entries()).sort(
            (a, b) => {
                const [majorA, minorA] = a[0].split(".").map(Number);
                const [majorB, minorB] = b[0].split(".").map(Number);
                if (majorA !== majorB) return majorB - majorA;
                return minorB - minorA;
            }
        );

        // Create framework cards
        sortedVersions.forEach(([version, fullVersion]) => {
            const card = document.createElement("div");
            card.className = "framework-card";
            card.dataset.framework = `net${version}`;
            card.dataset.version = fullVersion;

            const title = document.createElement("h3");
            title.textContent = `.NET ${version}`;
            card.appendChild(title);

            card.addEventListener("click", () => {
                document
                    .querySelectorAll(".framework-card")
                    .forEach((c) => c.classList.remove("selected"));
                card.classList.add("selected");
                selectedFramework = `net${version}`;
                validateForm();
            });

            frameworkGrid.appendChild(card);
        });
    }

    function validateForm() {
        const isValid =
            selectedTemplate &&
            projectNameInput.value.trim() &&
            solutionInput.value.trim() &&
            locationInput.value.trim() &&
            selectedFramework;

        createButton.disabled = !isValid;
        createButton.classList.toggle("disabled", !isValid);
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
            if (currentStep < 3) {
                currentStep++;
                updateWizardState();
            }
        });

        // Project name input handler
        projectNameInput.addEventListener("input", () => {
            const projectName = projectNameInput.value.trim();
            // Auto-fill solution name if it's empty or matches the previous project name
            if (
                !solutionInput.value ||
                solutionInput.value === projectNameInput.dataset.lastValue
            ) {
                solutionInput.value = projectName;
            }
            projectNameInput.dataset.lastValue = projectName;
            validateForm();
        });

        // Solution name input handler
        solutionInput.addEventListener("input", () => {
            validateForm();
        });

        // Location selection
        selectFolderButton.addEventListener("click", () => {
            vscode.postMessage({
                command: "selectDirectory",
            });
        });

        // Project creation
        createButton.addEventListener("click", () => {
            const projectName = projectNameInput.value.trim();
            const solutionName = solutionInput.value.trim();
            const location = locationInput.value.trim();
            const framework = selectedFramework;
            const authType = document.getElementById("auth-type").value;
            const containerOs = document.getElementById("container-os").value;
            const containerBuildType = document.getElementById(
                "container-build-type"
            ).value;
            const noHttps = !document.getElementById("https-checkbox").checked;

            if (!(projectName && solutionName && location && framework)) {
                vscode.postMessage({
                    command: "error",
                    text: "Please fill in all required fields",
                });
                return;
            }

            vscode.postMessage({
                command: "createProject",
                project: projectName,
                solution: solutionName,
                template: selectedTemplate,
                framework: framework,
                authType: authType,
                noHttps: noHttps,
                docker: dockerCheckbox.checked,
                containerOs: containerOs,
                containerBuildType: containerBuildType,
                openApi: document.getElementById("openapi-checkbox").checked,
                noTopLevelStatements: document.getElementById(
                    "top-level-statements-checkbox"
                ).checked,
                useControllers: document.getElementById("controllers-checkbox")
                    .checked,
            });
        });

        // Add event listener for docker checkbox to show/hide container options
        dockerCheckbox.addEventListener("change", (e) => {
            const containerOptions =
                document.querySelector(".container-options");
            containerOptions.classList.toggle("visible", e.target.checked);
        });
    }

    function updateWizardState() {
        // Update step indicators
        wizardSteps.forEach((step, index) => {
            step.classList.toggle("active", index + 1 === currentStep);
        });

        // Update page visibility
        wizardPages.forEach((page, index) => {
            page.classList.toggle("active", index + 1 === currentStep);
        });

        // Update button states
        prevButton.disabled = currentStep === 1;
        nextButton.classList.toggle("hidden", currentStep === 3);
        createButton.classList.toggle("visible", currentStep === 3);

        validateForm();
    }

    // Initialize the wizard
    document.addEventListener("DOMContentLoaded", () => {
        console.log("Page loaded, requesting SDK versions...");
        vscode.postMessage({
            command: "getSDKVersions",
        });
        console.log("SDK versions requested");
        updateWizardState();
        setupEventListeners();
    });
})();
