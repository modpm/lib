module libmodpm.registry.VersionedDependency;

import libmodpm.registry.Dependency;

/**
 * Represents a specific dependency version of a specific package version.
 */
public class VersionedDependency : Dependency {
    /**
     * ID of the dependency version.
     */
    public const string versionId;

    /**
     * Creates a new VersionDependency instance.
     *
     * Params:
     *   type = Type of the dependency.
     *   packageId = ID of the dependency package.
     *   versionId = ID of the dependency version.
     */
    public this(Dependency.Type type, string packageId, string versionId) {
        super(type, packageId);
        this.versionId = versionId;
    }
}
