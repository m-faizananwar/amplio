// ESLint flat config. Enforces the lintable subset of the engineering rules in
// CLAUDE.md; the rest are convention. Built on eslint-config-next's flat presets
// (which register the `import`, `jsx-a11y`, `react-hooks` and `@next/next`
// plugins) so the app scaffold only needs to add next/react to make it live.
//
// Validated against: eslint 9.x, eslint-config-next 16.x, typescript 5.x.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const DB_MODULES = ["@/db", "@/db/*", "drizzle-orm", "drizzle-orm/*", "postgres"];

// Raw hex colours in JSX/strings: tailwind theme tokens only.
const HEX_COLOUR = "/(^|[^\\w&])#[0-9a-fA-F]{3,8}\\b/";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "drizzle/**"]),

  // ---- everything under src -------------------------------------------------
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // size + shape
      "max-lines": ["error", { max: 500, skipBlankLines: false, skipComments: false }],
      "max-lines-per-function": ["warn", { max: 40, skipBlankLines: true, skipComments: true, IIFEs: true }],
      "max-depth": ["error", 3],
      "max-params": ["error", 3],

      // strict ts
      "@typescript-eslint/no-explicit-any": "error",
      // allowed, but each one needs a comment saying why — surfaced as a warning
      "@typescript-eslint/no-non-null-assertion": "warn",

      // layering: only features/*/server and src/db may touch the database
      // (overridden back off for those folders below)
      "no-restricted-imports": ["error", {
        paths: [
          { name: "@/db", message: "Views and routes never touch the db. Go through features/<domain>/server." },
          { name: "cn", message: "Import cn from @/lib/cn: the stock one drops colours next to our text-body/text-small sizes." },
        ],
        patterns: [{ group: DB_MODULES, message: "Views and routes never touch the db. Go through features/<domain>/server." }],
      }],
      "import/no-restricted-paths": ["error", {
        basePath: "./src",
        zones: [
          {
            target: ["./app", "./components", "./features/*/components/**", "./lib", "./hooks"],
            from: "./db",
            message: "Only features/*/server may import from src/db.",
          },
          {
            target: "./lib",
            from: ["./app", "./components", "./features", "./db", "./hooks"],
            message: "src/lib is pure functions only: no db, no features, no io.",
          },
        ],
      }],
      "import/no-cycle": ["error", { maxDepth: "∞" }],
    },
  },

  // ---- the data layer may import the db ---------------------------------------
  {
    files: ["src/features/*/server/**/*.ts", "src/db/**/*.ts", "scripts/**/*.ts"],
    rules: {
      "no-restricted-imports": "off",
      // no magic numbers in server/business code: constants.ts per feature
      "no-magic-numbers": ["error", {
        ignore: [-1, 0, 1, 2, 100, 1000],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
        enforceConst: true,
        detectObjects: false,
      }],
    },
  },

  // ---- seed fixtures are data, not business logic --------------------------------
  {
    files: ["scripts/**/*.ts"],
    rules: { "no-magic-numbers": "off" },
  },

  // ---- src/lib is pure ---------------------------------------------------------
  {
    files: ["src/lib/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: [
            ...DB_MODULES,
            "@/features/*", "@/app/*", "@/components/*",
            "next", "next/*", "react", "react/*", "react-dom", "react-dom/*",
            "server-only", "node:*", "fs", "fs/*", "path", "child_process", "net", "http", "https",
          ],
          message: "src/lib is pure functions only (fit score, money, dates). No io, no db, no framework.",
        }],
      }],
      "no-magic-numbers": ["error", {
        ignore: [-1, 0, 1, 2, 100, 1000],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
        enforceConst: true,
        detectObjects: false,
      }],
    },
  },

  // ---- /api/health is the one route whose job is to prove the db is reachable ---
  {
    files: ["src/app/api/health/route.ts"],
    rules: {
      "no-restricted-imports": "off",
      "import/no-restricted-paths": "off",
    },
  },

  // ---- page.tsx is thin ---------------------------------------------------------
  {
    files: ["src/app/**/page.tsx", "src/app/**/layout.tsx"],
    rules: {
      "max-lines": ["error", { max: 100, skipBlankLines: false, skipComments: false }],
    },
  },

  // ---- views: a11y + design tokens ---------------------------------------------
  {
    files: ["src/**/*.tsx"],
    rules: {
      // real buttons and links, labelled inputs, keyboard reachable
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/label-has-associated-control": ["error", { assert: "either" }],
      "jsx-a11y/interactive-supports-focus": "error",
      // tailwind theme tokens only, no raw hex
      "no-restricted-syntax": ["error",
        { selector: `Literal[value=${HEX_COLOUR}]`, message: "No raw hex colours. Use tailwind theme tokens." },
        { selector: `TemplateElement[value.raw=${HEX_COLOUR}]`, message: "No raw hex colours. Use tailwind theme tokens." },
      ],
    },
  },

  // ---- tests assert on literal values; that is not "magic" ---------------------
  {
    files: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    rules: {
      "no-magic-numbers": "off",
      "max-lines-per-function": "off",
    },
  },

  // ---- shadcn output is generated, not edited: don't lint its shape --------------
  {
    files: ["src/components/ui/**"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-params": "off",
      "max-depth": "off",
      "no-restricted-syntax": "off",
      // generated primitives: the semantics are supplied at the call site
      "jsx-a11y/label-has-associated-control": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
    },
  },
]);
