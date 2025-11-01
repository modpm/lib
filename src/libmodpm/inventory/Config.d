module libmodpm.inventory.Config;

import std.json;

import libmodpm.registry.ReleaseChannel;

/**
 * Represents the package manager configuration for a given scope.
 */
public final class Config {
    /**
     * Configuration schema version.
     */
    public static const enum CONFIG_VERSION = 0;

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
     * Game version supported by the loader in this scope.
     */
    public immutable string gameVersion;

    /**
     * Release channel specifying the minimum stability of versions chosen automatically in this scope.
     */
    public immutable ReleaseChannel minimumReleaseChannel;

    /**
     * Path to the directory in which packages will be installed. The path must be on the same filesystem as the modpm
     * scope. If the path is relative, it is resolved from the modpm scope path.
     */
    public immutable string path;

    /**
     * Constructs a Config instance.
     *
     * Params:
     *   type = Type of packages managed in this scope.
     *   environment = Type of environment of this scope.
     *   loader = Package loader used in this scope.
     *   gameVersion = Game version supported by the loader in this scope.
     *   minimumReleaseChannel = Release channel specifying the minimum stability of versions chosen automatically in
     *                           this scope.
     *   path = Path to the directory in which packages will be installed.
     */
    public this(
        immutable Type type, immutable Environment environment, immutable Loader loader, immutable string gameVersion,
        immutable ReleaseChannel minimumReleaseChannel, immutable string path
    ) immutable {
        this.type = type;
        this.environment = environment;
        this.loader = loader;
        this.gameVersion = gameVersion;
        this.minimumReleaseChannel = minimumReleaseChannel;
        this.path = path;
    }

    /**
     * Serialises this config into a JSON string.
     */
    public string toJSON() immutable {
        JSONValue j = ["configVersion": CONFIG_VERSION];
        j.object["type"] = JSONValue(type);
        j.object["environment"] = JSONValue(environment);
        j.object["loader"] = JSONValue(loader);
        j.object["gameVersion"] = JSONValue(gameVersion);

        final switch (minimumReleaseChannel) {
            case ReleaseChannel.RELEASE:
                j.object["releaseChannel"] = JSONValue("release");
                break;
            case ReleaseChannel.BETA:
                j.object["releaseChannel"] = JSONValue("beta");
                break;
            case ReleaseChannel.ALPHA:
                j.object["releaseChannel"] = JSONValue("alpha");
                break;
        }
        j.object["path"] = JSONValue(path);

        return j.toJSON(pretty: true);
    }

    /**
     * Deserialises a JSON string into a `Config` instance.
     *
     * Params:
     *   json = JSON string to deserialise.
     * Throws:
     *   Exception = If the config version is incompatible.
     *   JSONException = If the JSON is invalid.
     */
    public static immutable(Config) fromJSON(string json) {
        JSONValue j = json.parseJSON();

        if (j["configVersion"].integer() != CONFIG_VERSION)
            throw new Exception("Incompatible config version " ~ j["configVersion"].integer().stringof ~ ". "
                ~ "This version of libmodpm only recognizes version " ~ CONFIG_VERSION ~ ".");

        string releaseChannel = j["releaseChannel"].str();
        ReleaseChannel rc;

        switch (releaseChannel) {
            case "release":
                rc = ReleaseChannel.RELEASE;
                break;
            case "beta":
                rc = ReleaseChannel.BETA;
                break;
            case "alpha":
                rc = ReleaseChannel.ALPHA;
                break;
            default: assert(0);
        }

        return new immutable(Config)(
            cast(Type) j["type"].str(),
            cast(Environment) j["environment"].str(),
            cast(Loader) j["loader"].str(),
            j["gameVersion"].str(),
            rc,
            j["path"].str(),
        );
    }
}
