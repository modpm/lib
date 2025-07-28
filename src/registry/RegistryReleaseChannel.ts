// SPDX-License-Identifier: LGPL-3.0-or-later
/**
 * Represents the release channel of a {@link RegistryVersion}.
 */
export const enum RegistryReleaseChannel {
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
