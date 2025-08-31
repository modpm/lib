module libmodpm.registry.VersionFile;

/** 
 * Represents a downloadable file associated with a specific version of a package.
 */
public final class VersionFile {
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
     * Whether this is the primary file of the version.
     */
    public const bool primary;

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
     *   primary = Whether this is the primary file of the version.
     *   size = Size of the file in bytes.
     */
    public this(ubyte[64] hash, string url, string name, bool primary, size_t size) {
        this.hash = hash;
        this.url = url;
        this.name = name;
        this.primary = primary;
        this.size = size;
    }
}
