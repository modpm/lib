module libmodpm.registry.ReleaseChannel;

/**
 * Represents a release channel for a package version.
 */
public final enum ReleaseChannel {
    /**
     * Stable release channel.
     */
    RELEASE = "release",

    /**
     * Beta release channel.
     */
    BETA = "beta",

    /**
     * Alpha release channel.
     */
    ALPHA = "alpha",
}
