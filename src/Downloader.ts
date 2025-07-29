// SPDX-License-Identifier: LGPL-3.0-or-later
import {TypedEventTarget} from "./events/TypedEventTarget.js";
import {HTTPClient} from "./HTTPClient.js";

/**
 * Represents a file to be downloaded.
 *
 * @final
 */
abstract class Entry {
    /**
     * Direct download URL of the file.
     */
    public readonly url: URL;

    /**
     * SHA-512 hash of the file, encoded as a hex string.
     */
    public readonly hash: string;

    /**
     * File name of the file.
     */
    public readonly name: string;

    /**
     * Size of the file, in bytes.
     */
    public readonly size?: number;

    /**
     * Creates a new file entry.
     *
     * @param url Direct download URL of the file.
     * @param hash SHA-512 hash of the file, encoded as a hex string.
     * @param name File name of the file.
     * @param [size] Size of the file, in bytes.
     */
    protected constructor(url: URL, hash: string, name: string, size?: number) {
        this.url = url;
        this.hash = hash;
        this.name = name;
        this.size = size;
    }

    /**
     * Writes a buffer to the file in the specified directory.
     *
     * @param directory Directory to write the file to.
     * @param contents Contents of the file.
     */
    public abstract write(directory: string, contents: BufferSource): Promise<void>;

    /**
     * Returns a writable stream to the file in the specified directory.
     *
     * @param directory Directory to write the file to.
     */
    public abstract getStream(directory: string): Promise<WritableStream<BufferSource>>;

    /**
     * Checks if the file exists in the directory and has the correct hash.
     *
     * @param directory Directory to check.
     */
    public abstract exists(directory: string): Promise<boolean>;
}

/**
 * Represents a download error.
 *
 * @final
 */
class DownloadError extends Error {
    /**
     * Creates a new download error.
     *
     * @param message Error message.
     */
    public constructor(message: string) {
        super(message);
        this.name = new.target.name;
    }
}

/**
 * Downloads files from a list of URLs into a specified directory.
 *
 * @template T Error type.
 * @final
 */
export class Downloader extends HTTPClient<DownloadError> {
    public static readonly Entry = Entry;
    public static readonly DownloadError = DownloadError;

    /**
     * Downloader events.
     */
    public readonly events = new TypedEventTarget<{
        start: CustomEvent<Entry>;
        progress: CustomEvent<{entry: Entry, progress: number}>;
        end: CustomEvent<Entry>;
        downloadError: CustomEvent<{entry: Entry, error: DownloadError}>;
        hashError: CustomEvent<{entry: Entry}>;
    }>();

    /**
     * Internal events.
     */
    private readonly internalEvents = new TypedEventTarget<{
        workerFailed: CustomEvent<null>;
    }>();

    /**
     * Controller for aborting downloader workers.
     */
    private readonly abortController = new AbortController();

    /**
     * Files to download.
     */
    private readonly entries: Entry[];

    /**
     * Number of files to download in parallel.
     */
    private readonly concurrency: number;

    /**
     * Directory to download files into.
     */
    private readonly directory: string;

    /**
     * Download progress.
     */
    private readonly progress = new Map<string, number>();

    /**
     * Creates a new downloader.
     *
     * @param userAgent User agent string used when making requests.
     * @param entries Files to download.
     * @param concurrency Number of files to download in parallel.
     * @param directory Directory to download files into.
     */
    public constructor(userAgent: string, entries: Entry[], concurrency: number, directory: string) {
        super(userAgent);
        this.entries = entries;
        this.concurrency = concurrency;
        this.directory = directory;
    }

    /**
     * Aborts downloading.
     */
    public abort(): void {
        this.abortController.abort();
    }

    /**
     * Begins downloading the files.
     *
     * @returns `false` if downloading was interrupted and did not complete, `true` otherwise.
     */
    public async download(): Promise<boolean> {
        this.internalEvents.on("workerFailed", () => this.abort(), {once: true});
        const workers = Array.from({length: this.concurrency}, () => this.worker(this.abortController.signal));
        return (await Promise.all(workers)).every(Boolean);
    }

    /**
     * Retrieves file size and name by sending an HTTP HEAD request to the specified URL.
     *
     * @param url URL of the file.
     * @returns File size from the `Content-Length` header (or `null` if not present) and file name from the
     *     `Content-Disposition` header or the last URI path component.
     * @throws {@link DownloadError} If the request fails.
     * @throws {@link !TypeError} If fetching fails.
     */
    public async getSizeAndName(url: URL): Promise<{size: number | null, name: string}> {
        const res = await this.fetch(url, {method: "HEAD"});
        const size = res.headers.has("Content-Length")
                     ? Number.parseInt(res.headers.get("Content-Length")!)
                     : NaN;
        const name = res.headers.get("Content-Disposition")
                ?.match(/filename\*?=(?:UTF-8''|")?([^;"\r\n]*)/i)?.[1]
            ?? globalThis.encodeURIComponent(url.pathname.split("/").pop()!);

        return {
            size: Number.isInteger(size) ? size : null,
            name,
        };
    }

    protected override createError(res: Response) {
        return Promise.resolve(new DownloadError(`Status code: ${res.status} for ${res.url}`));
    }

    /**
     * Creates a new download worker.
     *
     * @param signal Abort signal for the worker.
     * @returns `false` if the worker terminated early due to error or abort, `true` otherwise.
     */
    private async worker(signal: AbortSignal): Promise<boolean> {
        while (true) {
            if (signal.aborted)
                break;
            const file = this.entries.shift();
            if (file === undefined)
                return true;

            this.events.dispatchEvent(new CustomEvent("start", {detail: file}));
            const res = await this.fetch(file.url, {signal}).catch((e: Error) => {
                if (e.name === "AbortError") {
                    this.entries.unshift(file);
                    return null;
                }
                else if (e instanceof DownloadError)
                    this.events.dispatchEvent(new CustomEvent("downloadError", {detail: {entry: file, error: e}}));
                else if (e.cause instanceof Error)
                    this.events.dispatchEvent(new CustomEvent("downloadError", {
                        detail: {entry: file, error: new DownloadError(e.cause.message)},
                    }));
                else
                    this.events.dispatchEvent(new CustomEvent("downloadError", {
                        detail: {entry: file, error: new DownloadError(e.message)},
                    }));
                return null;
            });
            if (res === null)
                break;
            this.progress.set(file.hash, 0);

            // likely empty
            if (res.body === null) {
                await file.write(this.directory, await res.arrayBuffer());
                this.events.dispatchEvent(new CustomEvent("progress", {detail: {entry: file, progress: 100}}));
            }

            else {
                const writeStream = await file.getStream(this.directory);

                // stream without progress
                if (file.size === undefined || file.size === 0) {
                    try {
                        await res.body.pipeTo(writeStream);
                    }
                    catch (e) {
                        break;
                    }
                    this.events.dispatchEvent(new CustomEvent("progress", {detail: {entry: file, progress: 100}}));
                }

                // stream with progress
                else try {
                    await res.body.pipeThrough(new TransformStream({
                        transform: (chunk, controller) => {
                            const downloaded = this.progress.get(file.hash)! + chunk.byteLength;
                            this.progress.set(file.hash, downloaded);
                            this.events.dispatchEvent(new CustomEvent("progress", {
                                detail: {entry: file, progress: downloaded / file.size! * 100},
                            }));
                            controller.enqueue(chunk);
                        },
                    })).pipeTo(writeStream);
                }
                catch (e) {
                    break;
                }
            }
            this.events.dispatchEvent(new CustomEvent("end", {detail: file}));
            if (!await file.exists(this.directory))
                this.events.dispatchEvent(new CustomEvent("hashError", {detail: {entry: file}}));
        }

        this.internalEvents.dispatchEvent(new CustomEvent("workerFailed"));
        return false;
    }
}
