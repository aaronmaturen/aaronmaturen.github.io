---
layout: post
title: "Angular DataSource with SWAPI: Building the Galactic Archives - Code Quality Setup"
description: "Implementing code quality tools to maintain consistency and prevent bugs"
date: 2025-06-03
tags:
  ["angular", "code-quality", "eslint", "prettier", "step-2-code-quality-setup"]
seriesId: galactic-archives
part: 2
github:
  org: aaronmaturen
  repo: galactic-archive
  tag: post-2
---

# Angular DataSource with SWAPI: Building the Galactic Archives - Code Quality Setup

_In the vast expanse of the coding universe, there exists a special circle of developer hell reserved for those who commit unformatted code to repositories. It's a place where tabs and spaces wage eternal war, where semicolons appear and disappear like quantum particles, and where the Dependency Demons feast on inconsistent casing conventions._

## The Quest for Code Quality

Any project worth its weight in bytes needs a proper code quality setup. Without it, even the most elegant architecture will eventually collapse under the weight of inconsistent formatting, unused variables, and the dreaded "any" type that lurks in the shadows.

The Ancient Order of Angular has long decreed that proper linting and formatting are not mere suggestions but sacred obligations. As the TypeScript Prophecies foretold: "He who uses any shall debug for eternity."

## Setting Up ESLint

ESLint serves as our first line of defense against the forces of code entropy. Let's summon it into our project:

```bash
# Invoke the linting guardians
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-import

# Angular-specific ESLint rules
npm install -D @angular-eslint/eslint-plugin @angular-eslint/eslint-plugin-template @angular-eslint/template-parser
```

Now, let's create our `.eslintrc.json` configuration file:

```json
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates",
        "plugin:prettier/recommended"
      ],
      "rules": {
        // The Ancient Order of Angular demands proper naming
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "app",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "app",
            "style": "kebab-case"
          }
        ]
      }
    },
    {
      "files": ["*.html"],
      "extends": [
        "plugin:@angular-eslint/template/recommended",
        "plugin:@angular-eslint/template/accessibility",
        "plugin:prettier/recommended"
      ],
      "rules": {}
    }
  ]
}
```

## Configuring Prettier

While ESLint ensures our code follows best practices, Prettier ensures it looks consistently beautiful. The Galactic Standards Committee has strict regulations about code aesthetics:

```bash
# Summon the formatting entity
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

Create a `.prettierrc` file:

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "parser": "html"
      }
    }
  ]
}
```

The configuration above already includes Prettier integration with the `plugin:prettier/recommended` extension.

## Setting Up Pre-commit Hooks

To prevent Schrödinger's Bugs from sneaking into our codebase, we'll set up pre-commit hooks using Husky and lint-staged. Husky intercepts Git commands like `commit` and `push`, allowing us to run scripts before they complete. Lint-staged works alongside Husky by running commands only on files that are staged for commit, making the process lightning fast. Together, they create a formidable defense system - Husky catches the commit attempt while lint-staged efficiently processes only what's changed. This means linting and formatting happen automatically before code enters your repository, eliminating those embarrassing "fix formatting" commits that clutter your history. The Ancient Order of Angular considers this combination essential for maintaining codebase sanity:

```bash
# Summon the guardians of the commit gate
npm install -D husky lint-staged
```

Initialize Husky:

```bash
# Initialize the ancient ritual of pre-commit validation
npx husky init
```

Create a `.husky/pre-commit` file:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

Now, configure lint-staged in your `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,html}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## Adding Scripts to package.json

Let's add some helpful scripts to our `package.json`:

```json
{
  "scripts": {
    // ... existing scripts
    "lint": "eslint \"src/**/*.{ts,html}\"",
    "lint:fix": "eslint \"src/**/*.{ts,html}\" --fix",
    "format": "prettier --write \"src/**/*.{ts,html,scss,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,html,scss,json,md}\"",
    "prepare": "husky install"
  }
}
```

## Integrating with VS Code

To ensure the Cosmic Compiler's blessings extend to our development environment, let's configure VS Code:

Create a `.vscode/settings.json` file:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": ["typescript", "html"],
  "prettier.documentSelectors": ["**/*.{ts,js,html,scss,css,json,md}"]
}
```

Don't forget to install the necessary VS Code extensions:

```bash
# Install the sacred extensions
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension angular.ng-template
```

## Example Lint Fixes

Let's see how our setup helps us avoid the Void of Undefined and other coding perils:

```typescript
// Before: A code snippet that would anger the Cosmic Compiler
export class GalacticService {
  fetchData() {
    // No return type! The horror!
    return this.http.get("/api/planets").pipe(
      map((data) => {
        // Implicit any! The Cosmic Compiler weeps!
        return data.results;
      })
    );
  }
}

// After: Code that pleases the Ancient Order of Angular
export class GalacticService {
  fetchData(): Observable<Planet[]> {
    return this.http.get<PlanetResponse>("/api/planets").pipe(
      map((data: PlanetResponse): Planet[] => {
        return data.results;
      })
    );
  }
}
```

## The Benefits of Our Setup

With our code quality guardians in place:

1. **Consistent Formatting**: No more debates about tabs vs. spaces or where to put those pesky curly braces
2. **Automatic Error Prevention**: Catch potential issues before they become Schrödinger's Bugs
3. **Enforced Best Practices**: Follow the wisdom of the Ancient Order of Angular
4. **Improved Collaboration**: Everyone's code looks like it was written by the same developer
5. **Cleaner Git History**: No more commits that just fix formatting

## Cosmic Compiler Summary

- We've **set up ESLint** with Angular-specific rules to enforce code quality standards
- We've **configured Prettier** to ensure consistent code formatting across the project
- We've **integrated ESLint and Prettier** to work together harmoniously
- We've **established pre-commit hooks** with Husky and lint-staged to prevent bad code from entering our repository
- We've **configured VS Code** to automatically format and lint our code as we work

_In our next transmission, we'll dive into creating the Star Wars API service, where we'll establish contact with the distant SWAPI galaxy. The Recursive Philosopher reminds us that "to fetch data, one must first understand what data is." Profound, if somewhat unhelpful in practice._

_May your linters be strict and your formatters consistent._
