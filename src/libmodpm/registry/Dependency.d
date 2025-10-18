module libmodpm.registry.Dependency;

import libmodpm.registry.Package;

/** 
 * Represents a dependency of a specific package version.
 */
public final class Dependency {
    /**
     * Dependency package. If `VersionedPackage` is provided, the specific version is required.
     */
    public const Package pkg;

    /**
     * Type of dependency.
     */
    public const Type type;

    /**
     * Creates a new Dependency instance.
     *
     * Params:
     *   pkg = Dependency package. If `VersionedPackage` is provided, the specific version is required.
     *   type = Type of dependency.
     */
    public this(Package pkg, Type type) {
        this.pkg = pkg;
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
