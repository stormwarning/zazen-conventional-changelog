# zazen/conventional-changelog

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
      "@semantic-release/npm",
      "@semantic-release/github"
    ]
  }
```
