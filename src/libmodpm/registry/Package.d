module libmodpm.registry.Package;

/**
 * Represents a package that can be managed by the package manager.
 */
public class Package {
    /**
     * Unique ID of project.
     */
    public const string id;

    /**
     * Name of project.
     */
    public const string name;

    /**
     * Description of project.
     */
    public const string description;

    /**
     * Creates a new Package instance.
     *
     * Params:
     *   id = Unique ID of project.
     *   name = Name of project.
     *   description = Description of project.
     */
    public this(string id, string name, string description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}
