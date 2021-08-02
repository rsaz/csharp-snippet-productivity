# Change Log

All notable changes to the "csharp-snippet-productivity" extension will be documented in this file.
Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Released]

## [1.2.4] - 2021-08-01

- **_Fix_**: Solution was being created with project name rather than solution data from solution field.
- **_New Features added_**:
- **_Add Project to a Solution_** : Capability to add projects to the same solution with a click of a button. You can select a different project framework as well as the template.
- **_Submenu With Options_** :
- Create Class
- Create Interface
- Create Record
- Create Struct

## [1.2.3] - 2021-07-18

- **_Fix_**: .NET target frameworks list on project creation are based on OS and SDKs installed.
- **_Enhancement_**: Design patterns snippets added. It will create a commented pattern code to be used as reference
- **_singleton_** : Creational singleton pattern
- **_factoryMethod_** : Creational factory method pattern
- **_adapter_** : Structural adapter pattern
- **_observer_**: Structural observer pattern
- **_Enhancement_**: Regex snippet cheat sheet added.
- **_regex_** : Regex cheat sheet

## [1.2.2] - 2021-03-24

- Enhancement: When creating classes or interfaces system will consider if you have a \<RootNamespace>YourUniqueNamespace\</RootNamespace> tag. If the tag is not found system will use your project name as your root namespace.

## [1.2.1] - 2021-02-28

- Fixing command not found issue on 1.2 version

## [1.2.0] - 2021-02-28

- Added command to create Class from the context/menu
- Added command to create Interface from the context/menu

## [1.1.0] - 2021-02-23

- Command to create projects
- Projects templates supported:
  - Blazor Server App
  - Blazor WebAssembly App
  - Console Application
  - Class Library
  - .NET Core: Empty, MVC, Razor Page, Angular SPA, React SPA, React/Redux SPA, Web Api, GRPC Services, Razor Class Library
- Added snippets for creating arrays, lists and dictionaries using var
  - var myArray = new type[size];
  - var myList = new List\<type>();
  - var myDictionary = new Dictionary\<type,type>();

## [1.0.0] - 2021-02-11

- Initial project release
- Custom comments: colorful comments for better coding organization
  - NORMAL comments [***//***]
  - TODO: comments [***todo***]
  - REVIEW: comments [***review***]
  - BUG: comments [***bug***]
  - RESEARCH: comments [***research***]
- General C# snippets
- XML Documentation snippets
