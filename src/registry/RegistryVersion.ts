// SPDX-License-Identifier: LGPL-3.0-or-later
import {RegistryDependencyType} from "./RegistryDependencyType.js";
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
     * The dependencies of this version.
     *
     * If a dependency contains neither `version_id` nor `project_id`, it is an external unmanaged dependency.
     */
    dependencies: {
        /**
         * The ID of the dependency {@link RegistryVersion}.
         */
        version_id: string | null;

        /**
         * The ID of the dependency {@link RegistryPackage}.
         */
        project_id: string | null;

        /**
         * The file name of the dependency.
         */
        file_name: string;

        /**
         * The type of relationship between the package and the dependency.
         */
        dependency_type: RegistryDependencyType;
    }[];

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
