// SPDX-License-Identifier: GPL-3.0-or-later
import {HTTPClient} from "../HTTPClient.js";
import {RegistryPackage} from "./RegistryPackage.js";
import {RegistryReleaseChannel} from "./RegistryReleaseChannel.js";
import {RegistrySearchFacet} from "./RegistrySearchFacet.js";
import {RegistrySearchResults} from "./RegistrySearchResults.js";
import {RegistrySearchSort} from "./RegistrySearchSort.js";
import {RegistryVersion} from "./RegistryVersion.js";

/**
 * Represents an error returned by the registry API.
 *
 * @final
 */
class RegistryError extends Error {
    /**
     * Error code.
     */
    public readonly code?: string;

    /**
     * Creates a new registry error.
     *
     * @param description Error description.
     * @param [code] Error code.
     */
    public constructor(description: string, code?: string) {
        super(description);
        this.name = new.target.name;
        this.code = code;
    }
}

/**
 * Provides methods for interacting with the registry via its HTTP API.
 *
 * @final
 */
export class RegistryClient extends HTTPClient<RegistryError> {
    public static readonly RegistryError = RegistryError;

    /**
     * Base URL for HTTP requests.
     */
    private readonly baseUrl: URL;

    /**
     * Creates a new registry client.
     *
     * @param userAgent User agent string used when making requests to the registry.
     * @param [token] API authentication token.
     * @param [baseUrl=new URL("https://api.modrinth.com/v2/")] API authentication token. Requires the following scopes:
     *  - `PROJECT_READ`
     *  - `VERSION_READ`
     *
     * Authentication is only needed for accessing private/draft packages and their versions.
     */
    public constructor(userAgent: string, token?: string, baseUrl = new URL("https://api.modrinth.com/v2/")) {
        super(userAgent, token);
        this.baseUrl = baseUrl;
    }

    /**
     * Catches 404 errors and returns null.
     *
     * @param error Error to try to catch.
     * @returns `null` if the error is a 404 error.
     * @throws {@link RegistryClient.RegistryError} If the error is not a 404 error.
     */
    public static catch404(error: Error): null {
        if (error instanceof RegistryClient.RegistryError && error.message === "404")
            return null;
        throw error;
    }

    /**
     * Retrieves the package associated with the specified ID.
     *
     * @param id Package ID.
     * @returns `null` if the package is not found.
     * @throws {@link RegistryClient.RegistryError} If the request fails.
     * @throws {@link !TypeError} If fetching fails.
     */
    public async getPackage(id: string): Promise<RegistryPackage | null> {
        return this.fetch(["project", id])
            .then(res => res.json())
            .catch(RegistryClient.catch404);
    }

    /**
     * Retrieves the ID of the package associated with the specified slug.
     *
     * This method returns the ID even for private/draft packages, without requiring authentication.
     *
     * @param slug Package slug.
     * @returns `null` if the package is not found.
     * @throws {@link RegistryClient.RegistryError} If the request fails.
     * @throws {@link !TypeError} If fetching fails.
     */
    public async getPackageId(slug: string): Promise<string | null> {
        return this.fetch(["project", slug, "check"])
            .then(res => res.json())
            .then(json => json.id)
            .catch(RegistryClient.catch404);
    }

    /**
     * Retrieves packages matching the specified search query and facet filters.
     *
     * @param [query] Search query.
     * @param [facets] Facets to filter by.
     * @param [sort] Sort order.
     * @param [offset] Offset into the search.
     * @param [limit] Maximum number of results to return.
     *
     * @see https://docs.modrinth.com/api/operations/searchprojects/ Search projects | Modrinth Documentation
     */
    public async search(
        query?: string,
        facets?: RegistrySearchFacet[][][] | RegistrySearchFacet[][],
        sort?: RegistrySearchSort,
        offset?: number,
        limit: number = 20,
    ): Promise<RegistrySearchResults> {
        const queryParams = new URLSearchParams();
        if (query !== undefined) queryParams.set("query", query);
        if (facets !== undefined) queryParams.set("facets", JSON.stringify(facets));
        if (sort !== undefined) queryParams.set("sort", sort);
        if (offset !== undefined) queryParams.set("offset", offset.toString());
        queryParams.set("limit", limit.toString());
        const body = await this.fetch(["search"], {}, queryParams).then(res => res.text());
        return JSON.parse(body, (_, value) => {
            if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value))
                return new Date(value);
            return value;
        });
    }

    /**
     * Retrieves the version associated with the specified version ID.
     *
     * @param id Version ID.
     * @returns `null` if the version is not found.
     * @throws {@link RegistryClient.RegistryError} If the request fails.
     * @throws {@link !TypeError} If fetching fails.
     */
    public async getVersion(id: string): Promise<RegistryVersion | null> {
        return this.fetch(["version", id])
            .then(res => res.json())
            .catch(RegistryClient.catch404);
    }

    /**
     * Retrieves the versions associated with the specified package.
     *
     * Filters:
     *  - `loaders` — restricts versions to those compatible with the specified loaders.
     *  - `game_versions` — restricts versions to those compatible with the specified game versions.
     *  - `version_type` — restricts versions to those of the specified type (release channel).
     *
     * @param pkg Package ID.
     * @param [filters] Filters to apply.
     * @returns List of matching versions, sorted in descending order, with the latest version first.
     * @throws {@link RegistryClient.RegistryError} If the request fails.
     * @throws {@link !TypeError} If fetching fails.
     */
    public async listVersions(
        pkg: string,
        filters: {
            loaders?: string[];
            game_versions?: string[];
            version_type?: RegistryReleaseChannel;
        } = {}
    ): Promise<RegistryVersion[] | null> {
        const params = new URLSearchParams();
        if (filters.loaders !== undefined)
            params.append("loaders", JSON.stringify(filters.loaders));
        if (filters.game_versions !== undefined)
            params.append("game_versions", JSON.stringify(filters.game_versions));
        if (filters.version_type !== undefined)
            params.append("version_type", JSON.stringify(filters.version_type));

        return this.fetch(["project", pkg, "version"], {}, params)
            .then(res => res.json())
            .catch(RegistryClient.catch404);
    }

    /**
     * Retrieves the packages associated with the specified IDs.
     *
     * @param ids Package IDs.
     * @throws {@link RegistryClient.RegistryError} If the request fails.
     * @throws {@link !TypeError} If fetching fails.
     */
    public async getPackages(ids: string[]): Promise<RegistryPackage[]> {
        return this.fetch(["projects"], {}, new URLSearchParams({
            ids: JSON.stringify(ids),
        })).then(res => res.json());
    }

    /**
     * Retrieves the version associated with the specified file hash.
     *
     * @param hash SHA-512 hash of the file, encoded as a hex string.
     * @returns `null` if the version is not found.
     * @throws {@link RegistryClient.RegistryError} If the request fails.
     * @throws {@link !TypeError} If fetching fails.
     */
    public async getVersionByHash(hash: string): Promise<RegistryVersion | null> {
        return this.fetch(["version_file", hash], {}, new URLSearchParams({
            algorithm: "sha512",
        }))
            .then(res => res.json())
            .catch(RegistryClient.catch404);
    }

    /**
     * Retrieves the versions associated with the specified version IDs.
     *
     * @param ids Version IDs.
     * @throws {@link RegistryClient.RegistryError} If the request fails.
     * @throws {@link !TypeError} If fetching fails.
     */
    public async getVersions(ids: string[]): Promise<RegistryVersion[]> {
        return this.fetch(["versions"], {}, new URLSearchParams({
            ids: JSON.stringify(ids),
        })).then(res => res.json());
    }

    /**
     * Retrieves the version associated with the specified package and version number or ID.
     *
     * @param pkg Package ID.
     * @param version Version number or ID.
     * @returns `null` if the package or version is not found.
     * @throws {@link RegistryClient.RegistryError} If the request fails.
     * @throws {@link !TypeError} If fetching fails.
     */
    public async getVersionByNumber(pkg: string, version: string): Promise<RegistryVersion | null> {
        return this.fetch(["project", pkg, "version", version])
            .then(res => res.json())
            .catch(err => {
                if (err instanceof RegistryClient.RegistryError && err.message === "404")
                    return null;
                throw err;
            });
    }

    /**
     * Retrieves the latest versions associated with the specified hashes.
     *
     * Filters:
     *   - `loaders` — restricts versions to those compatible with the specified loaders.
     *   - `game_versions` — restricts versions to those compatible with the specified game versions.
     *   - `version_type` — restricts versions to those of the specified type (release channel).
     *
     * @param hashes SHA-512 hashes of the files, encoded as a hex strings.
     * @param [filters] Filters to apply.
     * @throws {@link RegistryClient.RegistryError} If the request fails.
     * @throws {@link !TypeError} If fetching fails.
     */
    public async getLatestVersions(hashes: string[], filters: {
        loaders?: string[];
        game_versions?: string[];
        version_type?: RegistryReleaseChannel;
    } = {}): Promise<Record<string, RegistryVersion>> {
        return this.fetch("version_files/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                hashes,
                algorithm: "sha512",
                loaders: filters.loaders,
                game_versions: filters.game_versions,
                version_type: filters.version_type,
            }),
        }).then(res => res.json());
    }

    /**
     * Retrieves all loaders supported by the registry.
     *
     * @throws {@link RegistryClient.RegistryError} If the request fails.
     * @throws {@link !TypeError} If fetching fails.
     */
    public async getLoaders(): Promise<string[]> {
        return this.fetch("tags/loaders")
            .then(res => res.json())
            .then((json: any[]) => json.map((l: {name: string}) => l.name));
    }

    public override async createError(res: Response): Promise<RegistryError> {
        if (
            (res.headers.get("Content-Type")?.startsWith("application/json") ?? false)
            && res.body !== null
        ) {
            const {description, error} = await res.json() as {error: string, description: string};
            return new RegistryError(description, error);
        }
        return new RegistryError(res.status.toString());
    }

    /**
     * Sends an HTTP request.
     *
     * @param path Relative path to the API endpoint.
     * @param [options] Request options.
     * @param [query] Query parameters.
     * @param [retries=3] Maximum number of retry attempts performed if the request fails.
     * @throws {@link RegistryClient.RegistryError} If the request fails with a permanent error, allowed retries
     *     already exceeded, or delay is more than 30 seconds.
     * @throws {@link !TypeError} If the request fails due to a native fetch error, like a network error, DNS error,
     *     timeout, etc.
     * @final
     */
    protected override async fetch(
        path: string[],
        options?: RequestInit,
        query?: URLSearchParams,
        retries?: number,
    ): Promise<Response>;

    /**
     * Sends an HTTP request.
     *
     * @param url Absolute URL.
     * @param [options] Request options.
     * @param [query] Query parameters.
     * @param [retries=3] Maximum number of retry attempts performed if the request fails.
     * @throws {@link RegistryClient.RegistryError} If the request fails with a permanent error, allowed retries
     *     already exceeded, or delay is more than 30 seconds.
     * @throws {@link !TypeError} If the request fails due to a native fetch error, like a network error, DNS error,
     *     timeout, etc.
     * @final
     */
    protected override async fetch(
        url: URL | string,
        options?: RequestInit,
        query?: URLSearchParams,
        retries?: number,
    ): Promise<Response>;

    // only adding an overload… sorry @final 😔
    protected override async fetch(
        url: URL | string | string[],
        options?: RequestInit,
        query?: URLSearchParams,
        retries = 3,
        remainingRetries = retries,
    ): Promise<Response> {
        if (Array.isArray(url))
            return super.fetch(
                new URL(url.map(globalThis.encodeURIComponent).join("/"), this.baseUrl),
                options,
                query,
                remainingRetries,
            );
        return super.fetch(url, options, query, remainingRetries);
    }
}
