import {RegistryPackage} from "./RegistryPackage.js";
import {RegistryReleaseChannel} from "./RegistryReleaseChannel.js";
import {RegistryVersion} from "./RegistryVersion.js";

/**
 * Provides methods for interacting with the registry via its HTTP API.
 */
export class RegistryClient {
    /**
     * Represents an error returned by the registry API.
     */
    static RegistryError = class RegistryError extends Error {
        /**
         * Error code.
         */
        public readonly code?: string;

        /**
         * @param description Error description.
         * @param [code] Error code.
         */
        public constructor(description: string, code?: string) {
            super(description);
            this.code = code;
        }

        /**
         * Creates a registry error from a response.
         *
         * @param res Response to parse.
         */
        public static async fromResponse(res: Response): Promise<RegistryError> {
            if (
                res.headers.get("Content-Type")?.startsWith("application/json")
                && res.headers.has("Content-Length")
            ) {
                const text = await res.text();
                if (text.length > 0) {
                    const json: {error: string, description: string} = JSON.parse(text);
                    return new RegistryError(json.description, json.error);
                }
            }
            return new RegistryError(res.status.toString());
        }
    };

    /**
     * User agent string used when making requests to the registry.
     *
     * @see https://docs.modrinth.com/api/#user-agents
     */
    public readonly userAgent: string;
    /**
     * API authentication token. Requires the following scopes:
     *  - `PROJECT_READ`
     *  - `VERSION_READ`
     *
     * Authentication is only needed for accessing private/draft packages and their versions.
     */
    private readonly token: string | null;
    /**
     * API base URL. Must end with a slash.
     */
    private readonly baseUrl: URL;

    /**
     * Creates a new registry client.
     *
     * @param userAgent User agent string used when making requests to the registry.
     * @param [token] API authentication token.
     * @param [baseUrl=new URL("https://api.modrinth.com/v2/")] API base URL. Must end with a slash.
     */
    public constructor(userAgent: string, token?: string, baseUrl = new URL("https://api.modrinth.com/v2/")) {
        this.userAgent = userAgent;
        this.token = token ?? null;
        this.baseUrl = baseUrl;
    }

    /**
     * Retrieves the package associated with the specified ID.
     *
     * @param id Package ID.
     */
    public async getPackage(id: string): Promise<RegistryPackage | null> {
        try {
            return await (await this.fetch(["project", id])).json();
        }
        catch (err) {
            if (err instanceof RegistryClient.RegistryError && err.message === "404")
                return null;
            throw err;
        }
    }

    /**
     * Retrieves the packages associated with the specified IDs.
     *
     * @param ids Package IDs.
     */
    public async getPackages(ids: string[]): Promise<RegistryPackage[]> {
        return (await this.fetch("projects", {}, new URLSearchParams({
            ids: JSON.stringify(ids),
        }))).json();
    }

    /**
     * Retrieves the ID of the package associated with the specified slug.
     *
     * This method returns the ID even for private/draft packages, without requiring authentication.
     *
     * @param slug Package slug.
     */
    public async getPackageId(slug: string): Promise<string | null> {
        try {
            return (await (await this.fetch(["project", slug, "check"])).json()).id;
        }
        catch (err) {
            if (err instanceof RegistryClient.RegistryError && err.message === "404")
                return null;
            throw err;
        }
    }

    /**
     * Retrieves the version associated with the specified version ID.
     *
     * @param id Version ID.
     */
    public async getVersion(id: string): Promise<RegistryVersion | null> {
        try {
            return await (await this.fetch(["version", id])).json();
        }
        catch (err) {
            if (err instanceof RegistryClient.RegistryError && err.message === "404")
                return null;
            throw err;
        }
    }

    /**
     * Retrieves the versions associated with the specified version IDs.
     *
     * @param ids Version IDs.
     */
    public async getVersions(ids: string[]): Promise<RegistryVersion[]> {
        return (await this.fetch("versions", {}, new URLSearchParams({
            ids: JSON.stringify(ids),
        }))).json();
    }

    /**
     * Retrieves the version associated with the specified package and version number or ID.
     *
     * @param pkg Package ID.
     * @param version Version number or ID.
     */
    public async getVersionByNumber(pkg: string, version: string): Promise<RegistryVersion | null> {
        try {
            return await (await this.fetch(["project", pkg, "version", version])).json();
        }
        catch (err) {
            if (err instanceof RegistryClient.RegistryError && err.message === "404")
                return null;
            throw err;
        }
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
     */
    public async listVersions(
        pkg: string,
        filters: {
            loaders?: string[];
            game_versions?: string[];
            version_type?: RegistryReleaseChannel;
        } = {}
    ): Promise<RegistryVersion[]> {
        const params = new URLSearchParams();
        if (filters.loaders !== undefined)
            params.append("loaders", JSON.stringify(filters.loaders));
        if (filters.game_versions !== undefined)
            params.append("game_versions", JSON.stringify(filters.game_versions));
        if (filters.version_type !== undefined)
            params.append("version_type", JSON.stringify(filters.version_type));

        return (await this.fetch(`project/${project}/versions`, {}, params)).json();
    }

    /**
     * Retrieves the version associated with the specified file hash.
     *
     * @param hash SHA-512 hash of the file, encoded as a hex string.
     */
    public async getVersionByHash(hash: string): Promise<RegistryVersion | null> {
        try {
            return await (await this.fetch(["version_file", hash], {}, new URLSearchParams({
                algorithm: "sha512",
            }))).json();
        }
        catch (err) {
            if (err instanceof RegistryClient.RegistryError && err.message === "404")
                return null;
            throw err;
        }
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
     */
    public async getLatestVersions(hashes: string[], filters: {
        loaders?: string[];
        game_versions?: string[];
        version_type?: RegistryReleaseChannel;
    } = {}): Promise<Record<string, RegistryVersion>> {

        return await (await this.fetch("version_files/update", {
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
        })).json();
    }

    /**
     * Retrieves all loaders supported by the registry.
     */
    public async getLoaders(): Promise<string[]> {
        return (await (await this.fetch("tags/loaders")).json())
            .map((l: {name: string}) => l.name);
    }

    /**
     * Returns a promise which is resolved after the specified number of milliseconds.
     *
     * @param delay Number of milliseconds to wait.
     */
    private delay(delay: number): Promise<void> {
        return new Promise(resolve => globalThis.setTimeout(resolve, delay));
    }

    /**
     * Parses a string representing either a decimal integer or an HTTP date.
     *
     * @param value String to parse.
     * @returns Returns the number of seconds representing the difference relative to the current time, as represented
     *     by the input.
     */
    private parseRelativeTime(value: string): number {
        if (/^\d+$/.test(value))
            return Number.parseInt(value, 10);
        return Math.ceil((new Date(value).getTime() - Date.now()) / 1000);
    }

    /**
     * Determines whether the specified response represents a transient error, and if so, how long to wait before
     * retrying the request.
     *
     * @param res Response to check.
     * @returns
     *  - a non-negative number specifying the delay in seconds before retrying,
     *  - `-1` to indicate the delay is unknown and that exponential backoff should be used,
     *  - or `null` if the response is not a transient error and should not be retried.
     */
    private getTransientErrorRetryDelay(res: Response): number | -1 | null {
        if (res.headers.has("Retry-After")) return this.parseRelativeTime(res.headers.get("Retry-After")!);
        switch (res.status) {
            case 429: {
                const reset = res.headers.get("RateLimit-Reset")
                    ?? res.headers.get("X-RateLimit-Reset");
                if (reset === null) return -1;
                return this.parseRelativeTime(reset);
            }
            case 503: {
                const retryAfter = res.headers.get("Retry-After");
                if (retryAfter === null) return -1;
                return this.parseRelativeTime(retryAfter);
            }
            case 408:
            case 504:
            case 507:
            case 522:
                return -1;
        }
        return null;
    }

    /**
     * Sends an HTTP request.
     *
     * @param path Relative path to the API endpoint.
     * @param [options] Request options.
     * @param [query] Query parameters.
     * @param [retries=4] Number of times to retry the request if it fails with a transient error.
     * @param [remainingRetries=retries] Internal: number of remaining iterations.
     * @throws {@link RegistryClient.RegistryError} If the request fails with a permanent error, allowed retries
     *     already exceeded, or delay is more than 30 seconds.
     */
    private async fetch(
        path: string | string[],
        options?: RequestInit,
        query?: URLSearchParams,
        retries = 4,
        remainingRetries = retries,
    ): Promise<Response> {
        const relative = Array.isArray(path) ? path.map(globalThis.encodeURIComponent).join("/") : path;
        const headers = new Headers(options?.headers);
        if (!headers.has("User-Agent")) headers.set("User-Agent", this.userAgent);
        if (!headers.has("Authorization") && this.token !== null) headers.set("Authorization", this.token);

        (options ??= {}).headers = headers;

        const url = new URL(relative, this.baseUrl);
        if (query !== undefined)
            for (const [key, value] of query)
                url.searchParams.append(key, value);
        const res = await fetch(url, options);
        if (res.ok)
            return res;

        if (retries <= 0)
            throw await RegistryClient.RegistryError.fromResponse(res);

        const retry = this.getTransientErrorRetryDelay(res);
        if (retry === null)
            throw await RegistryClient.RegistryError.fromResponse(res);
        if (retry === 0)
            return await this.fetch(path, options, query, retries, --remainingRetries);
        if (retry > 30)
            throw await RegistryClient.RegistryError.fromResponse(res);
        if (retry > 0) {
            await this.delay(retry * 1000);
            return await this.fetch(path, options, query, retries, --remainingRetries);
        }

        const exponentialBackoff = 2 ** (retries - remainingRetries);
        if (exponentialBackoff > 30)
            throw await RegistryClient.RegistryError.fromResponse(res);
        await this.delay(exponentialBackoff * 1000);
        return await this.fetch(path, options, query, retries, --remainingRetries);
    }
}
