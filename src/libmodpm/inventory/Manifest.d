module libmodpm.inventory.Manifest;

import std.format;
import std.json;

import libmodpm.inventory.InstalledPackage;
import libmodpm.registry.VersionedDependency;

/**
 * Represents the manifest of installed packages in a given scope.
 */
public final class Manifest {
    /**
     * Installed packages.
     */
     public immutable InstalledPackage[] packages;

    /**
     * Serialises this manifest into a JSON string.
     */
    public string toJSON() {
        JSONValue j = [
            "manifestVersion": 0
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
                    dependency["version"] = versioned.versionId;
                dependencies ~= dependency;
            }

            versionJSON.object["dependencies"] = dependencies;

            JSONValue file = [
                "hash": format("%(%02x%)", pkg.ver.file.hash),
                "url": pkg.ver.file.url,
                "name": pkg.ver.file.name,
            ];
            file["size"] = pkg.ver.file.size;

            versionJSON["file"] = file;

            packageJSON.object["version"] = versionJSON;

            packagesJSON ~= packageJSON;
        }

        j.object["packages"] = packagesJSON;
        return j.toJSON(pretty: true);
    }
}
