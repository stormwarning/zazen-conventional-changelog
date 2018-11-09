# zazen-conventional-changelog

[![npm version][npmver]][npm-url]
[![npm downloads][npmdls]][npm-url]
[![semantic-release][sr-img]][sr-url]

**[conventional-changelog][]** custom preset.

## Usage

Add the following to your project’s `package.json`:

```json
"release": {
  "config": "@zazen/conventional-changelog",
  "plugins": [
    [
      "@semantic-release/commit-analyzer",
      { "releaseRules": "@zazen/conventional-changelog/lib/release-rules.js" }
    ],
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        "changelogTitle": 
          "@zazen/conventional-changelog/lib/changelog-title.js"
      }
    ],
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

## Related modules

-   [zazen-semantic-release][]
-   [zazen-commit-types][]

[npmver]: https://img.shields.io/npm/v/@zazen/semantic-release.svg?style=flat-square

[npmdls]: https://img.shields.io/npm/dt/@zazen/semantic-release.svg?style=flat-square

[npm-url]: https://www.npmjs.com/package/@zazen/semantic-release

[sr-url]: https://github.com/semantic-release/semantic-release

[sr-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square

[conventional-changelog]: https://github.com/conventional-changelog/conventional-changelog

[zazen-semantic-release]: https://github.com/stormwarning/zazen-semantic-release

[zazen-commit-types]: https://github.com/stormwarning/zazen-commit-types
