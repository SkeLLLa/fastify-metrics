import prettier from "eslint-plugin-prettier";
import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsdoc from "eslint-plugin-tsdoc";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import jest from "eslint-plugin-jest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        "**/logs/",
        "**/coverage/",
        "**/node_modules/",
        "**/.idea/",
        "**/.vscode/",
        "**/static/",
        "**/*.xxx.*",
        "**/dist/",
        "examples/**/*",
        "**/.eslintrc.js",
        "**/jest.config.js",
    ],
}, ...compat.extends(
    "eslint:recommended",
    "google",
    "prettier",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
), {
    plugins: {
        prettier,
        "@typescript-eslint": typescriptEslintEslintPlugin,
        tsdoc,
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...Object.fromEntries(Object.entries(globals.jest).map(([key]) => [key, "off"])),
        },

        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: "module",

        parserOptions: {
            project: "tsconfig.json",
        },
    },

    rules: {
        "new-cap": ["error", {
            capIsNewExceptions: ["ObjectId", "Fastify"],
        }],

        "require-jsdoc": "off",
        "valid-jsdoc": "off",
        "tsdoc/syntax": "error",
        "prettier/prettier": "error",
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
    },
}, {
    files: ["**/__tests__/**/*", "**/__mocks__/**/*"],

    plugins: {
        jest,
    },

    languageOptions: {
        globals: {
            ...jest.environments.globals.globals,
        },
    },

    rules: {
        "jest/expect-expect": "warn",
        "jest/no-alias-methods": "error",
        "jest/no-commented-out-tests": "warn",
        "jest/no-conditional-expect": "error",
        "jest/no-deprecated-functions": "error",
        "jest/no-disabled-tests": "warn",
        "jest/no-done-callback": "error",
        "jest/no-export": "error",
        "jest/no-focused-tests": "error",
        "jest/no-identical-title": "error",
        "jest/no-interpolation-in-snapshots": "error",
        "jest/no-jasmine-globals": "error",
        "jest/no-mocks-import": "error",
        "jest/no-standalone-expect": "error",
        "jest/no-test-prefixes": "error",
        "jest/valid-describe-callback": "error",
        "jest/valid-expect": "error",
        "jest/valid-expect-in-promise": "error",
        "jest/valid-title": "error",
    },
}];