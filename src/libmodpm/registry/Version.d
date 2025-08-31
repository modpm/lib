module libmodpm.registry.Version;

import std.algorithm.searching : find;

import libmodpm.registry.ReleaseChannel;
import libmodpm.registry.Dependency;
import libmodpm.registry.VersionFile;

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
     * Release channel of this version.
     */
    public const ReleaseChannel releaseChannel;

    /**
     * Loaders compatible with this version.
     */
    public const string[] loaders;

    /**
     * Game versions compatible with this version.
     */
    public const string[] gameVersions;

    /**
     * Dependencies required by this version.
     */
    public const Dependency[] dependencies;

    /**
     * Files associated with this version.
     */
    public const VersionFile[] files;

    /**
     * Constructs a Version instance.
     *
     * Params:
     *   id = Unique ID of version.
     *   packageId = ID of package this version belongs to.
     *   versionNumber = Version number (e.g., "1.0.0").
     *   releaseChannel = Release channel of this version.
     *   loaders = Loaders compatible with this version.
     *   gameVersions = Game versions compatible with this version.
     *   dependencies = Dependencies required by this version.
     *   files = Files associated with this version.
     */
    public this(string id, string packageId, string versionNumber, ReleaseChannel releaseChannel,
        string[] loaders, string[] gameVersions, Dependency[] dependencies, VersionFile[] files) {
        this.id = id;
        this.packageId = packageId;
        this.versionNumber = versionNumber;
        this.releaseChannel = releaseChannel;
        this.loaders = loaders;
        this.gameVersions = gameVersions;
        this.dependencies = dependencies;
        this.files = files;
    }

    /**
     * Gets the primary file of this version.
     */
    public auto getPrimaryFile() {
        const VersionFile[] result = files.find!(f => f.primary);

        if (result.length == 0)
            throw new Exception("No primary file found for version " ~ id);

        return result[0];
    }
}
