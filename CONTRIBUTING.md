# Contributing to ShareGradient

Thank you for your interest in contributing to ShareGradient.

ShareGradient is a small browser-focused TypeScript library for generating animated gradients and exposing them through CSS custom properties. Contributions are welcome, whether they improve the core engine, the public API, tests, documentation, or the landing page.

## How to Contribute

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your change:
   ```bash
   git checkout -b my-feature
   ```
5. Make your changes.
6. Run the checks before opening a pull request:
   ```bash
   npm test -- --run
   npm run test:coverage
   npm run build
   npx publint
   ```
7. If your change affects the public site, open `public/index.html` in a browser and verify the result manually.
8. Commit your changes with a clear message.
9. Push your branch and open a Pull Request.

## Project Structure

- `src/sharegradient.ts`: public package entrypoint
- `src/api/ShareGradientBuilder.ts`: fluent public builder API
- `src/core/Engine.ts`: canvas rendering engine
- `src/core/Controller.ts`: runtime lifecycle and update loop
- `src/core/types.ts`: public and internal types
- `src/css/injectVariable.ts`: CSS variable injection helper
- `src/utils/env.ts`: browser environment helpers
- `test/`: Vitest test suite
- `public/index.html`: landing page / demo
- `public/style.css`: landing page styles

## Development Notes

- Use `npm run dev` for watch mode while working on the library bundle.
- Use `npm run build` to produce the distributable files in `dist/`.
- Use `npm test -- --run` for the standard test pass.
- Use `npm run test:coverage` when changing runtime behavior or public API logic.
- Try to keep the public API stable and additive unless the change is intentionally breaking.
- If you modify documented behavior, update `README.md` in the same pull request.
- If you modify visual behavior on the site, keep the hero section visually intact unless the change explicitly targets it.

## Code Style

- Match the existing TypeScript style and naming conventions.
- Keep the library dependency-free at runtime.
- Prefer small, explicit changes over broad refactors.
- Add or update tests when changing builder behavior, controller lifecycle, rendering logic, or packaging behavior.

## Reporting Issues

If you find a bug or want to suggest an improvement, open an issue on GitHub with:

- a clear description of the problem
- reproduction steps when relevant
- expected behavior
- actual behavior
- browser and environment details if the issue is runtime-related

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
