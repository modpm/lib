import {describe, expect, it} from "vitest";
import {name, version} from "../package.json";
import {RegistryClient, RegistryReleaseChannel, RegistrySearchSort} from "../src";

declare const process: {
    env: {
        MODRINTH_TOKEN: string;
    };
};

const client = new RegistryClient(`${name}/${version} (tests)`);

function randomId() {
    return crypto.randomUUID().split("-")[0]!;
}

describe("RegistryClient", () => {
    describe("getPackage", async () => {
        it("retrieves a package by ID", async () => {
            const pkg = await client.getPackage("Dc8RS2En");
            expect(pkg).not.toBeNull();
            expect(pkg?.id).toBe("Dc8RS2En");
        });

        it("retrieves a package by slug", async () => {
            const pkg = await client.getPackage("bankaccounts");
            expect(pkg).not.toBeNull();
            expect(pkg?.id).toBe("Dc8RS2En");
        });

        it("returns null for a non-existent package", async () => {
            const pkg = await client.getPackage(randomId());
            expect(pkg).toBeNull();
        });

        it("returns null for package slug with a slash", async () => {
            const pkg = await client.getPackage("foo/bar");
            expect(pkg).toBeNull();
        });
    });

    describe("getPackages", async () => {
        it("retrieves multiple packages by IDs", async () => {
            const packages = await client.getPackages(["bankaccounts", "dMOPYb3s", randomId()]);
            expect(packages.length).toBe(2);
            expect(packages.map(pkg => pkg.id).sort((a, b) => a.localeCompare(b)))
                .toEqual(["Dc8RS2En", "dMOPYb3s"].sort((a, b) => a.localeCompare(b)));
        });

        it("returns empty array if no packages found", async () => {
            const packages = await client.getPackages([randomId(), randomId()]);
            expect(packages.length).toBe(0);
        });
    });

    describe("getPackageId", async () => {
        it("retrieves the ID of a public package", async () => {
            const id = await client.getPackageId("bankaccounts");
            expect(id).toBe("Dc8RS2En");
        });

        it("retrieves the ID of a private package", async () => {
            const id = await client.getPackageId("modpm-priv");
            expect(id).toBe("XvJJcQVO");
        });

        it("returns null for a non-existent package", async () => {
            const id = await client.getPackageId(randomId());
            expect(id).toBeNull();
        });
    });

    describe("search", async () => {
        it("searches for a specific package with facets", async () => {
            const results = await client.search(
                "bank",
                [["categories:economy"], ["categories:utility"], ["categories:paper"], ["categories!=spigot"], ["versions:1.21.7", "versions:1.21.8"]],
                RegistrySearchSort.FOLLOWS,
                0,
                5,
            );
            expect(results.total_hits).toBeGreaterThan(0);
            const bank = results.hits.find(pkg => pkg.project_id === "Dc8RS2En")!;
            expect(bank).not.toBeUndefined();
        });
    });

    describe("getVersion", async () => {
        it("retrieves a version by ID", async () => {
            const version = await client.getVersion("WU2qJU7t");
            expect(version).not.toBeNull();
            expect(version!.id).toBe("WU2qJU7t");
            expect(version!.project_id).toBeTypeOf("string");
            expect(version!.version_number).toBeTypeOf("string");
            expect(version!.version_type).toBeOneOf([RegistryReleaseChannel.ALPHA, RegistryReleaseChannel.BETA, RegistryReleaseChannel.RELEASE]);
            version!.files.forEach(file => {
                expect(file.hashes.sha512).toBeTypeOf("string");
                expect(file.url).toBeTypeOf("string");
                expect(file.filename).toBeTypeOf("string");
                expect(file.primary).toBeTypeOf("boolean");
                expect(file.size).toBeTypeOf("number");
            });
        });

        it("returns null for a non-existent version", async () => {
            const version = await client.getVersion(randomId());
            expect(version).toBeNull();
        });
    });

    describe("getVersions", async () => {
        it("retrieves multiple versions by IDs", async () => {
            const versions = await client.getVersions(["WU2qJU7t", randomId()]);
            expect(versions.length).toBe(1);
            expect(versions[0]!.id).toBe("WU2qJU7t");
        });

        it("returns empty array if no versions found", async () => {
            const versions = await client.getVersions([randomId(), randomId()]);
            expect(versions.length).toBe(0);
        });
    });

    describe("getVersionByNumber", async () => {
        it("retrieves a version by package and version number", async () => {
            const version = await client.getVersionByNumber("Dc8RS2En", "1.11.1");
            expect(version).not.toBeNull();
            expect(version!.id).toBe("WU2qJU7t");
        });

        it("returns null for a non-existent project", async () => {
            const version = await client.getVersionByNumber(randomId(), "1.0.0");
            expect(version).toBeNull();
        });

        it("returns null for a non-existent version", async () => {
            const version = await client.getVersionByNumber("Dc8RS2En", randomId());
            expect(version).toBeNull();
        });
    });

    describe("listVersions", async () => {
        it("retrieves versions associated with a project", async () => {
            const versions = await client.listVersions("Dc8RS2En");
            expect(versions).not.toBeNull();
            expect(versions!.length).toBeGreaterThan(0);
            expect(versions![0]!.id).toBeTypeOf("string");
            expect(versions![0]!.project_id).toBeTypeOf("string");
            expect(versions![0]!.version_number).toBeTypeOf("string");
        });

        it("returns null for a non-existent project", async () => {
            const versions = await client.listVersions(randomId());
            expect(versions).toBeNull();
        });
    });

    describe("getVersionByHash", async () => {
        it("retrieves a version by file hash", async () => {
            const hash = "96b7bc4d821609e8660bab0d775b640774fa99abab6efe6fbdfec3278c357dd36f21ee94e63a384620c84c125ae7d49f7bcb0ab735753c00e51ab6bb6f1e36d4";
            const version = await client.getVersionByHash(hash);
            expect(version).not.toBeNull();
            expect(version!.id).toBe("WU2qJU7t");
        });

        it("returns null for a non-existent hash", async () => {
            const version = await client.getVersionByHash(randomId());
            expect(version).toBeNull();
        });
    });
});
