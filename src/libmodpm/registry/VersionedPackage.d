module libmodpm.registry.VersionedPackage;

import libmodpm.registry.Package;
import libmodpm.registry.Version;

public final class VersionedPackage : Package {
    /**
     * Specific version of the package.
     */
    public const Version ver;

    /**
     * Creates a new VersionedPackage instance.
     *
     * Params:
     *   id = Unique ID of package.
     *   slug = Slug of package.
     *   name = Name of package.
     *   description = Description of package.
     *   version = Specific version of the package.
     */
    public this(string id, string slug, string name, string description, Version ver) {
        super(id, slug, name, description);
        this.ver = ver;
    }
}
