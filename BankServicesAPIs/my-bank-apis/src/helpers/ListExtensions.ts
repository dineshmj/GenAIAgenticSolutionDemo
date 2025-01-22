export {};

declare global {
    interface Array<T> {
        isNullOrEmpty (): T | undefined;
    }
}

// Simulate extension method ".isNullOrEmpty ()" for a list.
Array.prototype.isNullOrEmpty = function () {
    return !this || this.length === 0;
}