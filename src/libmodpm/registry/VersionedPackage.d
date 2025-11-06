module libmodpm.registry.VersionedPackage;

import libmodpm.registry.Package;
import libmodpm.registry.Version;

public class VersionedPackage : Package {
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
     *   version = Specific version of the package.
     */
    public this(string id, string slug, string name, Version ver) {
        super(id, slug, name);
        this.ver = ver;
    }
}
