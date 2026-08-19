export class InsufficientCreditsError extends Error {
    constructor(message) {
        super(message);
        this.name = "InsufficientCreditsError";
    }
}
