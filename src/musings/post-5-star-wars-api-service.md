---
layout: post.njk
title: "Galactic Archives - Star Wars API Service"
description: "Building a robust HTTP client service with TypeScript interfaces to interact with SWAPI endpoints and handle API response transformations"
date: 2025-06-05
tags:
  - http-client
  - api-service
  - typescript
  - interfaces
  - angular
  - star-wars
seriesId: galactic-archives
part: 5
github:
  org: aaronmaturen
  repo: galactic-archives
  tag: post-5
---

# Angular DataSource with SWAPI: Building the Galactic Archives - Star Wars API Service

_In a dimension where APIs communicate through quantum entanglement rather than HTTP requests, developers would still need to handle error states. Unfortunately, in our reality, we're stuck with REST endpoints, JSON parsing, and the occasional 503 Service Unavailable that arrives precisely when you're demoing to stakeholders._

## Establishing Contact with the SWAPI Galaxy

Before we can build our magnificent DataSource, we need a reliable communication channel to the Star Wars API (SWAPI). This will serve as the foundation for our Galactic Archives, providing the raw data we'll eventually transform and display.

The Ancient Order of Angular has long taught that proper service implementation follows three sacred principles: strong typing, robust error handling, and environment-specific configuration. Today, we'll honor these traditions.

## Creating Interfaces for Galactic Data

First, let's define the structure of our data using TypeScript interfaces. The Cosmic Compiler particularly appreciates well-defined types. We'll be using the swapi.tech API which has a slightly different structure than the original swapi.dev API:

```typescript
// src/app/models/character.model.ts
import { ApiResponse, ApiDetailResponse } from "./api-response.model";

// Character list item in results array
export interface CharacterListItem {
  uid?: string;
  name?: string;
  url?: string;
  // For expanded=true responses
  properties?: Character;
  description?: string;
  _id?: string;
  __v?: number;
}

// Full character details
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
  created: string;
  edited: string;
  url: string;
}

// src/app/models/api-response.model.ts
export interface ApiResponse {
  message: string;
  total_records: number;
  total_pages: number;
  previous: string | null;
  next: string | null;
  results: CharacterListItem[];
}

export interface ApiDetailResponse {
  message: string;
  result: {
    properties: Character;
    description: string;
    _id: string;
    uid: string;
    __v: number;
  };
}

// Export type aliases for our specific use cases
export type CharacterResponse = ApiResponse;
export type CharacterDetailResponse = ApiDetailResponse;
```

Notice how we've created separate interfaces for the list response and detail response. The swapi.tech API has a different structure than the original SWAPI, and we need to account for that. We've also added support for the `expanded=true` parameter, which allows us to get full character details in a single request.

## Setting Up Environment Configuration

The Council of Patterns has decreed that API URLs should never be hardcoded. Let's follow their wisdom by setting up environment-specific configuration:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: "https://www.swapi.tech/api/",
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: "https://www.swapi.tech/api/",
};
```

We're using the swapi.tech API, which is a modern implementation of the Star Wars API with some additional features like the `expanded=true` parameter. Notice that we include the trailing slash in the URL to ensure proper path construction when making API requests. This small detail prevents the Cosmic Compiler from unleashing its wrath upon us for URL formatting errors.

## Implementing the Star Wars Service

### Modern Dependency Injection with inject()

In our implementation, we're using Angular's modern `inject()` function instead of the traditional constructor injection. This approach was introduced in Angular 14 and is now the recommended way to handle dependency injection in Angular applications.

The `inject()` function offers several advantages:

- Cleaner code with less boilerplate
- Better tree-shaking potential
- More flexibility in how dependencies are injected
- Works better with standalone components and services

The Ancient Order of Angular has decreed that `inject()` shall be the preferred way forward, and the Cosmic Compiler has been observed to emit fewer warning photons when this pattern is used.

Now, let's create our service to interact with the swapi.tech API:

```typescript
// src/app/core/services/star-wars.service.ts
import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, retry, map } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { Character, CharacterListItem } from "../../models/character.model";
import {
  ApiResponse,
  ApiDetailResponse,
} from "../../models/api-response.model";

// Type aliases for our specific use cases
type CharacterResponse = ApiResponse<CharacterListItem>;
type CharacterDetailResponse = ApiDetailResponse<Character>;

@Injectable({
  providedIn: "root",
})
export class StarWarsService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient); // Using inject() instead of constructor injection

  // Fetch all characters with optional pagination
  getCharacters(page = 1): Observable<CharacterResponse> {
    // The Cosmic Compiler demands proper URL formatting
    return this.http
      .get<CharacterResponse>(
        `${this.apiUrl}people?page=${page}&limit=10&expanded=true`
      )
      .pipe(
        retry(2), // The Cosmic Compiler suggests retrying failed requests
        catchError(this.handleError)
      );
  }

  // Fetch a specific character by ID
  getCharacter(id: string): Observable<Character> {
    return this.http
      .get<CharacterDetailResponse>(`${this.apiUrl}people/${id}`)
      .pipe(
        retry(2),
        map((response: CharacterDetailResponse) => response.result.properties),
        catchError(this.handleError)
      );
  }

  // Search for characters by name
  searchCharacters(name: string): Observable<CharacterResponse> {
    return this.http
      .get<CharacterResponse>(`${this.apiUrl}people?name=${name}`)
      .pipe(catchError(this.handleError));
  }

  // Error handling method
  private handleError(error: HttpErrorResponse) {
    let errorMessage = "Unknown error!";
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
```

Our service provides three main methods:

1. `getCharacters()` - Fetches a paginated list of characters with expanded details
2. `getCharacter()` - Retrieves details for a specific character
3. `searchCharacters()` - Searches for characters by name

Notice the key improvements in our implementation:

- We use the `expanded=true` parameter to get full character details in a single request
- We include the `limit=10` parameter to ensure consistent pagination
- URL formatting is carefully handled to avoid double slashes (the apiUrl already includes a trailing slash)

The Ancient Order of Angular would be pleased with our implementation of reactive patterns and attention to API-specific details.

## Creating a Simple Display Component

To test our service, let's create a simple component to display character data. We'll place this in a feature module for Star Wars components:

```typescript
// src/app/features/star-wars/components/character-list/character-list.component.ts
import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatButtonModule } from "@angular/material/button";
import { StarWarsService } from "../../../../core/services/star-wars.service";
import { Character } from "../../../../models/character.model";
import { catchError, finalize, map, of } from "rxjs";

@Component({
  selector: "app-character-list",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  template: `
    <div class="tw-container tw-mx-auto tw-p-4">
      <h1 class="tw-text-2xl tw-font-bold tw-mb-4">Star Wars Characters</h1>

      <div *ngIf="loading" class="tw-flex tw-justify-center tw-my-8">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div
        *ngIf="error"
        class="tw-bg-red-100 tw-border-l-4 tw-border-red-500 tw-text-red-700 tw-p-4 tw-mb-4"
      >
        {{ error }}
      </div>

      <div
        class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4"
      >
        <mat-card
          *ngFor="let character of characters"
          class="tw-mb-4 tw-transition-all tw-duration-300 tw-hover:tw-shadow-xl"
        >
          <mat-card-header>
            <mat-card-title>{{ character.name }}</mat-card-title>
            <mat-card-subtitle
              >Birth Year: {{ character.birth_year }}</mat-card-subtitle
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
              <div class="tw-text-sm">
                <strong>Hair:</strong> {{ character.hair_color }}
              </div>
              <div class="tw-text-sm">
                <strong>Eyes:</strong> {{ character.eye_color }}
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions class="tw-flex tw-justify-end">
            <button mat-button color="primary">VIEW DETAILS</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="tw-flex tw-justify-center tw-mt-4">
        <button
          mat-button
          color="primary"
          [disabled]="loading || !hasNextPage"
          (click)="loadNextPage()"
        >
          LOAD MORE
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class CharacterListComponent implements OnInit {
  characters: Character[] = [];
  currentPage = 1;
  hasNextPage = false;
  loading = false;
  error = "";

  private starWarsService = inject(StarWarsService);

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.loading = true;
    this.error = "";

    this.starWarsService
      .getCharacters(this.currentPage)
      .pipe(
        catchError((error: Error) => {
          this.error = `Failed to load characters: ${error.message}. The Cosmic Compiler is displeased.`;
          return of({
            message: "error",
            results: [],
            total_records: 0,
            total_pages: 0,
            next: null,
            previous: null,
          });
        }),
        map((response) => {
          // Extract next page number from the next URL if it exists
          if (response.next) {
            const nextUrl = new URL(response.next);
            const nextPage = nextUrl.searchParams.get("page");
            if (nextPage) {
              this.currentPage = parseInt(nextPage) - 1; // Store the current page (next page - 1)
            }
          }

          this.hasNextPage = !!response.next;

          // With expanded=true, each result directly contains properties
          return response.results
            .map((item) => item.properties)
            .filter((char): char is Character => char !== undefined);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((characters) => {
        if (characters.length > 0) {
          this.characters = [...this.characters, ...characters];
        }
      });
  }

  loadNextPage(): void {
    if (this.hasNextPage && !this.loading) {
      this.currentPage++;
      this.loadCharacters();
    }
  }
}
```

## Registering Our Feature Module

To make our component accessible, we need to update our app routes:

```typescript
// src/app/app.routes.ts
import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", redirectTo: "characters", pathMatch: "full" },
  {
    path: "characters",
    loadComponent: () =>
      import(
        "./features/star-wars/components/character-list/character-list.component"
      ).then((m) => m.CharacterListComponent),
  },
];
```

## Setting Up the HTTP Client

Don't forget to provide the HttpClient in your app configuration:

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()), // The Cosmic Compiler demands HTTP capabilities
  ],
};
```

## Testing Our Implementation

With everything in place, let's run our application and see the results:

```bash
# Launch the application into hyperspace
ng serve
```

Navigate to `http://localhost:4200`, and you should see a list of Star Wars characters loaded from the API. The "Load More" button will fetch additional pages of data when clicked.

## Handling Pagination with swapi.tech API

One important aspect of our implementation is proper pagination handling. The swapi.tech API returns pagination information in a specific format that requires careful handling:

1. The API response includes a `next` property with the full URL for the next page
2. We extract the page number from this URL to ensure we're correctly tracking pagination
3. We include both `page` and `limit` parameters in our requests to ensure consistent results

```typescript
// Extract next page number from the next URL if it exists
if (response.next) {
  const nextUrl = new URL(response.next);
  const nextPage = nextUrl.searchParams.get("page");
  if (nextPage) {
    this.currentPage = parseInt(nextPage) - 1; // Store the current page (next page - 1)
  }
}
```

This approach ensures that our "Load More" button correctly fetches subsequent pages of data rather than repeatedly loading the first page.

## Using the expanded=true Parameter

Another key optimization in our implementation is the use of the `expanded=true` parameter. This allows us to get full character details in a single request, eliminating the need for additional API calls to fetch details for each character.

With this parameter, each result in the API response includes a `properties` object with all character details:

```typescript
// With expanded=true, each result directly contains properties
return response.results
  .map((item) => item.properties)
  .filter((char): char is Character => char !== undefined);
```

This significantly improves performance by reducing the number of HTTP requests needed to display character data.

## Cosmic Compiler Summary

- We've **created TypeScript interfaces** for the swapi.tech API response structure, pleasing the Cosmic Compiler with proper typing
- We've **implemented environment configuration** for API URLs, following the Council of Patterns' recommendations
- We've **built a robust Star Wars service** with proper error handling and pagination support
- We've **optimized API requests** using the expanded=true parameter to get full character details in a single request
- We've **created a component** with proper pagination handling to display character data
- We've **followed feature-based architecture principles** by organizing our code into core and feature modules

_In our next transmission, we'll explore the mystical art of API mocking with Mock Service Worker (MSW). The Dependency Demons often disrupt external API connections during testing, but MSW offers a powerful shield against their mischief. As the Recursive Philosopher might say, "To test an API service properly, one must first pretend the API doesn't exist at all."_

_May your HTTP requests return 200 OK, your observables never go unsubscribed, and your pagination always work correctly._
