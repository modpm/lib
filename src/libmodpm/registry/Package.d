module libmodpm.registry.Package;

/**
 * Represents a package that can be managed by the package manager.
 */
public class Package {
    /**
     * Unique ID of package.
     */
    public const string id;

    /**
     * Slug of package.
     */
    public const string slug;

    /**
     * Name of package.
     */
    public const string name;

    /**
     * Creates a new Package instance.
     *
     * Params:
     *   id = Unique ID of package.
     *   slug = Slug of package.
     *   name = Name of package.
     */
    public this(string id, string slug, string name) {
        this.id = id;
        this.slug = slug;
        this.name = name;
    }
}
