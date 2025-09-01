module libmodpm.registry.SearchPackage;

import std.datetime;

import libmodpm.registry.Package;

/**
 * Represents a package returned in search results.
 */
public class SearchPackage : Package {
    /**
     * Author of package.
     */
    public const string author;

    /**
     * Categories displayed in search.
     */
    public const string[] categories;

    /**
     * Number of downloads.
     */
    public const uint downloads;

    /**
     * Number of follows.
     */
    public const uint follows;

    /**
     * Date of last update.
     */
    public const DateTime lastUpdated;

    /**
     * SPDX licence identifier.
     */
    public const string license;
    
    /**
     * Creates a new SearchPackage instance.
     * Params:
     *   id = Unique ID of package.
     *   slug = Slug of package.
     *   name = Name of package.
     *   description = Description of package.
     *   author = Author of package.
     *   categories = Categories displayed in search.
     *   downloads = Number of downloads.
     *   follows = Number of follows.
     *   lastUpdated = Date of last update.
     *   license = SPDX licence identifier.
     */
    public this(string id, string slug, string name, string description,
                string author, string[] categories, uint downloads, uint follows,
                DateTime lastUpdated, string license) {
        super(id, slug, name, description);
        this.author = author;
        this.categories = categories;
        this.downloads = downloads;
        this.follows = follows;
        this.lastUpdated = lastUpdated;
        this.license = license;
    }
}
