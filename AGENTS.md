# AGENTS.md

Instructions for AI coding agents working in this repository. This file is the source of truth; tool-specific files (e.g. CLAUDE.md) should only import it.

## Project Overview

A parser library for MongoDB connection string URLs.

## Commands

```bash
npm run build        # compile TypeScript to lib/ and generate ESM wrapper
npm test             # build, run tsd type tests, then mocha with coverage
npm run lint         # runs an eslint pass
npm run compile-ts   # type-check/compile only (fastest feedback)
```

## Structure

- [src/index.ts](src/index.ts) — parsing logic
- [src/redact.ts](src/redact.ts) — credential redactors for connection strings
- `test/*.ts` — mocha + chai tests;
- `test/types/*` — tsd type-level tests

## Code Conventions

- **Public API stability** — everything exported from `src/index.ts` is public API. Renaming, removing, or narrowing exported types/signatures is a breaking change; confirm with a maintainer first.
- **Errors** — throw `MongoParseError` for invalid connection strings; messages in sentence case, no trailing period. Never include the raw URI (credentials) in error messages.
- **Formatting** — Prettier via eslint: single quotes, 2-space indent. Run `npm run lint` before committing.
- **Tests** — every behavior change needs a mocha test; type-signature changes need a tsd test in `test/types/`.

## Other Important Information

- Changes must be compliant with the [connection string spec](https://github.com/mongodb/specifications/blob/master/source/connection-string/connection-string-spec.md).

## Commit Messages

[Conventional Commits](https://www.conventionalcommits.org/) optionally with a Jira ticket: `<type>(NODE-XXXX): <subject>` — types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`; breaking changes use `!` (e.g. `feat(NODE-XXXX)!: …`). This rule is mandatory for PR descriptions, because that is what ends up in the history. The individual commits inside a PR do not have to follow this convention, because we squash PR commits.

## Related Repositories

Direct dependents maintained by MongoDB — changes to public API or parsing behavior ripple into these:

| Repo | Why it matters |
| --- | --- |
| [node-mongodb-native](https://github.com/mongodb/node-mongodb-native) | The Node.js driver; parses every user connection string. Parsing or API regressions break connections. |
| [mongosh](https://github.com/mongodb-js/mongosh) | The MongoDB shell; option handling and redaction changes affect how it connects and displays URIs. |
| [devtools-shared](https://github.com/mongodb-js/devtools-shared) | Shared Compass/devtools packages; changes propagate to every tool built on them. |
| [compass](https://github.com/mongodb-js/compass/) | Compass GUI; builds and edits connection strings, surfacing behavior/redaction changes to end users. |
