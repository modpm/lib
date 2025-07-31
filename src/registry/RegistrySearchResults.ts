// SPDX-License-Identifier: GPL-3.0-or-later
import {RegistryPackage} from "./RegistryPackage.js";

export interface RegistrySearchResults {
    /**
     * List of results.
     */
    hits: RegistryPackage[];

    /**
     * Number of results skipped.
     */
    offset: number;

    /**
     * Number of results returned.
     */
    limit: number;

    /**
     * Total number of results that match the query.
     */
    total_hits: number;
}
