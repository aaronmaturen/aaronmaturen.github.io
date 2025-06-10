---
layout: post.njk
title: "Galactic Archives - API Mocking with MSW"
description: "Implementing Mock Service Worker (MSW) to intercept and mock SWAPI requests for reliable testing and development without API rate limits"
date: 2025-06-06
tags:
  - msw
  - api-mocking
  - testing
  - angular
  - service-worker
  - star-wars
seriesId: galactic-archives
part: 6
github:
  org: aaronmaturen
  repo: galactic-archives
  tag: post-6
---

# Angular DataSource with SWAPI: Building the Galactic Archives - API Mocking with MSW

_In the vast expanse of web development, there exists a paradox: to test your API integration thoroughly, you must first disconnect from the API entirely. This is not some mystical teaching from the Ancient Order of Angular, but a practical reality when your tests need to run reliably in CI/CD pipelines, offline environments, and parallel universes where the SWAPI servers might be temporarily offline. With MSW and Angular 18, we now have even more powerful tools at our disposal._

## The Dependency Dilemma

When testing applications that rely on external APIs, we face several challenges:

1. External APIs can be unreliable or rate-limited
2. Network requests slow down tests significantly
3. Testing edge cases and error states is difficult with real APIs
4. CI/CD environments may not have access to the external network

> A padawan developer once asked the Council of Patterns about testing APIs: "But if I mock the API, am I not just testing my mocks?" The eldest council member smiled and replied, "If you test the real API, you're testing someone else's code. If you mock nothing, your tests will be as unpredictable as a droid with a corrupted memory core. The path of wisdom lies between." The young developer nodded, though it would be years before they truly understood.

Enter Mock Service Worker (MSW) - a library that intercepts actual HTTP requests at the network level and returns mocked responses. Unlike traditional mocking approaches that replace your HTTP client, MSW works by intercepting requests at a lower level, providing a more realistic testing experience.

## Setting Up MSW for Angular 18

Let's start by installing MSW and its dependencies:

```bash
npm install msw@latest --save-dev
npm install jest-fixed-jsdom node-fetch@2 undici --save-dev
npm install @types/node-fetch@2 --save-dev
```

Next, we need to create a mock service worker setup. We'll centralize our mocks in a single location:

```
src/
└── mocks/
    ├── handlers.ts
    ├── browser.ts
    └── server.ts
```

### Creating Mock Handlers with MSW

The handlers define how MSW should respond to specific API requests. In MSW v2, we use the `http` namespace instead of `rest` and the new `HttpResponse` API for creating responses:

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import { environment } from "../environments/environment";

// Sample character data matching the swapi.tech API format with expanded=true
const characters = [
  {
    uid: "1",
    name: "Luke Skywalker",
    url: "https://www.swapi.tech/api/people/1",
    properties: {
      name: "Luke Skywalker",
      height: "172",
      mass: "77",
      hair_color: "blond",
      skin_color: "fair",
      eye_color: "blue",
      birth_year: "19BBY",
      gender: "male",
      homeworld: "https://www.swapi.tech/api/planets/1",
      created: "2020-09-17T06:49:05.235Z",
      edited: "2020-09-17T06:49:05.235Z",
      url: "https://www.swapi.tech/api/people/1",
    },
    description: "A person within the Star Wars universe",
  },
  {
    uid: "2",
    name: "C-3PO",
    url: "https://www.swapi.tech/api/people/2",
    properties: {
      name: "C-3PO",
      height: "167",
      mass: "75",
      hair_color: "n/a",
      skin_color: "gold",
      eye_color: "yellow",
      birth_year: "112BBY",
      gender: "n/a",
      homeworld: "https://www.swapi.tech/api/planets/1",
      created: "2020-09-17T06:49:05.235Z",
      edited: "2020-09-17T06:49:05.235Z",
      url: "https://www.swapi.tech/api/people/2",
    },
    description: "A person within the Star Wars universe",
  },
];

export const handlers = [
  // Handle GET request for all characters with pagination
  http.get(`${environment.apiUrl}people`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "10";
    const expanded = url.searchParams.get("expanded") === "true";
    const name = url.searchParams.get("name");

    // Handle search by name
    if (name) {
      const filteredResults = characters.filter((char) =>
        char.name.toLowerCase().includes(name.toLowerCase())
      );

      return HttpResponse.json({
        message: "ok",
        total_records: filteredResults.length,
        total_pages: 1,
        previous: null,
        next: null,
        results: filteredResults,
      });
    }

    // Handle pagination
    const pageNum = parseInt(page);
    const hasNextPage = pageNum < 9; // Assuming 9 pages total
    const hasPrevPage = pageNum > 1;

    return HttpResponse.json({
      message: "ok",
      total_records: 82,
      total_pages: 9,
      previous: hasPrevPage
        ? `https://www.swapi.tech/api/people?page=${pageNum - 1}&limit=${limit}`
        : null,
      next: hasNextPage
        ? `https://www.swapi.tech/api/people?page=${pageNum + 1}&limit=${limit}`
        : null,
      results: characters,
    });
  }),

  // Handle GET request for a specific character
  http.get(`${environment.apiUrl}people/:id`, ({ params }) => {
    const { id } = params;
    const character = characters.find((c) => c.uid === id);

    if (!character) {
      // The Ancient Order of Angular teaches us to handle errors gracefully
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({
      message: "ok",
      result: character,
    });
  }),

  // Handle error scenario for testing
  http.get(`${environment.apiUrl}error-test`, () => {
    return new HttpResponse(null, { status: 500 });
  }),
];
```

### Setting Up MSW v2 for Browser

For our browser environment (both development and E2E tests), we need to set up MSW to work with the browser. Note the import path change to `msw/browser` in MSW v2:

```typescript
// src/mocks/browser.ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// This configures a Service Worker with the given request handlers
export const worker = setupWorker(...handlers);
```

### Setting Up MSW v2 for Node (Jest Tests)

For Jest unit tests running in Node environment, we need a server setup.

```typescript
// src/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// This configures a request mocking server with the given request handlers
export const server = setupServer(...handlers);
```

## Configuring MSW for Jest Unit Tests

To use MSW in our Jest tests, we need to update our Jest setup file and configuration. First, let's update our Jest config to use the fixed JSDOM environment which works better with MSW. The standard JSDOM environment has issues with MSW's request interception, particularly with fetch requests and certain headers. The jest-fixed-jsdom package provides a patched version that properly supports MSW's network interception capabilities:

```javascript
// jest.config.js
module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testEnvironment: "jest-fixed-jsdom", // Use fixed JSDOM for better MSW v2 compatibility
  // other config options...
};
```

Next, we'll update our Jest setup file to initialize the MSW server:

```typescript
// setup-jest.ts
import "jest-preset-angular/setup-jest";
import { server } from "./src/mocks/server"; // Updated import path

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
```

## Testing the Star Wars Service with MSW v2 and Angular 18

Now, let's write a test for our Star Wars service using MSW v2 and Angular 18's new provider syntax. Here's how our updated test looks:

```typescript
// src/app/core/services/star-wars.service.spec.ts
import { TestBed } from "@angular/core/testing";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { StarWarsService } from "./star-wars.service";
import { firstValueFrom } from "rxjs";
import { server } from "../../../mocks/server"; // Updated import path
import { http, HttpResponse } from "msw";
import { environment } from "../../../environments/environment";

describe("StarWarsService", () => {
  let service: StarWarsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()), // Angular 18 functional providers
        StarWarsService,
      ],
    });
    service = TestBed.inject(StarWarsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should fetch characters", async () => {
    const response = await firstValueFrom(service.getCharacters());

    expect(response.results.length).toBe(2);
    expect(response.results[0].name).toBe("Luke Skywalker");
    expect(response.message).toBe("ok");
  });

  it("should fetch a specific character", async () => {
    const response = await firstValueFrom(service.getCharacter("1"));

    expect(response.result.name).toBe("Luke Skywalker");
    expect(response.result.properties.height).toBe("172");
    expect(response.message).toBe("ok");
  });

  it("should handle errors", async () => {
    // Override the handler just for this test
    server.use(
      http.get(`${environment.apiUrl}people`, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    try {
      await firstValueFrom(service.getCharacters());
      // Should not reach here
      fail("Expected error but got success");
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
```

## Configuring MSW v2 for Playwright E2E Tests

For Playwright E2E tests, we need a special setup to initialize MSW v2 in both the Node environment and inject it into the browser context. Let's create a dedicated setup file for Playwright with the updated MSW v2 imports:

```typescript
// e2e/setup/msw.setup.ts
import { test as base } from "@playwright/test";
import { setupServer } from "msw/node";
import { handlers } from "../../src/mocks/handlers"; // Updated import path

// Create MSW server instance
export const server = setupServer(...handlers);

// Define a custom test fixture that sets up MSW
export const test = base.extend({
  // Start MSW server before tests
  page: async ({ page }, use) => {
    // Start the MSW server before all tests
    server.listen({ onUnhandledRequest: "bypass" }); // Bypass unhandled requests in MSW v2

    // Add MSW enabled flag to browser context
    await page.addInitScript(() => {
      window.localStorage.setItem("useMSW", "true");
    });

    // Use the page with MSW enabled
    await use(page);

    // Clean up after tests
    server.close();
  },
});

// Export expect for convenience
export { expect } from "@playwright/test";
```

Next, we need to update our Playwright configuration to use this setup file and ensure we're using our MSW-enabled environment:

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";
import path from "path";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list", // Use list reporter instead of HTML for cleaner output
  use: {
    baseURL: "http://localhost:4200",
    trace: "on-first-retry",
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
    command: "npm run start:mocks", // Use our mocks-enabled start script
    url: "http://localhost:4200",
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // Increased timeout for slower machines
  },
});
```

We also need to make sure our environment configuration supports MSW toggling and update our main.ts file to conditionally load the MSW worker:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: "https://www.swapi.tech/api/",
  useMSW: true,
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: "https://www.swapi.tech/api/",
  useMSW: false,
};
```

```typescript
// src/main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";
import { environment } from "./environments/environment";

// Conditionally initialize MSW only in non-production or when explicitly enabled
if (environment.useMSW) {
  // Dynamic import to avoid loading MSW code in production
  import("./mocks/browser").then(({ worker }) => {
    worker.start({ onUnhandledRequest: "bypass" });
  });
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
```

## Writing E2E Tests with MSW

Now we can write E2E tests that use our mocked API. Here's our character list test using our custom MSW setup with stable data-testid selectors:

```typescript
// e2e/character-list.spec.ts
import { test, expect } from "./setup/msw.setup";
import { http, HttpResponse } from "msw";
import { server } from "./setup/msw.setup";

test("should display character list", async ({ page }) => {
  await page.goto("/characters");

  // Wait for the characters to load using data-testid
  await page.waitForSelector('[data-testid="character-list-heading"]', {
    timeout: 5000,
  });
  console.log("Character list heading found");

  // Check if Luke Skywalker is displayed
  const lukeCard = page.locator('mat-card-title:has-text("Luke Skywalker")');
  await expect(lukeCard).toBeVisible();
  console.log("Luke Skywalker card found");

  // Check if C-3PO is displayed
  const c3poCard = page.locator('mat-card-title:has-text("C-3PO")');
  await expect(c3poCard).toBeVisible();
  console.log("C-3PO card found");
});

test("should display error message when API fails", async ({ page }) => {
  // Override the handler just for this test
  server.use(
    http.get("https://www.swapi.tech/api/people", () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  await page.goto("/characters");

  // Check if error message is displayed
  const errorMessage = page.locator('[data-testid="error-message"]');
  await expect(errorMessage).toBeVisible({ timeout: 5000 });
  await expect(errorMessage).toContainText("Error loading characters");
});
```

## Directory Structure Organization

We've organized our mock files in a single `src/mocks` directory for better maintainability:

```
src/
└── mocks/         # All mock files in one place
    ├── handlers.ts
    ├── browser.ts
    └── server.ts
```

This clean structure makes imports consistent and avoids module resolution issues. All tests and the main application reference these files from the same location.

## Cosmic Compiler Summary

The Cosmic Compiler has guided us through the implementation of MSW for API mocking in our Angular 18 application. Let's review what we've accomplished:

- We've **installed MSW and its dependencies** including jest-fixed-jsdom for better compatibility
- We've **organized our mock files** in a single src/mocks directory for better organization
- We've **created handlers using the http namespace** for intercepting network requests
- We've **implemented HttpResponse.json()** for creating mock responses
- We've **configured Jest** to use jest-fixed-jsdom for better MSW compatibility
- We've **modernized our Angular tests** to use Angular 18's functional providers like provideHttpClient(withFetch())
- We've **improved our E2E tests** with stable data-testid selectors and better debugging
- We've **added conditional MSW initialization** in our main.ts to avoid loading MSW in production
- We've **configured our environment** to toggle MSW usage based on environment settings

> The Recursive Philosopher once said: "The best API is one you never have to call, and the best mock is one you never realize is a mock." The Cosmic Compiler nodded in approval, recognizing the paradoxical wisdom in testing what isn't there to ensure what is there works correctly.

_In our next transmission, we'll finally unveil the mystical DataSource pattern - the very foundation of our Galactic Archives. As the Ancient Order of Angular prophesied during that caffeine-fueled sprint review, "The DataSource shall bring balance to your component logic, separating the concerns of data retrieval from presentation."_

_May your mocks be realistic, your tests deterministic, and your Angular 18 applications blazingly fast._
