# Repository Guidelines

## Project Structure & Module Organization
The project follows the Next.js App Router layout under `src/app`, with `/builder` housing the editor UI and `api/` exposing CRUD endpoints plus `/api/generate` for Vue export. Shared UI pieces live in `src/components/builder`, and state/helpers stay inside `src/lib` (database helpers, generators, types). Persistent assets reside in `public/`. Generated Vue files and the LowDB store live in `data/pages/` and `data/db.json`; treat them as build artifacts. Utility scripts live in `scripts/` (notably `init-db.ts`). Tailwind, TypeScript, and PostCSS configs sit at the repo root alongside `package.json` and `tsconfig.json`.

## Build, Test, and Development Commands
- `yarn init-db`: seed `data/db.json` before the first run or whenever you need a clean dataset.
- `yarn dev`: launch the Next.js dev server at http://localhost:3000 with hot reload.
- `yarn build`: compile production assets; run before pushing major UI changes.
- `yarn start`: serve the optimized build locally for release verification.
- `yarn lint`: execute `next lint` (ESLint + Next rules) to enforce style and detect common issues.

## Coding Style & Naming Conventions
Write TypeScript with 2-space indentation, single quotes, and trailing commas where Prettier would place them. Prefer functional, stateless components; store shared logic in `src/lib`. Components and files are PascalCase (`ComponentPanel.tsx`), hooks are camelCase (`useCanvasStore.ts`), and API route folders mirror their HTTP path. Compose styles with Tailwind classes first; when extracting utilities, colocate them in `src/components/builder` or `src/lib`. Always run `yarn lint` (and Prettier if configured in your editor) before committing.

## Testing Guidelines
Automated tests are not yet in place, so linting plus manual verification of the drag-and-drop flow, persistence, and Vue generation is mandatory. When adding tests, colocate them next to the component (`ComponentPanel.test.tsx`) or inside `src/__tests__`, prefer React Testing Library for UI logic, and include fixtures under `data/fixtures/` if persisted data is required. Target at least smoke coverage for component panels, canvas interactions, and API handlers before merging substantial features.

## Commit & Pull Request Guidelines
Follow the Conventional Commits pattern already in history (`feat:`, `fix:`, `chore:`). Commits should be scoped to one concern and reference affected modules in the summary. Pull requests must describe the change, include reproduction or verification steps (commands, screenshots of the builder when relevant), and link the tracking issue or task. Note any database migrations (`init-db` changes) and attach generated Vue samples if the serializer changed.
