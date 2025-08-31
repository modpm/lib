module libmodpm.registry.DependencyType;

public final enum DependencyType {
        /**
     * The package declares that the dependency is mandatory.
     */
    REQUIRED = "required",

    /**
     * The package declares that the dependency is not required, but it may interact with it if present.
     */
    OPTIONAL = "optional",

    /**
     * The package declares that the dependency is included within the package.
     */
    EMBEDDED = "embedded",

    /**
     * The package declares that the dependency is not allowed to be present.
     */
    INCOMPATIBLE = "incompatible",
}
