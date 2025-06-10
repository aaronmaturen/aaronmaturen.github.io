---
layout: post.njk
title: "Galactic Archives - CI/CD with GitHub Actions and GitHub Pages"
description: "Setting up automated builds, testing, and deployment with GitHub Actions to publish our Angular app to GitHub Pages"
date: 2025-06-12
tags:
  - ci-cd
  - github-actions
  - github-pages
  - angular
  - deployment
  - automation
seriesId: galactic-archives
part: 12
github:
  org: aaronmaturen
  repo: galactic-archives
  tag: post-12
---

# Angular DataSource with SWAPI: Building the Galactic Archives - CI/CD with GitHub Actions and GitHub Pages

_In the ever-evolving landscape of the Angular galaxy, manual deployments are like piloting a starship with your eyes closed—technically possible, but prone to disaster. The Ancient Order of Angular teaches us that automation is not just a convenience but a necessity for maintaining order in the chaos of development._

> "The mark of a true Jedi developer," whispers the Cosmic Compiler, "is not how many lines of code they write, but how many processes they automate." A junior developer once asked why automation was so important. The Compiler simply replied, "Because humans make mistakes. Machines make the same mistakes consistently, which is ironically more reliable."

## The Path to Continuous Integration and Deployment

With our Galactic Archives application optimized and ready for production, we now need to establish a reliable pipeline for continuous integration and deployment. This ensures that:

1. Every code change is automatically tested
2. Code quality standards are enforced
3. Successful builds are automatically deployed
4. The team is immediately notified of any issues

In this transmission, we'll set up a complete CI/CD pipeline using GitHub Actions and deploy our application to GitHub Pages.

## Setting Up GitHub Actions for CI

GitHub Actions allows us to create automated workflows triggered by repository events like pushes or pull requests. Let's create our first workflow for continuous integration.

### Creating the Workflow File

First, we need to create a workflow file in the `.github/workflows` directory:

```bash
mkdir -p .github/workflows
```

Now, let's create our CI workflow file:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Unit Tests
        run: npm test -- --no-watch --no-progress --browsers=ChromeHeadless

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: E2E Tests
        run: npx playwright test --reporter=list --quiet

      - name: Build
        run: npm run build
```

This workflow will:

1. Trigger on pushes to the main branch or pull requests targeting main
2. Set up a Node.js environment
3. Install dependencies
4. Run linting checks
5. Execute unit tests with Jest
6. Install Playwright browsers and run E2E tests
7. Build the application

### Configuring Jest for CI

Since we're using Jest for testing, we need to make sure it's properly configured for the CI environment. Let's update our Jest configuration:

```javascript
// jest.config.js
module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  globalSetup: "jest-preset-angular/global-setup",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  coverageReporters: ["text", "lcov", "clover"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/app/**/*.ts",
    "!src/app/**/*.module.ts",
    "!src/app/**/*.spec.ts",
    "!src/app/environments/**",
  ],
  reporters: process.env.CI
    ? ["default", ["jest-junit", { outputDirectory: "test-results" }]]
    : ["default"],
};
```

We'll also need to install the Jest JUnit reporter:

```bash
npm install --save-dev jest-junit
```

The Jest JUnit reporter is essential for CI environments because it generates test results in JUnit XML format, which GitHub Actions and other CI systems can parse to display detailed test reports. This helps with:

1. Visualizing test results directly in the GitHub Actions UI
2. Tracking test failures over time
3. Providing detailed error information when tests fail
4. Enabling historical test performance analysis

### Running ESLint and Prettier Checks

To ensure code quality, we'll run ESLint and Prettier checks in our CI pipeline. Since we already have ESLint and Prettier configured in our project, we just need to make sure the lint script is executed as part of our CI workflow.

Our existing `package.json` already includes the necessary lint scripts:

```json
"scripts": {
  "lint": "ng lint && prettier --check \"src/**/*.{ts,html,scss}\"",
  "lint:fix": "ng lint --fix && prettier --write \"src/**/*.{ts,html,scss}\""
}
```

The CI workflow will use the `lint` script to check for code style issues without automatically fixing them.

## Implementing Automated Deployment to GitHub Pages

Now that our CI pipeline is set up, let's configure automated deployment to GitHub Pages.

### Configuring Angular for GitHub Pages

First, we need to update our Angular configuration to work with GitHub Pages. Let's modify the `angular.json` file:

```json
"architect": {
  "build": {
    "configurations": {
      "production": {
        "baseHref": "/galactic-archives/"
      }
    }
  }
}
```

We should also update our `package.json` file to include homepage and documentation URLs:

```json
{
  "name": "galactic-archives",
  "version": "0.0.0",
  "homepage": "https://aaronmaturen.com/galactic-archives/",
  "documentation": "https://aaronmaturen.com/musings/galactic-archives-series/"
  // rest of package.json
}
```

These fields provide metadata about where the application is hosted and where its documentation can be found, which is useful for tools and developers working with the project.

### Creating the Deployment Workflow

Now, let's create a separate workflow file for deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build -- --configuration production --base-href=/galactic-archives/

      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist/galactic-archives/browser
          branch: gh-pages
          token: ${{ secrets.GITHUB_TOKEN }}
```

This workflow will:

1. Trigger on pushes to the main branch or manual dispatch
2. Set up a Node.js environment
3. Install dependencies
4. Build the application with production configuration
5. Deploy the built files to the gh-pages branch

Note the `permissions` section is crucial - it gives the GitHub Actions workflow write access to your repository contents. Without this, the deployment will fail with a 403 error because the default `GITHUB_TOKEN` doesn't have permission to push to your repository.

### Adding Build Badges

Build badges provide quick visual feedback on the status of our CI/CD pipelines. Let's add them to our README.md:

```markdown
# Angular DataSource with SWAPI: Building the Galactic Archives

![CI](https://github.com/aaronmaturen/galactic-archives/workflows/CI/badge.svg)
![Deploy](https://github.com/aaronmaturen/galactic-archives/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)
```

## Implementing Branch Protection Rules

To ensure our CI/CD pipeline is effective, we should set up branch protection rules in GitHub:

1. Go to your repository settings
2. Navigate to Branches > Branch protection rules
3. Add a rule for the main branch
4. Enable the following options:
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Select the CI workflow as a required status check
   - Require pull request reviews before merging

> "Branch protection," the Cosmic Compiler notes with approval, "is like the blast doors on a Star Destroyer—preventing unauthorized or untested code from entering critical systems."

## Cosmic Compiler Summary

- We've **set up GitHub Actions workflows** for continuous integration
- We've **configured automated testing** with Jest and Playwfright in our CI pipeline
- We've **implemented code quality checks** with ESLint and Prettier
- We've **automated deployment** to GitHub Pages
- We've **added build badges** for workflow status
- We've **configured branch protection rules** to enforce quality standards

_With our CI/CD pipeline in place, our Galactic Archives application is now fully automated—from code commit to production deployment. The Ancient Order of Angular would be proud of our commitment to quality and automation._

_As we conclude our journey through the Angular galaxy, remember that the path of a developer is one of continuous learning and improvement. The techniques and patterns we've explored are but a fraction of what's possible with Angular._

_May your builds always be green, your tests always pass, and your deployments always succeed._
