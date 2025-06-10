---
layout: post
title: "Angular DataSource with SWAPI: Building the Galactic Archives - Feature-Based Architecture"
description: "Implementing a scalable feature-based architecture for our Angular application"
date: 2025-06-05
tags:
  [
    "angular",
    "architecture",
    "feature-modules",
    "step-4-feature-based-architecture",
  ]
seriesId: galactic-archives
part: 4
github:
  org: aaronmaturen
  repo: galactic-archive
  tag: post-4
---

# Angular DataSource with SWAPI: Building the Galactic Archives - Feature-Based Architecture

_In the chaotic early days of web development, applications grew like wild space fungi—unpredictable, messy, and occasionally toxic to those who maintained them. Developers would throw components, services, and modules into a single directory like they were tossing laundry into a black hole, hoping the compiler would sort it out. Narrator: it did not._

> The Ancient Order tells of a project called "The Monolith," a massive Angular application with a single 50,000-line app.module.ts file. When a junior developer asked why everything was in one module, the tech lead merely whispered, "Historical reasons," before staring vacantly into the distance. The project was eventually abandoned after it achieved sentience and began rejecting pull requests with snarky comments.

## The Problem with Architectural Entropy

As Angular applications grow, they tend toward chaos unless deliberately structured. Components multiply, services entangle, and dependencies form a web so complex that even the bravest developer fears making changes.

The Council of Patterns recognized this problem eons ago (or at least since Angular 2) and bestowed upon us the wisdom of **Feature-Based Architecture**—a structural approach that brings order to the chaos.

## What is Feature-Based Architecture?

Feature-based architecture organizes code around business features rather than technical functions. Instead of grouping all components together and all services elsewhere, we group by feature, creating clear boundaries and reducing cognitive load.

> The Cosmic Compiler once inquired why we would use feature-based architecture. I replied with "Imagine if your kitchen stored all knives in one drawer, all spoons in another room, and all ingredients in a separate building. That's technical organization. Feature-based is having everything you need for pasta in one place, everything for baking in another. When you're making spaghetti, you don't care about cake ingredients." The Cosmic Compiler nodded in approval at this explanation before continuing to judge my variable naming conventions.

## Creating Our Feature-Based Structure

Let's reorganize our application with a proper feature-based structure:

```
src/
├── app/
│   ├── core/              # Core services, guards, interceptors
│   ├── features/          # Feature modules
│   │   └── star-wars/     # Star Wars specific features
│   ├── shared/            # Shared components, directives, pipes
│   └── models/            # Interfaces and types
├── environments/          # Environment configuration
└── assets/                # Static assets
```

Think of this structure as a well-organized starship—each section has a specific purpose, but they all work together for a common mission.

## Core Module: The Engine Room

The Core module contains services and functionality used throughout the application but aren't specific to any feature. These are typically singleton services that should be loaded once when the application starts.

Let's create our Core module structure:

```bash
# Create core directory structure
mkdir -p src/app/core/services
mkdir -p src/app/core/interceptors
mkdir -p src/app/core/guards
```

Since we're using Angular v18 with standalone components, we don't need a CoreModule class, but we'll still organize our core services in this directory:

```typescript
// src/app/core/services/logging.service.ts
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class LoggingService {
  log(message: string): void {
    console.log(`[Galactic Archives] ${message}`);
  }

  error(message: string): void {
    console.error(`[Galactic Archives] ${message}`);
  }
}
```

## Features Directory: The Living Quarters

Features are the heart of our application—where the actual business logic lives. Each feature should be self-contained with its own components, services, and routes.

Let's set up our Star Wars feature:

```bash
# Create star-wars feature structure
mkdir -p src/app/features/star-wars/components
mkdir -p src/app/features/star-wars/services
```

Here's an example of a simple standalone component in our feature:

```typescript
// src/app/features/star-wars/components/character-list/character-list.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-character-list",
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div
      class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4"
    >
      <mat-card class="tw-mb-4">
        <mat-card-header>
          <mat-card-title>Luke Skywalker</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>A placeholder for our future Star Wars character data</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button>VIEW DETAILS</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
})
export class CharacterListComponent {}
```

## Shared Module: The Common Areas

The Shared module contains components, directives, and pipes used across multiple features. These are the reusable building blocks of our UI.

```bash
# Create shared directory structure
mkdir -p src/app/shared/components
mkdir -p src/app/shared/directives
mkdir -p src/app/shared/pipes
```

Let's create a simple loading spinner component:

```typescript
// src/app/shared/components/loading-spinner/loading-spinner.component.ts
import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: "app-loading-spinner",
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div
      class="tw-flex tw-justify-center tw-items-center tw-p-4"
      [class.tw-h-full]="fullHeight"
    >
      <mat-spinner [diameter]="diameter" [color]="color"></mat-spinner>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() diameter = 50;
  @Input() color: "primary" | "accent" | "warn" = "primary";
  @Input() fullHeight = false;
}
```

## Models: The Blueprint Archives

Models define the shape of our data. Clear interfaces make our code more predictable and enable better tooling support.

```bash
# Create models directory
mkdir -p src/app/models
```

Let's define some interfaces for our Star Wars data:

```typescript
// src/app/models/character.model.ts
export interface Character {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
}

// src/app/models/api-response.model.ts
export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
```

## Environment Configuration: The Control Panel

Environment configurations allow us to change settings based on where our application is running (development, staging, production).

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: "https://swapi.dev/api/",
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: "https://swapi.dev/api/",
};
```

## Routing with Feature-Based Architecture

With our feature-based architecture, we can organize routes to match our structure:

```typescript
// src/app/app.routes.ts
import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  {
    path: "home",
    loadComponent: () =>
      import("./features/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "characters",
    loadComponent: () =>
      import(
        "./features/star-wars/components/character-list/character-list.component"
      ).then((m) => m.CharacterListComponent),
  },
  { path: "**", redirectTo: "home" },
];
```

## Testing in a Feature-Based Architecture

Our feature-based architecture makes testing more intuitive since our tests are colocated with our features:

```typescript
// src/app/features/star-wars/components/character-list/character-list.component.spec.ts
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CharacterListComponent } from "./character-list.component";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

describe("CharacterListComponent", () => {
  let component: CharacterListComponent;
  let fixture: ComponentFixture<CharacterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterListComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
```

> The Cosmic Compiler once witnessed a developer trying to test a component with 47 dependencies. As the developer struggled to mock each one, the Compiler whispered, "Perhaps the problem isn't with your tests." The developer ignored this wisdom and continued adding mocks until the test file was larger than the actual application. Some say they're still adding mocks to this day, trapped in an infinite loop of dependency injection.

## Benefits of Feature-Based Architecture

This architecture provides several benefits:

1. **Scalability**: Features can grow independently without affecting others
2. **Maintainability**: Related code is grouped together, making it easier to understand
3. **Testability**: Clear boundaries make testing more straightforward
4. **Reusability**: Shared components can be used across features
5. **Lazy Loading**: Features can be loaded on demand, improving performance

## Cosmic Compiler Summary

- We've **created a feature-based architecture** with clear separation of concerns
- We've **organized our code** into core, features, shared, and models
- We've **set up environment configuration** for different deployment targets
- We've **created standalone components** that fit into our architecture
- We've **structured our routing** to align with our feature-based approach

_In our next transmission, we'll implement the Star Wars API service that will power our Galactic Archives. We'll leverage our new architecture to create a robust service layer that communicates with the SWAPI endpoints, handling errors and transforming data with the elegance of a Jedi Master._

_May your architecture be clean and your dependencies few._
