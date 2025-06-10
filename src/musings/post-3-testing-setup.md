---
layout: post.njk
title: "Galactic Archives - Testing Setup"
description: "Configuring Jest for unit testing and Playwright for E2E testing with custom reporters and CI integration for the Angular app"
date: 2025-06-03
tags:
  - testing
  - jest
  - playwright
  - e2e
  - angular
  - test-coverage
seriesId: galactic-archives
part: 3
github:
  org: aaronmaturen
  repo: galactic-archives
  tag: post-3
---

# Angular DataSource with SWAPI: Building the Galactic Archives - Testing Setup with Jest and Playwright

_In a parallel universe where bugs fix themselves and edge cases don't exist, testing might be optional. Unfortunately, we live in this universe, where untested code tends to explode spectacularly the moment it encounters production environments—a phenomenon the Ancient Order of Angular calls "The Demo Effect."_

> Legend has it that a senior developer once confidently declared, "I don't need to test this change, it's just one line of code," right before his demo to the CEO crashed so spectacularly that it rebooted the CFO's laptop three rooms away. The Ancient Order still uses his terminal output as a teaching tool for junior developers.

## The Testing Imperative

Before we dive into the exciting world of Star Wars data, we need to establish proper testing infrastructure. Without tests, we're essentially piloting a starship blindfolded through an asteroid field—technically possible, but with a high probability of spectacular failure.

The Cosmic Compiler judges our code not just by its functionality, but by its testability. Today, we'll set up two powerful testing tools: Jest for unit and integration tests, and Playwright for end-to-end testing.

Think of unit tests as microscopes examining individual cells of your application, while end-to-end tests are more like taking your application to a crowded shopping mall and seeing if it has a public meltdown. Unit tests say, "Does this function return 42 when I pass it the ultimate question?" E2E tests say, "Can a sleep-deprived user with exactly 16 browser tabs open still navigate our checkout flow at 3 AM?"

The Council of Patterns has a saying: "Unit tests tell you if your code is broken; E2E tests tell you if your users are broken." Both are equally important discoveries.

## Setting Up Jest

Angular's default testing framework is Karma/Jasmine, but the Council of Patterns has decreed Jest to be more efficient for modern applications. Let's make the switch:

```bash
# Remove the default testing setup
npm remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter

# Install Jest and related packages
npm install -D jest @types/jest jest-preset-angular ts-jest
```

Now, let's create a `jest.config.js` file in the project root:

```javascript
// jest.config.js
module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/e2e/", // Since we're using playwrite for e2e we need to exclude them from jest. The Cosmic Compiler appreciates separation of test types
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "lcov", "text"],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1", // For clean imports
  },
  testMatch: [
    "**/*.spec.ts", // The Ancient Order of Angular prefers .spec.ts for test files
  ],
};
```

Next, create a `setup-jest.ts` file:

```typescript
// setup-jest.ts
import { setupZoneTestEnv } from "jest-preset-angular/setup-env/zone";

setupZoneTestEnv();

// Global mocks go here
Object.defineProperty(window, "CSS", { value: null });
Object.defineProperty(document, "doctype", {
  value: "<!DOCTYPE html>",
});
Object.defineProperty(window, "getComputedStyle", {
  value: () => ({
    display: "none",
    appearance: ["-webkit-appearance"],
  }),
});
```

Update your `tsconfig.spec.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jest", "node"]
  },
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
```

Finally, update your `package.json` scripts:

```json
{
  "scripts": {
    // ... other scripts
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Setting Up Playwright

For end-to-end testing, we'll use Playwright, which allows us to test our application across multiple browsers:

```bash
# Install Playwright
npm install -D @playwright/test
```

Initialize Playwright configuration:

```bash
# The Cosmic Compiler appreciates proper initialization
npx playwright install
npx playwright install-deps
```

Create a `playwright.config.ts` file:

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4200",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:4200",
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // The Dependency Demons require patience during startup
  },
});
```

Create an `e2e` directory with a sample test:

```typescript
// e2e/app.spec.ts
import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Wait for the title to be visible
  await expect(page.locator("h1")).toContainText("Galactic Archives");
});

test("navigates to home page", async ({ page }) => {
  await page.goto("/");

  // Check if the app shell is rendered
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
});
```

Update your `package.json` scripts for Playwright:

```json
{
  "scripts": {
    // ... other scripts
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:report": "playwright show-report"
  }
}
```

## Creating Basic Unit Tests

Let's create a simple test for our app component:

```typescript
// src/app/app.component.spec.ts
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "./app.component";

describe("AppComponent", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        AppComponent, // Import the standalone component directly
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the app", () => {
    // The Cosmic Compiler expects components to exist
    expect(component).toBeTruthy();
  });

  it(`should have the correct title`, () => {
    expect(component.title).toEqual("Galactic Archives");
  });

  it("should render title in header", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector("header h1")?.textContent).toContain(
      "Galactic Archives"
    );
  });

  it("should have the current year in the footer", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const currentYear = new Date().getFullYear().toString();
    expect(compiled.querySelector("footer")?.textContent).toContain(
      currentYear
    );
  });
});
```

## Testing Standalone Components

Angular v18's standalone components require a slightly different testing approach. Since we're not using NgModules, we need to import our components directly into the test module:

```typescript
// src/app/features/example/example.component.spec.ts
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ExampleComponent } from "./example.component";
import { MatButtonModule } from "@angular/material/button";

describe("ExampleComponent", () => {
  let component: ExampleComponent;
  let fixture: ComponentFixture<ExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExampleComponent,
        // Import any dependencies the component has
        MatButtonModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
```

## Looking Ahead: Testing and Architecture

In the next post, we'll dive into feature-based architecture and how it shapes our testing strategy. For now, we've set up the testing tools we need, but the real magic happens when we align our tests with a well-structured application.

> The Ancient Order tells of a developer who organized all their code in a single file named "everything.ts" with 17,000 lines. Legend says that when asked about testing strategy, they simply laughed maniacally before disappearing into the night, never to be seen again. Some say their ghost still haunts legacy codebases, whispering "just one more function" to unsuspecting juniors.

With our testing foundations in place, we're ready to build our application with testability in mind from the start.

## When to Use Each Testing Approach

Different testing tools serve different purposes, much like how different lightsaber crystals produce different blade colors:

### Jest (Unit & Integration Tests)

Jest excels at testing individual units of code and their interactions:

- **Component Tests**: Verify that components render correctly and respond to user interactions
- **Service Tests**: Ensure services process data correctly and handle errors gracefully
- **Pipe Tests**: Validate that pipes transform data as expected
- **Directive Tests**: Check that directives modify the DOM correctly

```typescript
// Example service test
// src/app/core/services/example.service.spec.ts
import { TestBed } from "@angular/core/testing";
import { ExampleService } from "./example.service";

describe("ExampleService", () => {
  let service: ExampleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExampleService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should transform data correctly", () => {
    const input = { name: "Luke" };
    const expected = { name: "LUKE" };
    expect(service.transformData(input)).toEqual(expected);
  });

  // The Cosmic Compiler appreciates thorough error testing
  it("should handle null input gracefully", () => {
    expect(() => service.transformData(null)).not.toThrow();
  });
});
```

### Playwright (End-to-End Tests)

Playwright tests the application as a whole, simulating real user interactions:

- **User Flows**: Test complete user journeys through the application
- **Visual Regression**: Ensure the UI appears as expected across browsers
- **Network Interactions**: Verify that the application interacts correctly with backend services
- **Performance**: Check that the application loads and responds within acceptable timeframes
- **Accessibility**: Ensure your app works for everyone (foreshadowing: the Cosmic Compiler judges harshly those who forget this step, as we'll discover in a future post)

```typescript
// Example user flow test
// e2e/navigation.spec.ts
import { test, expect } from "@playwright/test";

test("user can navigate through the application", async ({ page }) => {
  // Start at the home page
  await page.goto("/");

  // Check initial state
  await expect(page.locator("h1")).toContainText("Galactic Archives");

  // Navigate to another page (once we have one)
  await page.getByRole("link", { name: "Characters" }).click();

  // Verify navigation worked
  await expect(page).toHaveURL(/.*\/characters/);

  // The Dependency Demons fear thorough testing
  await expect(page.locator("h2")).toContainText("Star Wars Characters");
});
```

## Running Our Tests

Let's make sure our testing setup works:

```bash
# Run Jest tests
npm test

# Run Playwright tests (make sure the app is running)
npm run e2e
```

If everything is configured correctly, you should see the test results in your terminal. The Cosmic Compiler will be pleased with your diligence.

## Cosmic Compiler Summary

- We've **set up Jest** for unit and integration testing, replacing the default Karma/Jasmine setup
- We've **configured Playwright** for end-to-end testing across multiple browsers
- We've **created basic tests** for both frameworks to validate our setup
- We've **explained when to use each testing approach** for different testing scenarios
- We've **added convenient test scripts** to our package.json for running tests

_In our next transmission, we'll establish a proper feature-based architecture for our application, creating the foundation upon which our Galactic Archives will be built. The Council of Patterns has provided ancient scrolls detailing the optimal structure for Angular applications—scrolls that suspiciously resemble modern best practices documentation._

_May your tests be green and your coverage be high._
