module libmodpm.registry.Dependency;

import libmodpm.registry.Package;
import libmodpm.registry.DependencyType;

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
    public const DependencyType type;

    /**
     * Creates a new Dependency instance.
     *
     * Params:
     *   pkg = Dependency package. If `VersionedPackage` is provided, the specific version is required.
     *   type = Type of dependency.
     */
    public this(Package pkg, DependencyType type) {
        this.pkg = pkg;
        this.type = type;
    }
}
