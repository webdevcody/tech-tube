Refactor the following React component or TypeScript code to improve maintainability and reduce file size by splitting it into smaller, focused components or utility functions. For each logical section or UI element, extract it into a separate colocated file within the same directory as the original file.

- For React components, create a `-components/` subdirectory (e.g., `MyComponent-components/`) and move each extracted component there.
- For utility functions or hooks, create colocated files (e.g., `useSomething.ts`, `helpers.ts`) in the same directory.
- If you are working within a TanStack Router `routes/` directory, use a `-` prefix (e.g., `-components/`) to ensure these files are ignored as routes, following the conventions described in the design documentation.
- Update all imports in the main file to reference the new colocated files.
- Ensure that the refactored code maintains the same functionality and adheres to the existing design system and file structure.

Provide the refactored code and a brief summary of the changes you made, including which parts were extracted and where they are now located.
