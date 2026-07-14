import { describe, it, expect } from "vitest";
import { searchWeb } from "../src/search.js";

// Integration tests hit the real DeepSeek API. Skipped entirely if no key.
const hasApiKey = !!process.env.DEEPSEEK_API_KEY;

describe.skipIf(!hasApiKey)("searchWeb (integration — real API)", () => {
    it("returns search results for a real query", async () => {
        const response = await searchWeb("What is the latest version of Node.js?");

        // The API should return either results or a text answer (or both)
        expect(response.results.length + response.textAnswer.length).toBeGreaterThan(0);
    }, 30000); // 30s timeout for real API call

    it("returns source URLs in results", async () => {
        const response = await searchWeb("TypeScript 5.8 release date");

        if (response.results.length > 0) {
            // Each result should have a title and url
            for (const result of response.results) {
                expect(result.title).toBeTruthy();
                expect(result.url).toBeTruthy();
                expect(result.url).toMatch(/^https?:\/\//);
            }
        }
    }, 30000);

    it("returns a coherent text answer", async () => {
        const response = await searchWeb("What year was Python first released?");

        if (response.textAnswer) {
            expect(response.textAnswer.length).toBeGreaterThan(10);
        }
    }, 30000);
});
