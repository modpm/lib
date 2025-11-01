module libmodpm.registry.ReleaseChannel;

/**
 * Represents a release channel for a package version.
 */
public final enum ReleaseChannel {
    /**
     * Stable release channel.
     */
    RELEASE,

    /**
     * Beta release channel.
     */
    BETA,

    /**
     * Alpha release channel.
     */
    ALPHA,
}
