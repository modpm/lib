module libmodpm.inventory.Scope;

import libmodpm.inventory.Config;
import libmodpm.inventory.Manifest;

/**
 * Represents a scope within which packages are managed.
 */
public final class Scope {
    /** 
     * Filesystem path of the scope.
     *
     * This is the path that contains the `.modpm` folder.
     */
    public string path;

    /**
     * Scope configuration.
     */
    public Config config;

    /**
     * Manifest of installed packages.
     */
    public Manifest manifest;

    /**
     * Constructs a new Scope instance.
     *
     * Params:
     *   path = Filesystem path of the scope.
     *   config = Scope configuration.
     *   manifest = Manifest of installed packages.
     */
    public this(string path, Config config, Manifest manifest) {
        this.path = path;
        this.config = config;
        this.manifest = manifest;
    }
}
