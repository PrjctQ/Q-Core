import { defineConfig } from "vitest/config";
import viteTsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
    plugins: [viteTsConfigPaths()], // Handles ts path alias
    test: {
        environment: "node",
        include: ["**/*.test.{js,ts}"]
    }
})
