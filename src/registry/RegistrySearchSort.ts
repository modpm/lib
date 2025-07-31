// SPDX-License-Identifier: GPL-3.0-or-later
/**
 * Represents projects search sort index and direction.
 */
export const enum RegistrySearchSort {
    /**
     * Sort by search query relevance.
     */
    RELEVANCE = "relevance",

    /**
     * Sort by number of downloads, descending.
     */
    DOWNLOADS = "downloads",

    /**
     * Sort by number of follows, descending.
     */
    FOLLOWS = "follows",

    /**
     * Sort by recently published, descending.
     */
    NEWEST = "newest",

    /**
     * Sort by recently updated (new version submitted), descending.
     */
    UPDATED = "updated",
}
