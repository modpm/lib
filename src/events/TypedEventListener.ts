// SPDX-License-Identifier: GPL-3.0-or-later
export interface TypedEventListener<T extends Event> {
    (event: T): void;
}
