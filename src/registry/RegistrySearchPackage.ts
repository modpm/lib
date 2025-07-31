// SPDX-License-Identifier: GPL-3.0-or-later
/**
 * Represents a package from registry search results.
 */
export interface RegistrySearchPackage {
    /**
     * Unique ID of the package.
     */
    project_id: string;

    /**
     * Slug of the package.
     */
    slug: string;

    /**
     * Name of project author.
     */
    author: string;

    /**
     * Title of the project.
     */
    title: string;

    /**
     * Description of the project.
     */
    description: string;

    /**
     * Categories displayed in search results.
     */
    display_categories: string[],

    /**
     * Number of downloads.
     */
    downloads: number;

    /**
     * Number of follows.
     */
    follows: number;

    /**
     * Date of last update.
     */
    date_modified: Date;

    /**
     * SPDX licence identifier.
     */
    license: string;

    /**
     * Colour derived from the package image/icon.
     */
    color: number;
}
