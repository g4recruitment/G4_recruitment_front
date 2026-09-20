/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Kept separate from vite.config.ts so the dev/build config stays free of the
// test runner (and of lovable-tagger, which has no business inside tests).
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { "@": path.resolve(__dirname, "./src") },
    },
    test: {
        environment: "jsdom",
        // lib/supabase.ts throws at import time without these, and .env is gitignored
        // (so CI would have nothing to read).
        env: {
            VITE_SUPABASE_URL: "https://test.supabase.co",
            VITE_SUPABASE_ANON_KEY: "test-anon-key",
            VITE_API_URL: "https://api.test",
        },
        globals: true,
        setupFiles: ["./src/test/setup.ts"],
        include: ["src/**/*.{test,spec}.{ts,tsx}"],
        css: false,
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            // Only our own code: shadcn's generated primitives and pure layout
            // pages would inflate the numbers without telling us anything.
            include: ["src/lib/**", "src/services/**", "src/components/*.tsx"],
        },
    },
});
