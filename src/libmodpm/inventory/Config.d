module libmodpm.inventory.Config;

/**
 * Represents the package manager configuration for a given scope.
 */
public final class Config {
    /**
     * Represents the possible types of packages that can be managed.
     */
    public static enum Type {
        /// Represents packages used with a mod loader like as Fabric, Forge, Quilt, etc.
        MOD = "mod",
        /// Represents packages used by servers like Bukkit, Spigot, Paper, BungeeCord, Velocity, etc.
        PLUGIN = "plugin",
        /// Represents packages containing texture files, used in the vanilla client.
        RESOURCE_PACK = "resourcepack",
        /// Represents packages containing shader files, used on the client with mods like Iris, OptiFine, etc.
        SHADER = "shader",
        /// Represents packages used on vanilla worlds and servers used to configure game features.
        DATA_PACK = "datapack",
    }

    /**
     * Represents the environment side of a managed scope.
     */
    public static enum Environment {
        /// Represents a client-side environment.
        CLIENT = "client",
        /// Represents a server-side environment.
        SERVER = "server",
    }

    /**
     * Represents a loader for packages.
     */
    public static enum Loader {
        BABRIC = "babric",
        BTA_BABRIC = "bta-babric",
        BUKKIT = "bukkit",
        BUNGEECORD = "bungeecord",
        CANVAS = "canvas",
        DATAPACK = "datapack",
        FABRIC = "fabric",
        FOLIA = "folia",
        FORGE = "forge",
        IRIS = "iris",
        JAVA_AGENT = "java-agent",
        LEGACY_FABRIC = "legacy-fabric",
        LITELOADER = "liteloader",
        MINECRAFT = "minecraft",
        MODLOADER = "modloader",
        NEOFORGE = "neoforge",
        NILLOADER = "nilloader",
        OPTIFINE = "optifine",
        ORNITHE = "ornithe",
        PAPER = "paper",
        PURPUR = "purpur",
        QUILT = "quilt",
        RIFT = "rift",
        SPIGOT = "spigot",
        SPONGE = "sponge",
        VANILLA = "vanilla",
        VELOCITY = "velocity",
        WATERFALL = "waterfall",
    }

    /**
     * Represents the supported loaders and environments for a package type. The type depends on context.
     */
    public static final class TypeCompatibility {
        /**
         * Supported loaders.
         */
        public Loader[] loaders;

        /**
         * Supported environments.
         */
        public Environment[] environments;

        private this(immutable Loader[] loaders, immutable Environment[] environments) immutable {
            this.loaders = loaders;
            this.environments = environments;
        }
    }

    /**
     * Map from package type to its supported loaders and environments.
     */
    public static immutable TypeCompatibility[Type] TYPE_COMPATIBILITY = [
        Type.MOD: new immutable(TypeCompatibility)([
            Loader.BABRIC,
            Loader.BTA_BABRIC,
            Loader.FABRIC,
            Loader.FORGE,
            Loader.JAVA_AGENT,
            Loader.LEGACY_FABRIC,
            Loader.LITELOADER,
            Loader.MODLOADER,
            Loader.NEOFORGE,
            Loader.NILLOADER,
            Loader.ORNITHE,
            Loader.QUILT,
            Loader.RIFT,
        ], [Environment.SERVER, Environment.CLIENT]),
        Type.PLUGIN: new immutable(TypeCompatibility)([
            Loader.BUKKIT,
            Loader.BUNGEECORD,
            Loader.FOLIA,
            Loader.PAPER,
            Loader.PURPUR,
            Loader.SPIGOT,
            Loader.SPONGE,
            Loader.VELOCITY,
            Loader.WATERFALL,
        ], [Environment.SERVER]),
        Type.RESOURCE_PACK: new immutable(TypeCompatibility)([
            Loader.MINECRAFT,
        ], [Environment.CLIENT]),
        Type.SHADER: new immutable(TypeCompatibility)([
            Loader.CANVAS,
            Loader.IRIS,
            Loader.OPTIFINE,
            Loader.VANILLA,
        ], [Environment.CLIENT]),
        Type.DATA_PACK: new immutable(TypeCompatibility)([
            Loader.DATAPACK,
        ], [Environment.SERVER])
    ];

    /**
     * Type of packages managed in this scope.
     */
    public immutable Type type;

    /**
     * Type of environment of this scope.
     */
    public immutable Environment environment;

    /**
     * Package loader used in this scope.
     */
    public immutable Loader loader;

    /**
     * Constructs a Config instance.
     *
     * Params:
     *   type = Type of packages managed in this scope.
     *   environment = Type of environment of this scope.
     *   loader = Package loader used in this scope.
     */
    public this(immutable Type type, immutable Environment environment, immutable Loader loader) immutable {
        this.type = type;
        this.environment = environment;
        this.loader = loader;
    }
}
