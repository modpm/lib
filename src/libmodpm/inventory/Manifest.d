module libmodpm.inventory.Manifest;

import std.algorithm;
import std.array;
import std.conv;
import std.format;
import std.json;
import std.range;

import libmodpm.inventory.InstalledPackage;
import libmodpm.registry.Dependency;
import libmodpm.registry.Version;
import libmodpm.registry.VersionedDependency;

/**
 * Represents the manifest of installed packages in a given scope.
 */
public final class Manifest {
    /**
     * Manifest schema version.
     */
    public static const enum MANIFEST_VERSION = 0;

    /**
     * Installed packages.
     */
    public const(InstalledPackage[]) packages() const @property {
        return this._packages;
    }

    private InstalledPackage[] _packages;

    /**
     * Creates a new Manifest instance.
     *
     * Params:
     *     packages = Array of installed packages.
     */
    public this(InstalledPackage[] packages) {
        this._packages = packages;
    }

    /**
     * Serialises this manifest into a JSON string.
     */
    public string toJSON() {
        JSONValue j = [
            "manifestVersion": MANIFEST_VERSION
        ];

        JSONValue[] packagesJSON = [];

        foreach (pkg; packages) {
            JSONValue packageJSON = [
                "id": pkg.id,
                "slug": pkg.slug,
                "name": pkg.name,
                "path": pkg.path,
                "reason": pkg.reason,
            ];
            packageJSON.object["versionLocked"] = pkg.versionLocked;

            JSONValue versionJSON = [
                "id": pkg.ver.id,
                "number": pkg.ver.versionNumber,
            ];

            JSONValue[] dependencies = [];
            foreach (dep; pkg.ver.dependencies) {
                JSONValue dependency = [
                    "type": dep.type,
                    "package": dep.packageId,
                ];
                if (auto versioned = cast(VersionedDependency) dep)
                    dependency.object["version"] = versioned.versionId;
                dependencies ~= dependency;
            }

            versionJSON.object["dependencies"] = dependencies;

            JSONValue file = [
                "hash": format("%(%02x%)", pkg.ver.file.hash),
                "url": pkg.ver.file.url,
                "name": pkg.ver.file.name,
            ];
            file.object["size"] = pkg.ver.file.size;

            versionJSON.object["file"] = file;

            packageJSON.object["version"] = versionJSON;

            packagesJSON ~= packageJSON;
        }

        j.object["packages"] = packagesJSON;
        return j.toJSON(pretty: true);
    }

    /**
     * Deserialises a JSON string into a `Manifest` instance.
     *
     * Params:
     *   json = JSON string to deserialise.
     * Throws:
     *   Exception = If the manifest version is incompatible.
     *   JSONException = If the JSON is invalid.
     */
    public static Manifest fromJSON(string json) {
        JSONValue j = json.parseJSON();

        if (j["manifestVersion"].integer() != MANIFEST_VERSION)
            throw new Exception("Incompatible manifest version " ~ j["manifestVersion"].integer().stringof ~ ". "
                ~ "This version of libmodpm only recognizes version " ~ MANIFEST_VERSION ~ ".");

        InstalledPackage[] packages = [];

        foreach (pkg; j["packages"].array()) {
            auto ver = pkg["version"].object();
            auto file = ver["file"].object();

            Dependency[] deps = [];

            foreach (dep; ver["dependencies"].object()) {
                auto packageId = dep["package"].str();
                auto type = cast(Dependency.Type) dep["type"].str();
                if (("version" in j) !is null)
                    deps ~= new VersionedDependency(type, packageId, dep["version"].str());
                else deps ~= new Dependency(type, packageId);
            }

            packages ~= new InstalledPackage(
                pkg["id"].str(),
                pkg["slug"].str(),
                pkg["name"].str(),
                new Version(
                    ver["id"].str(),
                    pkg["id"].str(),
                    ver["number"].str(),
                    deps,
                    new Version.File(
                        file["hash"].str().chunks(2).map!(c => to!ubyte("0x" ~ c.array)).array.to!(ubyte[64]),
                        file["url"].str(),
                        file["name"].str(),
                        file["size"].get!size_t,
                    )
                ),
                pkg["path"].str(),
                cast(InstalledPackage.InstallationReason) pkg["reason"].str(),
                pkg["versionLocked"].boolean(),
            );
        }

        return new Manifest(packages);
    }
}
