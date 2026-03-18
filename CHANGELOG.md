# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-03-18

### Added

- First stable public release of ShareGradient
- Support for `linear`, `radial`, and `conic` gradient types
- Support for `static`, `swirl`, and `rotate` animation modes
- Controller lifecycle methods: `start`, `pause`, `resume`, `once`, `stop`
- CSS custom property injection workflow for shared gradient reuse
- Coverage command with `npm run test:coverage`
- Additional tests for controller lifecycle, builder behavior, fallback colors, and conic fallback

### Changed

- Cleaned and stabilized the public API for a 1.0.0 release
- Improved package exports for ESM/CJS consumers
- Hardened runtime validation for builder inputs
- Improved listener cleanup and resize handling in the controller
- Updated README to match actual features
- Expanded the public landing page while preserving the hero section

### Removed

- Deprecated builder methods `setDensity()` and `setRotateSpeed()`

### Notes

- In browsers without `createConicGradient()`, conic gradients fall back to a linear gradient.
