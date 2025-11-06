module libmodpm.inventory.InstalledPackage;

import libmodpm.registry.Version;
import libmodpm.registry.VersionedPackage;

/**
 * Represents an installed package.
 */
public final class InstalledPackage : VersionedPackage {
    /**
     * Represents the reason why a package was installed.
     */
    public static const enum InstallationReason {
        /**
         * Package was explicitly requested by the user and can only be removed by the user.
         */
        USER = "user",
        /**
         * Package was installed as a dependency and can be automatically removed when orphaned.
         */
        DEPENDENCY = "dependency",
    }

    /**
     * Path where the package is installed.
     */
    public const string path;

    /**
     * Reason why this package was installed.
     */
    public InstallationReason reason;

    /**
     * Whether this package is version-locked.
     */
    public bool versionLocked;

    /**
     * Creates a new InstalledPackage instance.
     *
     * Params:
     *   id = Unique ID of the package.
     *   slug = Slug of the package.
     *   name = Name of the package.
     *   version = Specific version of the package.
     *   path = Path where the package is installed.
     *   reason = Reason why this package was installed.
     *   versionLocked = Whether this package is version-locked.
     */
    public this(string id, string slug, string name, Version ver, string path, InstallationReason reason,
                bool versionLocked = false) {
        super(id, slug, name, ver);
        this.path = path;
        this.reason = reason;
        this.versionLocked = versionLocked;
    }
}
