// SPDX-License-Identifier: GPL-3.0-or-later
/**
 * Represents a package published on the registry.
 */
export interface RegistryPackage {
    /**
     * Unique ID of the package.
     */
    id: string;

    /**
     * Name of the package.
     */
    title: string;

    /**
     * Description of the package.
     */
    description: string;
}
