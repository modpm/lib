import {RegistryReleaseChannel} from "./RegistryReleaseChannel.js";

/**
 * Represents a version of a {@link RegistryPackage} published on the registry.
 */
export interface RegistryVersion {
    /**
     * Unique ID of the version.
     */
    id: string;

    /**
     * ID of the package this version belongs to.
     */
    project_id: string;

    /**
     * Version number.
     */
    version_number: string;

    /**
     * Type of the version.
     */
    version_type: RegistryReleaseChannel;

    /**
     * The files contained in this version.
     */
    files: {
        /**
         * Hashes of the file.
         */
        hashes: {
            /**
             * SHA-512 hash of the file, encoded as a hex string.
             */
            sha512: string;
        };

        /**
         * Direct download URL.
         */
        url: string;

        /**
         * Name of the file.
         */
        filename: string;

        /**
         * Whether this is the primary file of the version.
         */
        primary: boolean;

        /**
         * Byte length of the file.
         */
        size: number;
    }[];
}
