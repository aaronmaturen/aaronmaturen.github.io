---
layout: post
title: "Angular DataSource with SWAPI: Building the Galactic Archives - Basic Project Setup"
description: "Setting up the foundation for our Angular project with the right tools and structure"
date: 2025-06-02
tags: ["angular", "project-setup", "step-1-basic-project-setup"]
seriesId: galactic-archives
part: 1
github:
  org: aaronmaturen
  repo: galactic-archive
  tag: post-1
---

# Angular DataSource with SWAPI: Building the Galactic Archives - Basic Project Setup

_In a universe where frameworks multiply faster than tribbles on a grain barge, setting up a new Angular project remains a ritual as ancient as the first `npm install`. Some say the Ancient Order of Angular created the CLI during a particularly productive full moon, while others insist it emerged fully formed from a quantum fluctuation in the npm registry._

## The Foundation of Our Galactic Archives

Before we can build our magnificent Star Wars data explorer, we need to establish a base of operations. Like any good rebel outpost, our project requires proper infrastructure, defensive shields (error handling), and a sleek command center (UI).

The Cosmic Compiler watches with interest as we lay the groundwork for what will become the most comprehensive archive of galactic data this side of the Outer Rim.

## Creating a New Angular Project

Let's summon the power of the Angular CLI to create our project:

```bash
# Invoke the ancient incantation to create a new Angular project with version 18
# The Cosmic Compiler appreciates descriptive project names
npm i -g @angular/cli@18.2.19
ng new galactic-archives --routing --style=scss --skip-tests=false --strict --standalone

# Navigate to the newly created dimensional pocket
cd galactic-archives
```

When prompted, answer "Yes" to Angular routing (we'll need hyperspace travel between components) and select SCSS as the stylesheet format (the Galactic Standards Committee strongly prefers it over plain CSS).

## Project Structure

The CLI has conjured a basic project structure for us, but we'll need to adapt it to follow the feature-based architecture prophecied in the TypeScript Prophecies:

```
galactic-archives/
├── src/
│   ├── app/
│   │   ├── app.routes.ts      // Standalone routing configuration
│   │   ├── app.config.ts      // Application configuration and providers
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   └── app.component.ts   // Standalone component
│   ├── assets/
│   ├── main.ts               // Application bootstrap
│   └── index.html
├── angular.json
├── package.json
└── tsconfig.json
```

## Installing Angular Material

No self-respecting galactic archive would be caught without the sleek, professional components of Angular Material. Let's add this to our arsenal:

```bash
# Summon the Material design entities to our dimension
ng add @angular/material
```

When prompted:

- Choose a theme (I recommend "Custom" for our Star Wars theme later)
- Select "Yes" for Angular Material typography
- Select "Yes" for browser animations

The Material setup wizard is like a helpful protocol droid—slightly annoying but ultimately saving you from hours of manual configuration.

## Adding Tailwind CSS

While Material provides excellent components, Tailwind CSS gives us the utility-first approach that the Council of Patterns has been advocating for eons. By prefixing Tailwind classes with `tw-`, we avoid conflicts with Material's styles while maintaining a clear separation of concerns. Material handles the complex components like tables and dialogs, while Tailwind handles spacing, colors, and responsive design without writing custom CSS. This combination lets us rapidly prototype layouts directly in templates while keeping our bundle size smaller by avoiding unnecessary custom styles. The Cosmic Compiler particularly appreciates this organized approach.

Here's a practical example of how Material and Tailwind work together in a component:

```html
<!-- Character card component using both Material and Tailwind -->
<mat-card
  class="tw-mb-4 tw-transition-all tw-duration-300 tw-hover:tw-shadow-xl"
>
  <mat-card-header>
    <mat-card-title class="tw-text-xl tw-font-bold tw-text-primary"
      >{{ character.name }}</mat-card-title
    >
    <mat-card-subtitle class="tw-text-secondary"
      >{{ character.species }}</mat-card-subtitle
    >
  </mat-card-header>

  <mat-card-content class="tw-py-2">
    <div class="tw-grid tw-grid-cols-2 tw-gap-2">
      <div class="tw-text-sm">
        <strong>Height:</strong> {{ character.height }}cm
      </div>
      <div class="tw-text-sm">
        <strong>Mass:</strong> {{ character.mass }}kg
      </div>
    </div>
  </mat-card-content>

  <mat-card-actions class="tw-flex tw-justify-end">
    <button mat-button color="primary" class="tw-font-medium">
      VIEW DETAILS
    </button>
    <button mat-icon-button class="tw-ml-2">
      <mat-icon>favorite_border</mat-icon>
    </button>
  </mat-card-actions>
</mat-card>
```

In this example, we're using Material's `mat-card` component structure while enhancing it with Tailwind's utility classes for spacing, transitions, hover effects, grid layout, and text styling - all without writing a single line of custom CSS.

```bash
# Install Tailwind CSS and its dependencies
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind CSS configuration
npx tailwindcss init
```

Now, let's configure Tailwind to work with our Angular project. Create or update the following files:

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "tw-", // The Galactic Standards Committee requires prefixing to avoid conflicts
  content: [
    "./src/**/*.{html,ts}", // Scan all our HTML and TypeScript files
  ],
  theme: {
    extend: {
      // We'll add our Star Wars theme colors later
      // The Void of Undefined currently occupies this space
    },
  },
  plugins: [],
};
```

Next, update your `src/styles.scss` file:

```scss
/* You can add global styles to this file, and also import other style files */
@tailwind base;
@tailwind components;
@tailwind utilities;

// The Ancient Order of Angular recommends keeping global styles minimal
// Most styling should be component-specific or utility-based
```

## Creating a Basic App Shell

Now, let's create a simple app shell with a header and footer. This will serve as the command center for our Galactic Archives:

```typescript
// app.component.ts
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "Galactic Archives"; // The name of our noble endeavor

  // The Cosmic Compiler appreciates well-named methods
  getCurrentYear(): number {
    return new Date().getFullYear(); // Time is an illusion, but copyright dates are not
  }
}
```

Update the HTML template:

```html
<!-- app.component.html -->
<div class="tw-flex tw-flex-col tw-min-h-screen">
  <!-- Header: Command center of our application -->
  <header class="tw-bg-gray-900 tw-text-white tw-p-4 tw-shadow-md">
    <div
      class="tw-container tw-mx-auto tw-flex tw-justify-between tw-items-center"
    >
      <h1 class="tw-text-xl tw-font-bold">{{ title }}</h1>
      <nav>
        <!-- Navigation will be added in a future episode -->
        <!-- The Inevitable Refactor looms on the horizon -->
      </nav>
    </div>
  </header>

  <!-- Main content area: Where the magic happens -->
  <main class="tw-container tw-mx-auto tw-flex-grow tw-p-4">
    <!-- Router outlet: A portal to other dimensions (components) -->
    <router-outlet></router-outlet>
  </main>

  <!-- Footer: Every good application needs a footer -->
  <footer class="tw-bg-gray-900 tw-text-white tw-p-4 tw-mt-auto">
    <div class="tw-container tw-mx-auto tw-text-center">
      <p>
        © {% raw %}{{ getCurrentYear() }}{% endraw %} Galactic Archives | Built
        with Angular by the Rebel Alliance
      </p>
    </div>
  </footer>
</div>
```

## Setting Up Standalone Components

Angular v18 uses the standalone components approach, which is a significant shift from the previous NgModule-based architecture. In the old days (pre-v14), components had to be declared in an NgModule before they could be used, creating a complex web of module dependencies that often led to what the Ancient Order called "ModuleMadness™".

With standalone components, each component declares its own dependencies directly, eliminating the need for NgModules in many cases. This means:

1. No more `declarations` arrays listing every component
2. No more importing feature modules just to use a single component
3. Direct imports of the components you need, when you need them
4. Simpler lazy-loading without module wrappers

Instead of having an `AppModule` with declarations, imports, and providers, we now have a more streamlined approach with `app.config.ts` handling application-wide providers and each component managing its own dependencies.

Let's update our `app.component.ts` to use the standalone approach and create a proper `app.config.ts`:

```typescript
// app.component.ts
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

// Import basic Material modules
// The Ancient Order of Angular recommends importing only what you need
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-root",
  standalone: true, // The Cosmic Compiler rejoices at standalone components
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "Galactic Archives"; // The name of our noble endeavor

  // The Cosmic Compiler appreciates well-named methods
  getCurrentYear(): number {
    return new Date().getFullYear(); // Time is an illusion, but copyright dates are not
  }
}
```

Now, let's create the application configuration file that sets up providers and bootstraps our app:

```typescript
// app.config.ts
import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";

import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(), // The Ancient Order requires animations for a proper UI experience
  ],
};
```

Finally, let's update the `main.ts` file to bootstrap our application:

```typescript
// main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error("The Cosmic Compiler encountered an error:", err)
);
```

## Running the Application

With our basic setup complete, let's fire up the hyperdrive and see our creation:

```bash
# Launch the application into development space
ng serve --open
```

If all goes well (and the Dependency Demons haven't been messing with your node_modules), your browser should open to `http://localhost:4200` displaying our basic Galactic Archives shell.

## Cosmic Compiler Summary

- We've **created a new Angular project** using the CLI, the preferred tool of the Ancient Order of Angular
- We've **installed Angular Material** for sleek, professional UI components
- We've **added Tailwind CSS** for utility-first styling with the `tw-` prefix to avoid conflicts
- We've **created a basic app shell** with header and footer using our new tools
- We've **set up the foundation** for our feature-based architecture

_In our next transmission, we'll establish proper code quality standards with ESLint and Prettier. The Galactic Standards Committee has been known to dispatch inspectors without warning, so we'd best be prepared. As the Recursive Philosopher says, "Good code is its own documentation, but good documentation is... good code?"_

_May your builds be swift and your runtime errors few._
