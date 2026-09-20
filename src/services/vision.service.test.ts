import { describe, it, expect, vi } from "vitest";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import { visionService } from "./vision.service";

vi.mock("@/lib/api", () => ({
    api: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}));

const apiPost = vi.mocked(api.post);

const httpError = (status: number, data: unknown = "boom") =>
    new AxiosError("request failed", "ERR_BAD_RESPONSE", undefined, undefined, {
        status,
        data,
        statusText: "",
        headers: {},
        config: {} as never,
    });

describe("visionService.analyzeImage", () => {
    it("maps the backend's snake_case answer to the UI shape", async () => {
        apiPost.mockResolvedValue({ data: { is_formal: true, labels: ["tie", "suit"] } });

        await expect(visionService.analyzeImage("data:image/jpeg;base64,xxx")).resolves.toEqual({
            isFormal: true,
            labels: ["tie", "suit"],
        });
        expect(apiPost).toHaveBeenCalledWith("/drivers/validate-photo", { image: "data:image/jpeg;base64,xxx" });
    });

    it("falls back to an empty label list", async () => {
        apiPost.mockResolvedValue({ data: { is_formal: false } });

        await expect(visionService.analyzeImage("x")).resolves.toEqual({ isFormal: false, labels: [] });
    });
});

describe("visionService error mapping", () => {
    // DocumentUploadField branches on these exact strings, so they are part of
    // the contract, not just a message.
    it("turns a 429 into RATE_LIMIT_EXCEEDED", async () => {
        apiPost.mockRejectedValue(httpError(429));

        await expect(visionService.analyzeImage("x")).rejects.toThrow("RATE_LIMIT_EXCEEDED");
    });

    it("turns a 413 into FILE_TOO_LARGE", async () => {
        apiPost.mockRejectedValue(httpError(413));

        await expect(visionService.analyzeImage("x")).rejects.toThrow("FILE_TOO_LARGE");
    });

    it("uses the server's message when it sends one", async () => {
        apiPost.mockRejectedValue(httpError(400, { message: "Document is unreadable" }));

        await expect(visionService.analyzeImage("x")).rejects.toThrow("Document is unreadable");
    });

    it("uses a plain-text error body as the message", async () => {
        apiPost.mockRejectedValue(httpError(400, "Invalid payload"));

        await expect(visionService.analyzeImage("x")).rejects.toThrow("Invalid payload");
    });

    it("falls back to a generic message for a bodyless failure", async () => {
        apiPost.mockRejectedValue(httpError(500, null));

        await expect(visionService.analyzeImage("x")).rejects.toThrow("Server error");
    });

    it("passes a non-axios failure through untouched", async () => {
        apiPost.mockRejectedValue(new Error("boom"));

        await expect(visionService.analyzeImage("x")).rejects.toThrow("boom");
    });
});

describe("visionService.validateDocument", () => {
    it("posts the document payload and returns the verdict", async () => {
        const verdict = { valid: false, extractedPlate: "ABC123", errorCode: "PLATE_MISMATCH", errorMessage: "no match" };
        apiPost.mockResolvedValue({ data: verdict });

        const req = {
            docType: "carRegistration" as const,
            file: "base64",
            mimeType: "image/jpeg",
            expectedName: "Ada Lovelace",
            expectedPlate: "XYZ789",
        };

        await expect(visionService.validateDocument(req)).resolves.toEqual(verdict);
        expect(apiPost).toHaveBeenCalledWith("/drivers/validate-document", req);
    });
});
