/* eslint-disable curly */
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
  // vscode api
  const vscode = acquireVsCodeApi();

  // Html elements bindings
  const buttonCreateProject = document.getElementById("create-project-button");
  const buttonFilePicker = document.getElementById("selectFolder");
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
