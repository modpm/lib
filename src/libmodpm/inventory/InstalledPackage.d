module libmodpm.inventory.InstalledPackage;

import libmodpm.registry.VersionedPackage;
import libmodpm.registry.Version;

/**
 * Represents an installed package.
 */
public final class InstalledPackage : VersionedPackage {
    /**
     * Path where the package is installed.
     */
    public const string path;
    
    /**
     * Whether this package is version-locked.
     */
    public bool versionLocked;

    /**
     * Creates a new InstalledPackage instance.
     *
     * Params:
     *   id = Unique ID of package.
     *   slug = Slug of package.
     *   name = Name of package.
     *   description = Description of package.
     *   version = Specific version of the package.
     *   path = Path where the package is installed.
     */
    public this(string id, string slug, string name, string description, Version ver, string path,
                bool versionLocked = false) {
        super(id, slug, name, description, ver);
        this.path = path;
        this.versionLocked = versionLocked;
    }
}
