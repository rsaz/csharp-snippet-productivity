import { ArchitectureScaffold } from "./ArchitectureScaffolder";

/**
 * Canonical Clean Architecture layout (Uncle Bob / Jason Taylor flavour).
 *
 * Dependencies flow inward:
 *   WebApi -> Application -> Domain
 *   WebApi -> Infrastructure -> Application -> Domain
 */
export const CLEAN_ARCHITECTURE_SCAFFOLD: ArchitectureScaffold = {
    label: "Clean Architecture",
    description:
        "Domain / Application / Infrastructure / WebApi with proper layering and references.",
    projects: [
        {
            name: "Domain",
            template: "classlib",
        },
        {
            name: "Application",
            template: "classlib",
            references: ["Domain"],
        },
        {
            name: "Infrastructure",
            template: "classlib",
            references: ["Application"],
        },
        {
            name: "WebApi",
            template: "webapi",
            references: ["Application", "Infrastructure"],
        },
    ],
    extraFolders: {
        Domain: ["Entities", "ValueObjects", "Events", "Exceptions"],
        Application: [
            "Common",
            "Common/Interfaces",
            "Common/Behaviors",
            "Features",
        ],
        Infrastructure: [
            "Persistence",
            "Persistence/Configurations",
            "Identity",
            "Services",
        ],
        WebApi: ["Controllers", "Filters", "Middleware"],
    },
};

/**
 * Domain-Driven Design layout featuring a SharedKernel project for cross-
 * bounded-context primitives (Result, Entity base class, value objects, etc.).
 */
export const DDD_SCAFFOLD: ArchitectureScaffold = {
    label: "DDD",
    description:
        "SharedKernel / Domain / Application / Infrastructure / Api with DDD building blocks pre-folded in.",
    projects: [
        {
            name: "SharedKernel",
            template: "classlib",
        },
        {
            name: "Domain",
            template: "classlib",
            references: ["SharedKernel"],
        },
        {
            name: "Application",
            template: "classlib",
            references: ["Domain"],
        },
        {
            name: "Infrastructure",
            template: "classlib",
            references: ["Application"],
        },
        {
            name: "Api",
            template: "webapi",
            references: ["Application", "Infrastructure"],
        },
    ],
    extraFolders: {
        SharedKernel: ["Primitives", "Errors", "Results"],
        Domain: [
            "Aggregates",
            "Entities",
            "ValueObjects",
            "DomainEvents",
            "Repositories",
            "Specifications",
        ],
        Application: [
            "Abstractions",
            "Behaviors",
            "Commands",
            "Queries",
            "DomainEventHandlers",
        ],
        Infrastructure: [
            "Persistence",
            "Persistence/Configurations",
            "Persistence/Repositories",
            "Authentication",
            "Messaging",
        ],
        Api: ["Endpoints", "Filters", "Middleware"],
    },
};
