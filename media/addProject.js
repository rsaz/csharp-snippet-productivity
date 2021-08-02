// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {

    // vscode api
    const vscode = acquireVsCodeApi();

    // Html elements bindings
    const buttonCreateProject = document.getElementById('create-project-button');
    const template = document.getElementById('custom-select');
    const project = document.getElementById('projectName');
    const framework = document.getElementById('custom-select2');

    document.addEventListener("DOMContentLoaded", function(event) {
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

    template.addEventListener('keydown'| 'click', ()=>{
        project.focus();
    });

    project.addEventListener('change', () => {
        fieldValidation();
        solution.value = project.value;
    });

    // create console project
    buttonCreateProject.addEventListener('click', () => {
        let frameworkSelected = framework.options[framework.selectedIndex].value;
        
        // verify if project has white spaces
        let projectTrimmed = (project.value).replace(/\s/g, "");

        vscode.postMessage({
            command: 'addProject',
            template: template.options[template.selectedIndex].value,
            project: projectTrimmed,
            framework: frameworkSelected
        });
    });
        
})();
