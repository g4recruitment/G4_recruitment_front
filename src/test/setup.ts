import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

// Several tests drive the error paths on purpose, and lib/logger.ts prints the
// failure every time — which buries the real assertion output. Run with
// VITEST_VERBOSE=1 to see the app's console again while debugging.
beforeAll(() => {
    if (!process.env.VITEST_VERBOSE) {
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    }
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});
