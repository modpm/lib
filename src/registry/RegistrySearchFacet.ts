// SPDX-License-Identifier: GPL-3.0-or-later
export type RegistrySearchFacet =
    `project_type${":" | "=" | "!="}${"mod" | "modpack" | "resourcepack" | "shader" | "plugin" | "datapack"}`
    | `${"categories" | "versions" | "title" | "author" | "project_id" | "license"}${":" | "=" | "!="}${string}`
    | `${"follows" | "downloads" | "color" | "created_timestamp" | "modified_timestamp"}${":" | "=" | "!=" | ">=" | ">" | "<=" | "<"}${number}`;
