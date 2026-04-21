/* eslint-disable curly */
/**
 * C# Toolbox - Project Creation Wizard
 * Webview-side script. Cannot access VS Code APIs directly.
 */
(function () {
    "use strict";

    const vscode = acquireVsCodeApi();

    // ===== Constants =====
    const PROJECT_NAME_REGEX = /^[A-Za-z_][A-Za-z0-9_.]*$/;
    const RECOMMENDED_FRAMEWORKS = ["net9.0", "net8.0"];
    const LTS_FRAMEWORKS = ["net8.0", "net6.0"];
    const TOTAL_STEPS = 3;
    const DEFAULT_TOAST_MS = 4000;

    // ===== State =====
    const state = {
        currentStep: 1,
        selectedTemplate: null,
        selectedTemplateName: null,
        selectedFramework: null,
        templateGroups: [],
        recentProjects: loadPersistedState().recentProjects || [],
    };

    // ===== DOM References =====
    const dom = {
        wizardSteps: document.querySelectorAll(".step"),
        wizardStepsNav: document.querySelector(".wizard-steps"),
        wizardPages: document.querySelectorAll(".wizard-page"),
        prevButton: document.getElementById("prev-button"),
        nextButton: document.getElementById("next-button"),
        createButton: document.getElementById("create-project-button"),
        projectGroupSelect: document.getElementById("project-group-select"),
        templateSearch: document.getElementById("template-search"),
        templateGrid: document.getElementById("template-grid"),
        templateEmptyState: document.getElementById("template-empty-state"),
        projectNameInput: document.getElementById("projectName"),
        solutionInput: document.getElementById("solution"),
        locationInput: document.getElementById("inputLocal"),
        selectFolderButton: document.getElementById("selectFolder"),
        frameworkGrid: document.getElementById("framework-grid"),
        httpsCheckbox: document.getElementById("https-checkbox"),
        dockerCheckbox: document.getElementById("docker-checkbox"),
        recentProjectsSection: document.getElementById("recent-projects-section"),
        recentProjectsList: document.getElementById("recent-projects-list"),
        clearRecentBtn: document.getElementById("clear-recent"),
        loadingOverlay: document.getElementById("loading-overlay"),
        loadingText: document.getElementById("loading-text"),
        toastContainer: document.getElementById("toast-container"),
        projectNameError: document.getElementById("projectName-error"),
        solutionError: document.getElementById("solution-error"),
        locationError: document.getElementById("location-error"),
    };

    // ===== Persistence =====
    function loadPersistedState() {
        try {
            return vscode.getState() || {};
        } catch {
            return {};
        }
    }

    function persistState() {
        try {
            vscode.setState({
                recentProjects: state.recentProjects,
            });
        } catch (e) {
            console.warn("Could not persist state", e);
        }
    }

    // ===== Toast Notifications =====
    function showToast(message, type = "info", durationMs = DEFAULT_TOAST_MS) {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.setAttribute("role", "status");

        const icons = { success: "✓", error: "✕", warning: "!", info: "i" };
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message"></span>
            <button class="toast-close" aria-label="Dismiss notification">×</button>
        `;
        toast.querySelector(".toast-message").textContent = message;

        const close = () => {
            toast.classList.add("toast-removing");
            setTimeout(() => toast.remove(), 250);
        };

        toast.querySelector(".toast-close").addEventListener("click", close);
        dom.toastContainer.appendChild(toast);

        if (durationMs > 0) {
            setTimeout(close, durationMs);
        }
    }

    // ===== Loading Overlay =====
    function showLoading(text) {
        dom.loadingText.textContent = text || "Loading...";
        dom.loadingOverlay.classList.add("visible");
    }

    function hideLoading() {
        dom.loadingOverlay.classList.remove("visible");
    }

    // ===== Validation =====
    function isValidName(value) {
        return typeof value === "string" && PROJECT_NAME_REGEX.test(value.trim());
    }

    function setFieldError(fieldGroup, hasError) {
        if (hasError) {
            fieldGroup.classList.add("has-error");
        } else {
            fieldGroup.classList.remove("has-error");
        }
    }

    function setInputValidity(input, isValid, isTouched) {
        input.classList.toggle("invalid", isTouched && !isValid);
        input.classList.toggle("valid", isValid);
    }

    function validateStep1() {
        return Boolean(state.selectedTemplate);
    }

    function validateStep2() {
        const projectName = dom.projectNameInput.value.trim();
        const solution = dom.solutionInput.value.trim();
        const location = dom.locationInput.value.trim();

        const projectValid = isValidName(projectName);
        const solutionValid = isValidName(solution);
        const locationValid = location.length > 0;

        setInputValidity(dom.projectNameInput, projectValid, projectName.length > 0);
        setInputValidity(dom.solutionInput, solutionValid, solution.length > 0);

        setFieldError(
            dom.projectNameInput.closest(".form-group"),
            projectName.length > 0 && !projectValid
        );
        setFieldError(
            dom.solutionInput.closest(".form-group"),
            solution.length > 0 && !solutionValid
        );
        setFieldError(
            dom.locationInput.closest(".form-group"),
            false
        );

        return projectValid && solutionValid && locationValid;
    }

    function validateStep3() {
        return Boolean(state.selectedFramework);
    }

    function validateCurrentStep() {
        switch (state.currentStep) {
            case 1: return validateStep1();
            case 2: return validateStep2();
            case 3: return validateStep3();
            default: return false;
        }
    }

    function updateNavButtons() {
        const isValid = validateCurrentStep();
        dom.prevButton.disabled = state.currentStep === 1;

        if (state.currentStep === TOTAL_STEPS) {
            dom.nextButton.classList.add("hidden");
            dom.createButton.classList.remove("hidden");
            dom.createButton.disabled = !isValid;
        } else {
            dom.nextButton.classList.remove("hidden");
            dom.createButton.classList.add("hidden");
            dom.nextButton.disabled = !isValid;
        }
    }

    // ===== Wizard Navigation =====
    function goToStep(step) {
        if (step < 1 || step > TOTAL_STEPS) return;
        state.currentStep = step;
        renderWizardState();
    }

    function nextStep() {
        if (!validateCurrentStep()) {
            showToast("Please complete the required fields before continuing.", "warning");
            return;
        }
        if (state.currentStep < TOTAL_STEPS) {
            goToStep(state.currentStep + 1);
        }
    }

    function prevStep() {
        if (state.currentStep > 1) {
            goToStep(state.currentStep - 1);
        }
    }

    function renderWizardState() {
        dom.wizardSteps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.toggle("active", stepNum === state.currentStep);
            step.classList.toggle("completed", stepNum < state.currentStep);
            if (stepNum === state.currentStep) {
                step.setAttribute("aria-current", "step");
            } else {
                step.removeAttribute("aria-current");
            }
        });

        dom.wizardStepsNav.setAttribute("data-progress", state.currentStep);

        dom.wizardPages.forEach((page) => {
            const pageStep = parseInt(page.dataset.step, 10);
            page.classList.toggle("active", pageStep === state.currentStep);
        });

        updateNavButtons();
    }

    // ===== Template Handling =====
    function populateProjectGroups(templateGroups) {
        state.templateGroups = templateGroups || [];
        dom.projectGroupSelect.innerHTML = "";

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "All Categories";
        dom.projectGroupSelect.appendChild(defaultOption);

        state.templateGroups.forEach((group) => {
            const option = document.createElement("option");
            option.value = group.name;
            option.textContent = group.displayName;
            dom.projectGroupSelect.appendChild(option);
        });

        renderTemplates();
    }

    function getFilteredTemplates() {
        const groupFilter = dom.projectGroupSelect.value;
        const searchTerm = dom.templateSearch.value.trim().toLowerCase();

        let templates = [];
        state.templateGroups.forEach((group) => {
            if (!groupFilter || group.name === groupFilter) {
                templates = templates.concat(
                    group.templates.map((t) => ({ ...t, groupName: group.displayName }))
                );
            }
        });

        if (searchTerm) {
            templates = templates.filter((t) => {
                const haystack = [
                    t.templateName,
                    t.shortName,
                    t.description || "",
                    (t.tags || []).join(" "),
                ]
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(searchTerm);
            });
        }

        return templates;
    }

    function renderTemplates() {
        const templates = getFilteredTemplates();
        dom.templateGrid.innerHTML = "";

        if (templates.length === 0) {
            const empty = document.createElement("div");
            empty.className = "empty-state";
            empty.innerHTML = `
                <div class="empty-state-icon">∅</div>
                <div class="empty-state-text">No templates match your search</div>
            `;
            dom.templateGrid.appendChild(empty);
            return;
        }

        templates.forEach((template) => {
            dom.templateGrid.appendChild(createTemplateCard(template));
        });

        // Re-apply selection if any
        if (state.selectedTemplate) {
            const selected = dom.templateGrid.querySelector(
                `[data-template="${state.selectedTemplate}"]`
            );
            if (selected) selected.classList.add("selected");
        }
    }

    function createTemplateCard(template) {
        const card = document.createElement("div");
        card.className = "template-card";
        card.dataset.template = template.shortName;
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", template.templateName);

        const content = document.createElement("div");
        content.className = "template-content";

        const title = document.createElement("h3");
        title.textContent = template.templateName;
        content.appendChild(title);

        if (template.description) {
            const description = document.createElement("p");
            description.textContent = template.description;
            content.appendChild(description);
        }

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

        if (template.platforms && template.platforms.length > 0) {
            const platforms = document.createElement("div");
            platforms.className = "template-platforms";
            const platformText = document.createElement("small");
            platformText.textContent = `Platforms: ${template.platforms.join(", ")}`;
            platforms.appendChild(platformText);
            content.appendChild(platforms);
        }

        card.appendChild(content);

        const select = () => {
            document
                .querySelectorAll(".template-card")
                .forEach((c) => c.classList.remove("selected"));
            card.classList.add("selected");
            state.selectedTemplate = template.shortName;
            state.selectedTemplateName = template.templateName;
            updateNavButtons();
        };

        card.addEventListener("click", select);
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                select();
            }
        });

        return card;
    }

    // ===== Frameworks =====
    function populateFrameworks(sdks) {
        dom.frameworkGrid.innerHTML = "";

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
                        .localeCompare(fullVersion, undefined, { numeric: true }) < 0
                ) {
                    versionGroups.set(version, fullVersion);
                }
            }
        });

        const sortedVersions = Array.from(versionGroups.entries()).sort((a, b) => {
            const [majorA, minorA] = a[0].split(".").map(Number);
            const [majorB, minorB] = b[0].split(".").map(Number);
            if (majorA !== majorB) return majorB - majorA;
            return minorB - minorA;
        });

        sortedVersions.forEach(([version, fullVersion]) => {
            const frameworkId = `net${version}`;
            const card = document.createElement("div");
            card.className = "framework-card";
            card.dataset.framework = frameworkId;
            card.dataset.version = fullVersion;
            card.setAttribute("role", "radio");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-checked", "false");
            card.setAttribute("aria-label", `.NET ${version}`);

            if (RECOMMENDED_FRAMEWORKS.includes(frameworkId)) {
                card.classList.add("recommended");
            }

            const title = document.createElement("h3");
            title.textContent = `.NET ${version}`;
            card.appendChild(title);

            if (LTS_FRAMEWORKS.includes(frameworkId)) {
                const badge = document.createElement("span");
                badge.className = "lts-badge";
                badge.textContent = "LTS";
                card.appendChild(badge);
            }

            const select = () => {
                document.querySelectorAll(".framework-card").forEach((c) => {
                    c.classList.remove("selected");
                    c.setAttribute("aria-checked", "false");
                });
                card.classList.add("selected");
                card.setAttribute("aria-checked", "true");
                state.selectedFramework = frameworkId;
                updateNavButtons();
            };

            card.addEventListener("click", select);
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    select();
                }
            });

            dom.frameworkGrid.appendChild(card);
        });

        // Auto-select first recommended if available
        const firstRecommended = dom.frameworkGrid.querySelector(
            ".framework-card.recommended"
        );
        if (firstRecommended && !state.selectedFramework) {
            firstRecommended.click();
        }
    }

    // ===== Recent Projects =====
    function renderRecentProjects() {
        if (!state.recentProjects || state.recentProjects.length === 0) {
            dom.recentProjectsSection.classList.add("hidden");
            return;
        }

        dom.recentProjectsSection.classList.remove("hidden");
        dom.recentProjectsList.innerHTML = "";

        state.recentProjects.slice(0, 6).forEach((project) => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "recent-project-chip";
            chip.title = `Reuse template "${project.templateName}" (${project.framework})`;
            chip.innerHTML = `
                <span class="icon">↻</span>
                <span class="text"></span>
            `;
            chip.querySelector(".text").textContent = `${project.templateName} · ${project.framework}`;
            chip.addEventListener("click", () => {
                state.selectedTemplate = project.template;
                state.selectedTemplateName = project.templateName;
                state.selectedFramework = project.framework;
                renderTemplates();
                showToast(
                    `Loaded recent template "${project.templateName}"`,
                    "info",
                    2500
                );
                updateNavButtons();
            });
            dom.recentProjectsList.appendChild(chip);
        });
    }

    function addRecentProject(entry) {
        if (!entry || !entry.template) return;
        state.recentProjects = [
            entry,
            ...state.recentProjects.filter(
                (p) => !(p.template === entry.template && p.framework === entry.framework)
            ),
        ].slice(0, 10);
        persistState();
    }

    // ===== Message Handling =====
    window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.command) {
            case "templates":
                populateProjectGroups(message.templates);
                break;
            case "updateLocation":
                dom.locationInput.value = message.filepath;
                updateNavButtons();
                break;
            case "sdkVersions":
                populateFrameworks(message.versions);
                break;
            case "creationStarted":
                showLoading(message.text || "Creating project...");
                break;
            case "creationCompleted":
                hideLoading();
                showToast(
                    message.text || "Project created successfully!",
                    "success"
                );
                break;
            case "creationFailed":
                hideLoading();
                showToast(
                    message.text || "Project creation failed.",
                    "error",
                    6000
                );
                break;
            case "showToast":
                showToast(message.text, message.type || "info", message.durationMs);
                break;
        }
    });

    // ===== Event Wiring =====
    function setupEventListeners() {
        dom.prevButton.addEventListener("click", prevStep);
        dom.nextButton.addEventListener("click", nextStep);

        dom.projectGroupSelect.addEventListener("change", renderTemplates);
        dom.templateSearch.addEventListener("input", debounce(renderTemplates, 150));

        dom.projectNameInput.addEventListener("input", () => {
            const projectName = dom.projectNameInput.value.trim();
            if (
                !dom.solutionInput.value ||
                dom.solutionInput.value === dom.projectNameInput.dataset.lastValue
            ) {
                dom.solutionInput.value = projectName;
            }
            dom.projectNameInput.dataset.lastValue = projectName;
            updateNavButtons();
        });

        dom.solutionInput.addEventListener("input", updateNavButtons);

        dom.selectFolderButton.addEventListener("click", () => {
            vscode.postMessage({ command: "selectDirectory" });
        });

        dom.createButton.addEventListener("click", submitProject);

        dom.dockerCheckbox.addEventListener("change", (e) => {
            const containerOptions = document.querySelector(".container-options");
            containerOptions.classList.toggle("visible", e.target.checked);
        });

        if (dom.clearRecentBtn) {
            dom.clearRecentBtn.addEventListener("click", () => {
                state.recentProjects = [];
                persistState();
                renderRecentProjects();
                showToast("Recent projects cleared.", "info", 2000);
            });
        }

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            const tag = (e.target && e.target.tagName) || "";
            const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

            if (e.key === "Escape") {
                if (dom.loadingOverlay.classList.contains("visible")) return;
                vscode.postMessage({ command: "closePanel" });
            } else if (e.key === "Enter" && !isInput) {
                if (state.currentStep < TOTAL_STEPS) {
                    nextStep();
                } else if (validateCurrentStep()) {
                    submitProject();
                }
            }
        });
    }

    function submitProject() {
        if (!validateCurrentStep()) {
            showToast("Please complete all required fields.", "warning");
            return;
        }

        const projectName = dom.projectNameInput.value.trim();
        const solutionName = dom.solutionInput.value.trim();
        const location = dom.locationInput.value.trim();
        const framework = state.selectedFramework;

        const payload = {
            command: "createProject",
            project: projectName,
            solution: solutionName,
            template: state.selectedTemplate,
            framework: framework,
            authType: document.getElementById("auth-type").value,
            noHttps: !dom.httpsCheckbox.checked,
            docker: dom.dockerCheckbox.checked,
            containerOs: document.getElementById("container-os").value,
            containerBuildType: document.getElementById("container-build-type").value,
            openApi: document.getElementById("openapi-checkbox").checked,
            noTopLevelStatements: document.getElementById(
                "top-level-statements-checkbox"
            ).checked,
            useControllers: document.getElementById("controllers-checkbox").checked,
        };

        addRecentProject({
            template: state.selectedTemplate,
            templateName: state.selectedTemplateName || state.selectedTemplate,
            framework: framework,
        });

        showLoading(`Creating ${projectName}...`);
        vscode.postMessage(payload);
    }

    function debounce(fn, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // ===== Initialization =====
    document.addEventListener("DOMContentLoaded", () => {
        renderRecentProjects();
        vscode.postMessage({ command: "getTemplates" });
        vscode.postMessage({ command: "getSDKVersions" });
        renderWizardState();
        setupEventListeners();
    });
})();
