// SPDX-License-Identifier: GPL-3.0-or-later
import {TypedEventListener} from "./TypedEventListener.js";

export interface TypedEventListenerObject<T extends Event> {
    handleEvent: TypedEventListener<T>;
}
