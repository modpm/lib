// SPDX-License-Identifier: LGPL-3.0-or-later
/**
 * Represents an HTTP client for sending HTTP requests.
 *
 * @template T Error type.
 */
export abstract class HTTPClient<T extends Error> {
    /**
     * User agent string.
     */
    private readonly userAgent: string;

    /**
     * Authorisation credentials.
     */
    private readonly credentials: string | null;

    /**
     * Creates a new HTTP client.
     *
     * @param userAgent User agent string.
     * @param [credentials] Authorisation credentials.
     */
    protected constructor(userAgent: string, credentials?: string) {
        this.userAgent = userAgent;
        this.credentials = credentials ?? null;
    }

    /**
     * Returns a promise which is resolved after the specified number of milliseconds.
     *
     * @param delay Number of milliseconds to wait.
     */
    private static wait(delay: number): Promise<void> {
        return new Promise(resolve => globalThis.setTimeout(resolve, delay));
    }

    /**
     * Parses a string representing either a decimal integer or an HTTP date.
     *
     * @param value String to parse.
     * @returns Returns the number of seconds representing the difference relative to the current time, as represented
     *     by the input.
     */
    private static parseRelativeTime(value: string): number {
        if (/^\d+$/.test(value)) return Number.parseInt(value, 10);
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
    private static getTransientErrorRetryDelay(res: Response): number | null {
        if (res.headers.has("Retry-After")) return this.parseRelativeTime(res.headers.get("Retry-After")!);
        switch (res.status) {
            case 429: {
                const reset = res.headers.get("RateLimit-Reset") ?? res.headers.get("X-RateLimit-Reset");
                if (reset === null) return -1;
                return this.parseRelativeTime(reset);
            }
            case 408:
            case 503:
            case 504:
            case 507:
            case 522:
                return -1;
        }
        return null;
    }

    /**
     * Prepares request init options before sending.
     *
     * @param url Absolute URL.
     * @param [options] Request options.
     * @param [query] Query parameters.
     */
    protected prepareRequest(url: URL | string, options?: RequestInit, query?: URLSearchParams): Request {
        const u = new URL(url);
        if (query !== undefined)
            for (const [key, value] of query)
                u.searchParams.append(key, value);

        const init: RequestInit = options ?? {};
        init.headers = new Headers(init.headers);
        if (!init.headers.has("User-Agent"))
            init.headers.set("User-Agent", this.userAgent);
        if (this.credentials !== null && !init.headers.has("Authorization"))
            init.headers.set("Authorization", this.credentials);

        return new Request(u, init);
    }

    /**
     * Creates an error instance to throw when fetching fails.
     *
     * @param res HTTP error response.
     * @returns Error instance to throw in {@link fetch}.
     */
    protected abstract createError(res: Response): Promise<T>;

    /**
     * Sends an HTTP request.
     *
     * @param url Absolute URL.
     * @param [options] Request options.
     * @param [query] Query parameters.
     * @param [retries=3] Maximum number of retry attempts performed if the request fails.
     * @throws {@link T} If the request fails with a permanent error, allowed retries
     *     already exceeded, or delay is more than 30 seconds.
     * @throws {@link !TypeError} If the request fails due to a native fetch error, like a network error, DNS error,
     *     timeout, etc.
     * @final
     */
    protected async fetch(
        url: URL | string,
        options?: RequestInit,
        query?: URLSearchParams,
        retries?: number,
    ): Promise<Response>;

    /**
     * @final
     * @internal
     */
    protected async fetch(
        url: URL | string,
        options?: RequestInit,
        query?: URLSearchParams,
        retries?: number,
        remainingRetries?: number,
    ): Promise<Response>;

    protected async fetch(
        url: URL | string,
        options?: RequestInit,
        query?: URLSearchParams,
        retries = 3,
        remainingRetries = retries,
    ): Promise<Response> {
        const req = this.prepareRequest(url, options, query);
        const res = await fetch(req);
        if (res.ok) return res;

        if (remainingRetries <= 0) throw await this.createError(res);

        const retry = HTTPClient.getTransientErrorRetryDelay(res);
        if (retry === null) throw await this.createError(res);
        if (retry === 0) return this.fetch(url, options, query, retries, --remainingRetries);
        if (retry > 30) throw await this.createError(res);
        if (retry > 0) return HTTPClient.wait(retry * 1000)
            .then(() => this.fetch(url, options, query, retries, --remainingRetries));

        const exponentialBackoff = 2 ** (retries - remainingRetries);
        if (exponentialBackoff > 30) throw await this.createError(res);
        return HTTPClient.wait(exponentialBackoff * 1000)
            .then(() => this.fetch(url, options, query, retries, --remainingRetries));
    }
}
