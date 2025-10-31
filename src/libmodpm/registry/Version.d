module libmodpm.registry.Version;

import std.algorithm.searching;

import libmodpm.registry.Dependency;
import libmodpm.registry.ReleaseChannel;

/**
 * Represents a specific version of a package that can be installed.
 */
public final class Version {
    /**
     * Unique ID of version.
     */
    public const string id;

    /**
     * ID of package this version belongs to.
     */
    public const string packageId;

    /**
     * Version number (e.g., "1.0.0").
     */
    public const string versionNumber;

    /**
     * Dependencies required by this version.
     */
    public const Dependency[] dependencies;

    /**
     * Primary files associated with this version.
     */
    public const File file;

    /**
     * Constructs a Version instance.
     *
     * Params:
     *   id = Unique ID of version.
     *   packageId = ID of package this version belongs to.
     *   versionNumber = Version number (e.g., "1.0.0").
     *   dependencies = Dependencies required by this version.
     *   file = Primary file associated with this version.
     */
    public this(string id, string packageId, string versionNumber, Dependency[] dependencies, File file) {
        this.id = id;
        this.packageId = packageId;
        this.versionNumber = versionNumber;
        this.dependencies = dependencies;
        this.file = file;
    }
    
    /** 
     * Represents a downloadable file associated with a specific version of a package.
     */
    public final class File {
        /**
         * SHA-512 hash of the file.
         */
        public const ubyte[64] hash;
    
        /**
         * Direct download URL.
         */
        public const string url;
    
        /**
         * Name of the file.
         */
        public const string name;
    
        /**
         * Size of the file in bytes.
         */
        public const size_t size;
    
        /**
         * Constructs a VersionFile instance.
         *
         * Params:
         *   hash = SHA-512 hash of the file.
         *   url = Direct download URL.
         *   name = Name of the file.
         *   size = Size of the file in bytes.
         */
        public this(ubyte[64] hash, string url, string name, size_t size) {
            this.hash = hash;
            this.url = url;
            this.name = name;
            this.size = size;
        }
    }
}
