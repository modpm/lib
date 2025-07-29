// SPDX-License-Identifier: GPL-3.0-or-later
import {TypedEventListener} from "./TypedEventListener.js";
import {TypedEventListenerObject} from "./TypedEventListenerObject.js";

export type TypedListener<T extends Event> = TypedEventListener<T> | TypedEventListenerObject<T>;
