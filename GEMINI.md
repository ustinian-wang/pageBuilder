# GEMINI.md

## Project Overview

This is a PC-side page builder application built with Next.js 15. It allows users to visually build pages by dragging and dropping components, and then generate maintainable Vue 2 component code.

The main technologies used are:

*   **Next.js 15:** A React framework for building server-side rendered and static web applications.
*   **TypeScript:** A statically typed superset of JavaScript.
*   **Tailwind CSS:** A utility-first CSS framework.
*   **@dnd-kit:** A modern, lightweight, and extensible drag-and-drop toolkit for React.
*   **LowDB:** A small local JSON database for storing page configurations.
*   **Vue.js:** The generated code is in Vue 2 format.

The project is structured as a monorepo with a Next.js frontend and a set of API routes for handling data persistence and code generation.

## Building and Running

To get the project up and running, follow these steps:

1.  **Install dependencies:**

    ```bash
    yarn install
    ```

2.  **Initialize the database:**

    Before starting the development server for the first time, you need to initialize the database. This will create the `data/db.json` file.

    ```bash
    yarn init-db
    ```

3.  **Start the development server:**

    ```bash
    yarn dev
    ```

    The application will be available at [http://localhost:3000](http://localhost:3000).

### Other useful commands:

*   **Build for production:**

    ```bash
    yarn build
    ```

*   **Start the production server:**

    ```bash
    yarn start
    ```

*   **Lint the code:**

    ```bash
    yarn lint
    ```

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. Utility classes are preferred over custom CSS.
*   **Components:** React components are located in the `src/components` directory. Builder-specific components are in `src/components/builder`, and draggable element components are in `src/components/elements`.
*   **API Routes:** API routes are defined in the `src/app/api` directory.
*   **Code Generation:** The logic for generating Vue code is located in `src/lib/generator/vue-generator.ts`.
*   **Database:** The database is managed by `lowdb` and the schema is defined in `src/lib/db.ts`.
*   **State Management:** The main state of the builder is managed in the `src/app/builder/page.tsx` component using React hooks.
*   **Drag and Drop:** The drag and drop functionality is implemented using `@dnd-kit`.
