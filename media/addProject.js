// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    // vscode api
    const vscode = acquireVsCodeApi();

    // Html elements bindings
    const buttonCreateProject = document.getElementById(
        "create-project-button"
    );
    const template = document.getElementById("custom-select");
    const project = document.getElementById("projectName");
    const framework = document.getElementById("custom-select2");
    const projectGroupSelect = document.getElementById("project-group-select");

    // Request template data from extension
    vscode.postMessage({
        command: "getTemplates",
    });

    // Handle template data response
    window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.command) {
            case "templates":
                populateProjectGroups(message.templates);
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
        // Clear existing options
        template.innerHTML = "";

        // Add default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select Template";
        template.appendChild(defaultOption);

        // Add template options
        templates.forEach((templateItem) => {
            const option = document.createElement("option");
            option.value = templateItem.shortName;
            option.textContent = templateItem.templateName;
            template.appendChild(option);
        });
    }

    document.addEventListener("DOMContentLoaded", function (event) {
        buttonCreateProject.disabled = "true";
        buttonCreateProject.style.backgroundColor = "#3C3C3C";
        fieldValidation();
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
        let frameworkSelected =
            framework.options[framework.selectedIndex].value;

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
