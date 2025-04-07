export interface ProjectTemplate {
    templateName: string;
    shortName: string;
    description?: string;
    tags?: string[];
    platforms?: string[];
}

export interface ProjectTemplateGroup {
    name: string;
    displayName: string;
    templates: ProjectTemplate[];
}

export const projectTemplateGroups: ProjectTemplateGroup[] = [
    {
        name: "api",
        displayName: "API",
        templates: [
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
    },
    {
        name: "web",
        displayName: "Web",
        templates: [
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
            {
                templateName: "ASP.NET Core with Angular",
                shortName: "angular",
                description:
                    "A project template for creating an ASP.NET Core application with Angular",
                tags: ["Web", "Angular", "SPA"],
            },
            {
                templateName: "ASP.NET Core with React.js",
                shortName: "react",
                description:
                    "A project template for creating an ASP.NET Core application with React.js",
                tags: ["Web", "React", "SPA"],
            },
        ],
    },
    {
        name: "blazor",
        displayName: "Blazor",
        templates: [
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
    },
    {
        name: "desktop",
        displayName: "Desktop",
        templates: [
            {
                templateName: "Windows Forms App",
                shortName: "winforms",
                description:
                    "A project template for creating a Windows Forms application",
                tags: ["Desktop", "Windows Forms", "Windows"],
            },
            {
                templateName: "WPF Application",
                shortName: "wpf",
                description:
                    "A project template for creating a WPF application",
                tags: ["Desktop", "WPF", "Windows"],
            },
        ],
    },
    {
        name: "console",
        displayName: "Console",
        templates: [
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
    },
    {
        name: "lib",
        displayName: "Library",
        templates: [
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
        ],
    },
    {
        name: "test",
        displayName: "Test",
        templates: [
            {
                templateName: "MSTest Test Project",
                shortName: "mstest",
                description:
                    "A project template for creating a test project using MSTest",
                tags: ["Test", "MSTest"],
            },
            {
                templateName: "NUnit 3 Test Project",
                shortName: "nunit",
                description:
                    "A project template for creating a test project using NUnit",
                tags: ["Test", "NUnit"],
            },
            {
                templateName: "xUnit Test Project",
                shortName: "xunit",
                description:
                    "A project template for creating a test project using xUnit",
                tags: ["Test", "xUnit"],
            },
        ],
    },
];

// Helper function to get all templates
export function getAllTemplates(): ProjectTemplate[] {
    return projectTemplateGroups.flatMap((group) => group.templates);
}

// Helper function to get templates by group
export function getTemplatesByGroup(groupName: string): ProjectTemplate[] {
    const group = projectTemplateGroups.find((g) => g.name === groupName);
    return group ? group.templates : [];
}

// Helper function to get template by short name
export function getTemplateByShortName(
    shortName: string
): ProjectTemplate | undefined {
    return getAllTemplates().find(
        (template) => template.shortName === shortName
    );
}
