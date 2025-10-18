module libmodpm.inventory.Scope;

import libmodpm.inventory.Config;
import libmodpm.inventory.Manifest;

/**
 * Represents a scope within which packages are managed.
 */
public final class Scope {
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
     *   config = Scope configuration.
     *   manifest = Manifest of installed packages.
     */
    public this(Config config, Manifest manifest) {
        this.config = config;
        this.manifest = manifest;
    }
}
