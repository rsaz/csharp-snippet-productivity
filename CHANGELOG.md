# Change Log

All notable changes to the "csharp-snippet-productivity" extension will be documented in this file.
Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Released]

## [2.0.0] - [2024-01-14]

## What's new in 2.0.0

> -   **_New Feature added_**: Added support for all project types and templates under project creation.
> -   **_New Feature added_**: Support for .NET 7.0 and .NET 8.0
> -   **_Performance improvements_**: Extension loading time decreased and command execution time decreased.
> -   **_Fix_**: Fixed snippet conflicts and non standard snippets.
> -   **_Enhancement_**: Validates the project template and framework compatibility based on the .NET SDK installed on the machine.
> -   **_Enhancement_**: Added validation to avoid creating projects with empty spaces.
> -   **_Enhancement_**: Reinforce the use of the default folder for project creation.

## [1.3.0] - [2022-07-03]

> -   **_New Feature added_**: Minimal Web API, MStest, xUnit, NUnit project template added.
> -   **_Fix_**: Creating Solution with the same name in the same directory.
> -   **_Fix_**: find-parent-dir dependency updated to remove the error message from vscode.

## [1.2.9] - [2022-05-14]

> -   **_New Feature added_**: Scoped namespaces in the .NET 6.0
> -   **_Improvement_**: Project creation highlighting the `create project button` after the project name is typed and tab is pressed.

## [1.2.8] - [2021-11-13]

> -   **_New Feature added_**: Project support for C# .NET Core 6.0

## [1.2.7] - [2021-09-04]

-   **_Fix_**: Classes, Interfaces, and other types created correctly even when the user type incorrect names.
-   **_New Features added_**: Added a default folder for project creation. Add this configuration to your settings with your path: `"csharp-snippet-productivity.defaultFolderForProjectCreation": "D:\\"` **{Your path}**

## [1.2.6] - 2021-08-28

-   **_Fix_**: Creating solutions in folders path with spaces were not possible. Now solutions and projects can be created in folders with spaces. **i.e: `c:\Your Project Folder\Solution.sln`**

## [1.2.5] - 2021-08-01

-   **_Fix_**: Removed the notes feature preview accidentally uploaded

## [1.2.4] - 2021-08-01

-   **_Fix_**: Solution was being created with project name rather than solution data from solution field.
-   **_New Features added_**:
-   **_Add Project to a Solution_** : Capability to add projects to the same solution with a click of a button. You can select a different project framework as well as the template.
-   **_Submenu With Options_** :
-   Create Class
-   Create Interface
-   Create Record
-   Create Struct

## [1.2.3] - 2021-07-18

-   **_Fix_**: .NET target frameworks list on project creation are based on OS and SDKs installed.
-   **_Enhancement_**: Design patterns snippets added. It will create a commented pattern code to be used as reference
-   **_singleton_** : Creational singleton pattern
-   **_factoryMethod_** : Creational factory method pattern
-   **_adapter_** : Structural adapter pattern
-   **_observer_**: Structural observer pattern
-   **_Enhancement_**: Regex snippet cheat sheet added.
-   **_regex_** : Regex cheat sheet

## [1.2.2] - 2021-03-24

-   Enhancement: When creating classes or interfaces system will consider if you have a \<RootNamespace>YourUniqueNamespace\</RootNamespace> tag. If the tag is not found system will use your project name as your root namespace.

## [1.2.1] - 2021-02-28

-   Fixing command not found issue on 1.2 version

## [1.2.0] - 2021-02-28

-   Added command to create Class from the context/menu
-   Added command to create Interface from the context/menu

## [1.1.0] - 2021-02-23

-   Command to create projects
-   Projects templates supported:
    -   Blazor Server App
    -   Blazor WebAssembly App
    -   Console Application
    -   Class Library
    -   .NET Core: Empty, MVC, Razor Page, Angular SPA, React SPA, React/Redux SPA, Web Api, GRPC Services, Razor Class Library
-   Added snippets for creating arrays, lists and dictionaries using var
    -   var myArray = new type[size];
    -   var myList = new List\<type>();
    -   var myDictionary = new Dictionary\<type,type>();

## [1.0.0] - 2021-02-11

-   Initial project release
-   Custom comments: colorful comments for better coding organization
    -   NORMAL comments [***//***]
    -   TODO: comments [***todo***]
    -   REVIEW: comments [***review***]
    -   BUG: comments [***bug***]
    -   RESEARCH: comments [***research***]
-   General C# snippets
-   XML Documentation snippets
