<h2 align="center">
C# Snippet Productivity
</h2>
<h3 align="center">
	<a href="https://img.shields.io/badge/type-Open Project-green">
		<img src="https://img.shields.io/badge/type-Open Project-green" align="center">
	</a>
    <a href="https://img.shields.io/github/repo-size/rsaz/mankind">
        <img src="https://img.shields.io/github/repo-size/rsaz/csharp-snippet-productivity" align="center"/>
    </a>	
    <a href="https://img.shields.io/github/contributors/rsaz/csharp-snippet-productivity.svg">
        <img src="https://img.shields.io/github/contributors/rsaz/csharp-snippet-productivity.svg" align="center"/>
    </a>
    <a href="https://img.shields.io/github/stars/rsaz/csharp-snippet-productivity?style=social">
        <img src="https://img.shields.io/github/stars/rsaz/csharp-snippet-productivity?style=social" align="center"/>
    </a>	
	<br>
</h3>

## Goal

> - C# Snippet Productivity aims to increase the use of vscode editor as the main tool for console, web and game development in C# Programming Language providing the same shortcuts, efficiency, intellisense that is offered by Visual Studio Community.
> - One of the first objectives is to reduce the amount of extensions downloaded for C# reducing the time and effort on configuration that has to be done by the user as well as to avoid extensions conflicts. Also great features to speed up your development workflow.

## Changelog

> [Click here](https://github.com/rsaz/csharp-snippet-productivity/blob/main/CHANGELOG.md)

## What's new in 1.2.9
> - **_New Feature added_**: Scoped namespaces in the .NET 6.0 
> - **_Improvement_**: Project creation highlighting the `create project button` after the project name is typed and tab is pressed.

## What's new in 1.2.8

> - **_New Feature added_**: Project support for C# .NET Core 6.0

## Current features

> - **_Fix_**: Classes, Interfaces, and other types created correctly even when the user type incorrect names.
> - **_New Features added_**: Added a default folder for project creation. Add this configuration to your settings with your path: `"csharp-snippet-productivity.defaultFolderForProjectCreation": "D:\\"` **{Your path}**
> - **_New Features added_**:
> - **_Add Project to a Solution_** : Capability to add projects to the same solution with a click of a button. You can select a different project framework as well as the template.
>
> ![Add Project](https://github.com/rsaz/csharp-snippet-productivity/blob/main/videos/addProject.PNG?raw=true)
>
> - **_Submenu With Options_** :
>   - Create Class
>   - Create Interface
>   - Create Record
>   - Create Struct
> - **_Fix_**: .NET target frameworks list on project creation are based on OS and SDKs installed.
> - **_Enhancement_**: Design patterns snippets added. It will create a commented pattern code to be used as reference
> - **_singleton_** : Creational singleton pattern
> - **_factoryMethod_** : Creational factory method pattern
> - **_adapter_** : Structural adapter pattern
> - **_observer_**: Structural observer pattern
> - **_Enhancement_**: Regex snippet cheat sheet added.
> - **_regex_** : Regex cheat sheet
> - When creating classes or interfaces system will consider if you have a `<RootNamespace>`YourUniqueNamespace`</RootNamespace>` tag on your **_.csproj_**. If the tag is not found system will use your project name as your root namespace
> - Added command to create Class from the context/menu
> - Added command to create Interface from the context/menu
> - How to use:
>   - Right click in the project folder or any folder inside of your project folder and select either Create Class or Create Interface
>   - Give it a name of your file and class or interface will be created automatically in the selected folder
>
> ![Class and Interface](https://github.com/rsaz/csharp-snippet-productivity/blob/main/videos/classInterface.PNG?raw=true)

### Command to Create Solution or Project

> Command to create projects
>
> Press CTRL + SHIFT + P: Then type: Create Project
> [ C# Toolbox: Create Project ]
>
> > ![Create Project](https://github.com/rsaz/csharp-snippet-productivity/blob/main/videos/createproject.PNG?raw=true)
>
> - Projects templates supported:
> - Blazor Server App
> - Blazor WebAssembly App
> - Console Application
> - Class Library
> - .NET Core: Empty, MVC, Razor Page, Angular SPA, React SPA, React/Redux SPA, Web Api, GRPC Services, Razor Class Library
>
> - Added snippets for creating arrays, lists and dictionaries using var
>   - var myArray = new type[size];
>   - var myList = new List\<type>();
>   - var myDictionary = new Dictionary\<type,type>();

> ### Smart Comments
>
> - Colorful and configurable comments to better emphasize your work
> - Snippets:
>   - **_todo_** : comments
>   - **_review_** : comments
>   - **_bug_** : comments
>   - **_research_** : comments
>     > ![Colored comments](https://github.com/rsaz/csharp-snippet-productivity/blob/main/videos/comment.gif?raw=true)

> ### General Snippets
>
> - **_cw_** : console write/writeline
> - **_cwi_** : console writeline interpolation
> - **_cr_** : console readline
> - **_crk_**: console readkey
> - **_clr_**: console clear
> - **_var_**: variable declaration
> - **_if_**: if statement
> - **_else_**: else statement
> - **_ifelse_**: if/else statement
> - **_iif_**: conditional operator
> - **_enum_**: enum type
> - **_switch_**: switch statement
> - **_using_**: using statement
> - **_while_**: while loop
> - **_dowhile_**: do/while loop
> - **_for_**: for loop
> - **_foreach_**: foreach loop
> - **_arr_**: array structure
> - **_varr_**: array structure using var
> - **_lst_**: list structure
> - **_vlst_**: list structure using var
> - **_ilst_**: Ilist structure
> - **_dic_**: dictionary structure
> - **_vdic_**: dictionary structure using var
> - **_cdic_**: concurrent dictionary structure
> - **_idic_**: idictionary structure
> - **_func_**: create a void function
> - **_vfunc_**: create a virtual function
> - **_afunc_**: create an abstract function
> - **_rfunc_**: create a function with return type
> - **_sfunc_**: create a static function
> - **_pfunc_**: create a function using params
> - **_try_**: create a try/catch block
> - **_namespace_**: add namespace
> - **_struct_**: create a struct
> - **_class_**: create a class based on the file name
> - **_ctor_**: class constructor
> - **_instantiate_**: object instantiation
> - **_fclass_**: class created with a default constructor and three overrides [ToString, Equals, GetHashCode]
> - **_sclass_**: create a static class
> - **_aclass_**: create an abstract class
> - **_interface_**: create an interface based on the file name
> - **_prop_**: create a property
> - **_prope_**: create an expanded property
> - **_record_**: create a record
>
> ### XML Documentation Snippets
>
> - **_xml-summary_**: this tag adds brief information about a type or member
> - **_xml-remarks_**: the [remarks] tag supplements the information about types or members that the [summary] tag provides
> - **_xml-returns_**: the [returns] tag describes the return value of a method declaration
> - **_xml-value_**: the [value] tag is similar to the [returns] tag, except that you use it for properties
> - **_xml-example_**: You use the [example] tag to include an example in your XML documentation. This involves using the child [code] tag
> - **_xml-para_**: you use the [para] tag to format the content within its parent tag. [para] is usually used inside a tag, such as [remarks] or [returns], to divide text into paragraphs. You can format the contents of the [remarks] tag for your class definition
> - **_xml-c_**: still on the topic of formatting, you use the [c] tag for marking part of text as code. It's like the [code] tag but inline. It's useful when you want to show a quick code example as part of a tag's content
> - **_xml-exception_**: by using the [exception] tag, you let your developers know that a method can throw specific exceptions
> - **_xml-see_**: the [see] tag lets you create a clickable link to a documentation page for another code element
> - **_xml-seealso_**: you use the [seealso] tag in the same way you do the [see] tag. The only difference is that its content is typically placed in a \"See Also\" section
> - **_xml-param_**: you use the [param] tag to describe a method's parameters
> - **_xml-typeparam_**: You use [typeparam] tag just like the [param] tag but for generic type or method declarations to describe a generic parameter
> - **_xml-paramref_**: sometimes you might be in the middle of describing what a method does in what could be a [summary] tag, and you might want to make a reference to a parameter
> - **_xml-typeparamref_**: you use [typeparamref] tag just like the [paramref] tag but for generic type or method declarations to describe a generic parameter
> - **_xml-list_**: you use the [list] tag to format documentation information as an ordered list, unordered list, or table
> - **_xml-inheritdoc_**: you can use the [inheritdoc] tag to inherit XML comments from base classes, interfaces, and similar methods
> - **_xml-include_**: the [include] tag lets you refer to comments in a separate XML file that describe the types and members in your source code, as opposed to placing documentation comments directly in your source code file

## How to use

> - All the snippets comments are shown as -> snippet name
> - Snippets were created thinking on productivity and the extensive use of tab key
>
> ![Add var, class, function](https://github.com/rsaz/csharp-snippet-productivity/blob/main/videos/clipvarclassfunc.gif?raw=true)
>
> ![Add property, dictionary](https://github.com/rsaz/csharp-snippet-productivity/blob/main/videos/clippropdic.gif?raw=true)
>
> - Colored comments were created to increase visibility of todo's, reviews, bugs and research
>
> ![Add list, comments](https://github.com/rsaz/csharp-snippet-productivity/blob/main/videos/cliplistcom.gif?raw=true)

## Do you want to contribute?

### Guidelines

> 1. **Fork** the original repository to your own repository
> 2. **Clone** it to your local
> 3. **Contribute to it**
> 4. **Push** it to your remote repo
> 5. Send a **PR** `[Pull Request]` to the main repo
> 6. Your contribution will be evaluated then we will merge your changes with the original repository. ❤

### For more information

- [Richard Zampieri](https://github.com/rsaz)

**Enjoy!**
