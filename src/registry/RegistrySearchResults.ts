// SPDX-License-Identifier: GPL-3.0-or-later
import {RegistrySearchPackage} from "./RegistrySearchPackage.js";

export interface RegistrySearchResults {
    /**
     * List of results.
     */
    hits: RegistrySearchPackage[];

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
