module libmodpm.registry.Dependency;

/**
 * Represents a dependency of a specific package version.
 */
public class Dependency {
    /**
     * ID of the dependency package.
     */
    public const string packageId;

    /**
     * Type of the dependency.
     */
    public const Type type;

    /**
     * Creates a new Dependency instance.
     *
     * Params:
     *   type = Type of the dependency.
     *   packageId = ID of the dependency package.
     */
    public this(Type type, string packageId) {
        this.packageId = packageId;
        this.type = type;
    }

    /**
     * Represents the relationship type between the dependent package and the dependency.
     */
    public static final enum Type {
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
}
