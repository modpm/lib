// SPDX-License-Identifier: GPL-3.0-or-later
import {TypedListener} from "./TypedListener.js";

/**
 * Represents an event target with statically-known event types.
 *
 * @template E Event types map.
 */
export class TypedEventTarget<E extends Record<string, Event>> {
    /**
     * Underlying event target.
     */
    private readonly target = new EventTarget();

    /**
     * Sets up an event listener.
     *
     * @param type Case-sensitive event type.
     * @param listener Event listener.
     * @param options Listener options.
     */
    public addEventListener<K extends Extract<keyof E, string>>(
        type: K,
        listener: TypedListener<E[K]>,
        options?: AddEventListenerOptions,
    ) {
        return this.target.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
    }

    /**
     * Sets up an event listener.
     *
     * @param type Case-sensitive event type.
     * @param listener Event listener.
     * @param options Listener options.
     */
    public on<K extends Extract<keyof E, string>>(
        type: K,
        listener: TypedListener<E[K]>,
        options?: AddEventListenerOptions,
    ) {
        return this.addEventListener(type, listener, options);
    }

    /**
     * Sets up an event listener that will be removed after the first invocation.
     *
     * @param type Case-sensitive event type.
     * @param listener Event listener.
     * @param options Listener options.
     */
    public once<K extends Extract<keyof E, string>>(
        type: K,
        listener: TypedListener<E[K]>,
        options?: AddEventListenerOptions,
    ) {
        return this.addEventListener(type, listener, {...options, once: true});
    }

    /**
     * Removes an event listener.
     *
     * @param type Case-sensitive event type.
     * @param listener Event listener.
     * @param options Listener options.
     */
    public removeEventListener<K extends Extract<keyof E, string>>(
        type: K,
        listener: TypedListener<E[K]>,
        options?: boolean | EventListenerOptions,
    ) {
        return this.target.removeEventListener(type.toString(), listener as EventListenerOrEventListenerObject,
            options);
    }

    /**
     * Removes an event listener.
     *
     * @param type Case-sensitive event type.
     * @param listener Event listener.
     * @param options Listener options.
     */
    public off<K extends Extract<keyof E, string>>(
        type: K,
        listener: TypedListener<E[K]>,
        options?: boolean | EventListenerOptions,
    ) {
        return this.removeEventListener(type, listener, options);
    }

    /**
     * Dispatches an event.
     *
     * @param event Event to dispatch.
     */
    public dispatchEvent(event: E[keyof E]) {
        return this.target.dispatchEvent(event);
    }

    /**
     * Dispatches an event.
     *
     * @param event Event to dispatch.
     */
    public emit(event: E[keyof E]) {
        return this.dispatchEvent(event);
    }
}
