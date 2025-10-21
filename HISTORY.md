# Changelog

All notable changes to this project will be documented in this file.

## [4.0.0-alpha](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v3.0.3...v4.0.0-alpha) (2025-10-21)


### ⚠ BREAKING CHANGES

* **NODE-7058:** drop support for Node 16 and 18 ([#95](https://github.com/mongodb-js/mongodb-connection-string-url/issues/95))

### Features

* **NODE-7058:** drop support for Node 16 and 18 ([#95](https://github.com/mongodb-js/mongodb-connection-string-url/issues/95)) ([783c85b](https://github.com/mongodb-js/mongodb-connection-string-url/commit/783c85b5416410fc92c1121d60f8b95e822465a0))

## [3.0.3](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v3.0.2...v3.0.3) (2025-09-04)


### Bug Fixes

* update exports entry with type mappings for ESM consumers ([#91](https://github.com/mongodb-js/mongodb-connection-string-url/issues/91)) ([8d93166](https://github.com/mongodb-js/mongodb-connection-string-url/commit/8d9316674699bbd204b9d9b91a033d5b279cf4c7))

## [3.0.2](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v3.0.1...v3.0.2) (2025-01-14)


### Bug Fixes

* markdown ([e83540a](https://github.com/mongodb-js/mongodb-connection-string-url/commit/e83540ac13b26ad23ee6314b8f1a5afedb6352fd))

## [3.0.1](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v3.0.1...v3.0.0) (2024-05-10)

* Nothing was changed in this release

## [3.0.0](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v3.0.0...v2.6.0) (2023-11-02)

* dfee875 feat!: bump supported Node.js version range (#32)
* 363c7be fix: update whatwg-url version due to deprecation warning (#31)

## [2.6.0](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.6.0...v2.5.4) (2022-11-28)

* fix(redact): handle empty username when redacting password

## [2.5.4](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.5.4...v2.5.3) (2022-09-30)

* 16051cc fix: remove regexp lookbehind usage COMPASS-5738 (#25)

## [2.5.3](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.5.3...v2.5.2) (2022-07-22)

* 828628b fix: never allow literal unescaped @ as part of usernames COMPASS-5958 (#23)

## [2.5.2](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.5.2...v2.5.1) (2022-02-25)

* bd13183 fix: keep error messages for loose validation same as for strict validation (#22)

## [2.5.1](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.5.1...v2.5.0) (2022-02-23 17:29:31 +0100)

* 6dff313 fix: use looseValidation for cloning ConnectionString instances (#21)

## [2.5.0](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.5.0...v2.4.2) (2022-02-23 17:00:46 +0100)

* c84b6bd feat: add opt-in for looser connection string validation (#20)

## [2.4.2](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.4.2...v2.4.1) (2022-02-02)

* 7793102 fix: check missing host after auth COMPASS-5471
* 93b8b28 chore: improve invalid connection string message when scheme/protocol is invalid

## [2.4.1](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.4.1...v2.4.0) (2021-12-21 13:16:28 +0100)

* 4dfbe69 fix: relax TS types for Compass TS config

## [2.4.0](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.4.0...v2.3.2) (2021-12-21 12:56:45 +0100)

* 7acda22 feat: allow typing searchParams and record types (#14)

## [2.3.2](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.3.2...v2.3.1) (2021-12-13 20:02:18 +0100 )

* 1e1d1d1 chore: Always start matching from the beginning of the string

## [2.3.1](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.3.1...v2.3.0) (2021-12-13 17:21:14 +0100)

* be0789b chore: make redaction a bit more configurable COMPASS-5038 (#12)

## [2.3.0](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.3.0...v2.2.0) (2021-12-13 14:37:13 +0100)

* ec8e864 feat: add connection string redaction utilities COMPASS-5308 (#11)

## [2.2.0](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.2.0...v2.1.0) (2021-11-15)

* fd4d939 chore: bump whatwg-url to 11.0.0 (#9)

## [2.1.0](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.1.0...v2.0.0) (2021-09-21)

* 905c62b chore: Update gen-esm-wrapper to handle esm interop better in the resulting build

## [2.0.0](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v2.0.0...v1.1.2) (2021-08-09)

* 05b4d09 chore(ci): add Node.js 16, drop Node.js 10 (#5)
* 0868163 chore: update whatwg-url dependency (#4)

## [1.1.2](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v1.1.2...v1.1.1) (2021-08-06 13:10:39 +0200)

* 5a7dbb0 fix: enable typescript strict flag

## [1.1.1](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v1.1.1...v1.0.2) (2021-08-06 13:01:36 +0200)

* dd55c66 fix: authMechanismProperties is case-insensitive

## [1.0.2](https://github.com/mongodb-js/mongodb-connection-string-url/compare/v1.0.2...v1.0.1) (2021-07-30)

* 5033297 feat: add CommaAndColonSeparatedRecord class (#3)
* a6fcc99 chore: moves `@types/whatwg-url` to proper dependency

## [1.0.1](https://github.com/mongodb-js/mongodb-connection-string-url/tree/v1.0.1) (2021-07-30)

* cebcaae chore: always use whatwg-url (#1)
