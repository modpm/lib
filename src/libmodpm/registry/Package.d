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
     * Description of package.
     */
    public const string description;

    /**
     * Creates a new Package instance.
     *
     * Params:
     *   id = Unique ID of package.
     *   slug = Slug of package.
     *   name = Name of package.
     *   description = Description of package.
     */
    public this(string id, string slug, string name, string description) {
        this.id = id;
        this.slug = slug;
        this.name = name;
        this.description = description;
    }
}
