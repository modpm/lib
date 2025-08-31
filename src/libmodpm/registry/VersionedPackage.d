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
     *   id = Unique ID of project.
     *   name = Name of project.
     *   description = Description of project.
     *   version = Specific version of the package.
     */
    public this(string id, string name, string description, Version ver) {
        super(id, name, description);
        this.ver = ver;
    }
}
