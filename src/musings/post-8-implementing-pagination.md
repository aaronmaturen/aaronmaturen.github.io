---
layout: post
title: "Angular DataSource with SWAPI: Building the Galactic Archives - Implementing Pagination"
description: "Adding pagination to our Star Wars character table using Angular Material's MatPaginator"
date: 2025-06-09
tags: ["angular", "pagination", "material", "step-8-implementing-pagination"]
seriesId: galactic-archives
part: 8
github:
  org: aaronmaturen
  repo: galactic-archive
  tag: post-8
---

# Angular DataSource with SWAPI: Building the Galactic Archives - Implementing Pagination

_The Cosmic Compiler once observed that data without pagination is like a library without shelves - technically functional but practically unusable. As our collection of galactic characters grows, we need a more sophisticated way to present and navigate through them._

## From Cards to Tables: A Galactic Upgrade

In our previous transmission, we implemented a basic DataSource to manage our Star Wars character data. We displayed this data using Material cards, which worked well for our initial prototype. However, as the Ancient Order of Angular teaches, "When data grows structured, tables become the way."

Today, we'll transition from our card-based layout to a powerful MatTable implementation, which will allow us to:

1. Display data in a structured, tabular format
2. Add pagination to navigate through large datasets
3. Prepare for sorting capabilities (coming in our next transmission)

> A padawan developer once complained to the Council of Patterns about having to refactor a card layout to a table. "But I've already built it!" they protested. The Council replied, "The code that cannot be refactored becomes the technical debt that cannot be repaid." The Cosmic Compiler, listening nearby, added a deprecation warning to the padawan's favorite component just to drive the point home.

## The Anatomy of a Galactic Table

Before diving into code, let's understand the key components we'll be working with:

1. **MatTable**: The core component that renders our data in rows and columns
2. **MatPaginator**: Controls navigation between pages of data
3. **DataSource**: Our existing class that will now feed data to the table

Think of MatTable as the viewport of a starship - it only shows a small portion of the vast galaxy at any given time. The MatPaginator is like the navigation system, allowing us to jump to different sectors of space. Our DataSource is the ship's computer, fetching and processing the star charts we need.

## Implementing MatTable

First, let's update our imports to include the necessary Material modules:

```typescript
// src/app/features/star-wars/components/character-list/character-list.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule, MatTable } from "@angular/material/table";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatPaginatorModule, MatPaginator } from "@angular/material/paginator";
import { MatIconModule } from "@angular/material/icon";
import { StarWarsService } from "../../../../core/services/star-wars.service";
import { GalacticDataSource } from "../../datasources/galactic.datasource";
import { Character } from "../../../../core/models/character.interface";
import { Subscription } from "rxjs";
```

Notice we've added several new imports:

- `MatTableModule` and `MatTable` for our table component
- `MatPaginatorModule` and `MatPaginator` for pagination
- `AfterViewInit` interface since we'll need to access the paginator after view initialization
- `ViewChild` which we'll use to get a reference to the paginator

> The Cosmic Compiler once remarked, "A component without proper imports is like a Jedi without a lightsaber - technically present but practically useless." Always double-check your imports before wondering why your component isn't working!

@Component({
selector: 'app-character-list',
standalone: true,
imports: [
CommonModule,
MatTableModule,
MatProgressSpinnerModule,
MatPaginatorModule,
MatIconModule
],

````

Here we're setting up our component as a standalone component with the necessary imports. This follows the modern Angular approach of using standalone components rather than NgModules for better tree-shaking and more explicit dependencies.

Now let's look at the template where most of the magic happens:

```typescript
  template: `
    <div class="tw-container tw-mx-auto tw-p-4">
      <h1 class="tw-text-2xl tw-font-bold tw-mb-4">Galactic Archives: Character Database</h1>

      <!-- Loading indicator -->
      <div *ngIf="loading" class="tw-flex tw-justify-center tw-my-8">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Error message display -->
      <div *ngIf="error" class="tw-bg-red-100 tw-border-l-4 tw-border-red-500 tw-text-red-700 tw-p-4 tw-mb-4">
        {{ error }}
      </div>
````

We start with a container for our component, a title, and handling for loading and error states. Notice we're using Tailwind CSS classes with the `tw-` prefix as per our project standards.

Next comes the table implementation:

```typescript
      <div class="tw-bg-gray-900 tw-rounded-lg tw-overflow-hidden tw-shadow-lg">
        <!-- The MatTable with our DataSource -->
        <table mat-table [dataSource]="dataSource" class="tw-w-full">
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef class="tw-text-yellow-400">
              <div class="tw-flex tw-items-center">
                <mat-icon class="tw-mr-1 tw-text-base tw-text-yellow-400">person</mat-icon>
                <span>NAME</span>
              </div>
            </th>
            <td mat-cell *matCellDef="let character" class="tw-text-yellow-400 tw-font-medium">
              {{ character.name }}
            </td>
          </ng-container>
```

Here we begin our table implementation using `mat-table` and binding it to our DataSource. For each column, we define a `matColumnDef` with a unique name that matches the property in our `displayedColumns` array. Each column has both a header cell (`th`) and a data cell (`td`) template.

Let's continue with the remaining columns:

```typescript
          <!-- Gender Column -->
          <ng-container matColumnDef="gender">
            <th mat-header-cell *matHeaderCellDef class="tw-text-yellow-400">
              <div class="tw-flex tw-items-center">
                <mat-icon class="tw-mr-1 tw-text-base tw-text-yellow-400">wc</mat-icon>
                <span>GENDER</span>
              </div>
            </th>
            <td mat-cell *matCellDef="let character">{{ character.gender }}</td>
          </ng-container>

          <!-- Birth Year Column -->
          <ng-container matColumnDef="birth_year">
            <th mat-header-cell *matHeaderCellDef class="tw-text-yellow-400">
              <div class="tw-flex tw-items-center">
                <mat-icon class="tw-mr-1 tw-text-base tw-text-yellow-400">cake</mat-icon>
                <span>BIRTH YEAR</span>
              </div>
            </th>
            <td mat-cell *matCellDef="let character">{{ character.birth_year }}</td>
          </ng-container>

          <!-- Height Column -->
          <ng-container matColumnDef="height">
            <th mat-header-cell *matHeaderCellDef class="tw-text-yellow-400">
              <div class="tw-flex tw-items-center">
                <mat-icon class="tw-mr-1 tw-text-base tw-text-yellow-400">height</mat-icon>
                <span>HEIGHT</span>
              </div>
            </th>
            <td mat-cell *matCellDef="let character">{{ character.height }}cm</td>
          </ng-container>
```

We follow the same pattern for each column, using appropriate icons that match the data being displayed. Notice how we're using the Star Wars yellow color theme with `tw-text-yellow-400` for headers.

Now we need to define how rows should be rendered:

```typescript
          <!-- Row definitions -->
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <!-- Row shown when there is no matching data -->
          <tr class="tw-mat-row" *matNoDataRow>
            <td class="tw-mat-cell tw-p-4 tw-text-center" colspan="4">
              <div class="tw-flex tw-flex-col tw-items-center tw-py-8">
                <mat-icon class="tw-text-4xl tw-text-gray-500 tw-mb-2">sentiment_very_dissatisfied</mat-icon>
                <span class="tw-text-gray-500">No characters found in the archives</span>
              </div>
            </td>
          </tr>
        </table>
```

The `*matHeaderRowDef` and `*matRowDef` directives tell Angular how to render the header and data rows. We also include a special template for when there's no data to display.

Finally, we add the paginator:

```typescript
        <!-- Pagination control -->
        <mat-paginator
          [length]="totalCharacters"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 20]"
          aria-label="Select page of characters">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .mat-mdc-row:nth-child(even) {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .mat-mdc-row:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .mat-mdc-cell, .mat-mdc-header-cell {
      color: rgba(255, 255, 255, 0.7);
      padding: 16px;
    }
  `]
})
```

We've added some styles to make our table look more like a Star Wars terminal - with subtle zebra striping, hover effects, and proper spacing. The dark background with light text gives it that "galactic database" feel.

> The Ancient Order of Angular teaches that "The user interface is the gateway to your application's soul." A well-styled table not only improves usability but creates an immersive experience that keeps users engaged with your data.

Now let's look at the component class implementation:

```typescript
export class CharacterListComponent implements OnInit, AfterViewInit, OnDestroy {
  // Properties for our table and pagination
  dataSource: GalacticDataSource;
  displayedColumns: string[] = ['name', 'gender', 'birth_year', 'height'];
  totalCharacters = 0;
  pageSize = 10;
  loading = false;
  error = '';

  // Reference to the paginator in our template
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // For managing all our subscriptions
  private subscriptions = new Subscription();

  constructor(private starWarsService: StarWarsService) {
    // Create our DataSource instance
    this.dataSource = new GalacticDataSource(this.starWarsService);
  }

  ngOnInit(): void {
    // Subscribe to loading state from our DataSource
    this.subscriptions.add(
      this.dataSource.loading$.subscribe(isLoading => {
        this.loading = isLoading;
      })
    );

    // Subscribe to count to determine total characters
    this.subscriptions.add(
      this.dataSource.count$.subscribe(count => {
        this.totalCharacters = count;
      })
    );

    // Initial data load
    this.loadCharacters();
  }
```

In `ngOnInit()`, we set up subscriptions to our DataSource's observables. This is where we connect the component's state to the DataSource's state. We're subscribing to:

1. `loading$` - to show/hide the loading spinner
2. `count$` - to update the total number of characters for the paginator

We also trigger the initial data load.

```typescript
  ngAfterViewInit(): void {
    // Connect paginator to the dataSource
    this.subscriptions.add(
      this.paginator.page.subscribe(event => {
        // Convert from 0-based to 1-based pagination for the API
        const apiPage = event.pageIndex + 1;
        this.loadCharacters(apiPage, event.pageSize);
      })
    );
  }
```

The `ngAfterViewInit()` lifecycle hook runs after Angular has fully initialized the component's view. This is important because we need to access the `paginator` reference which isn't available until the view is initialized. Here we subscribe to the paginator's page events to reload data when the user changes pages.

> The Council of Patterns warns: "Never access ViewChild references in ngOnInit() - they are undefined until the view is initialized. Many a padawan has fallen into this trap, leading to the dreaded 'undefined' errors in the console."

```typescript
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.unsubscribe();
  }
```

The `ngOnDestroy()` method is our cleanup phase. By unsubscribing from all subscriptions when the component is destroyed, we prevent memory leaks. The Recursive Philosopher once noted, "A component that does not clean up after itself is like a spaceship leaving debris in its wake - eventually, it will cause problems for future travelers."

```typescript
  loadCharacters(page: number = 1, pageSize: number = this.pageSize): void {
    this.error = '';
    try {
      // Update the page size if it changed
      this.pageSize = pageSize;

      // Tell our DataSource to load the characters for this page and page size
      this.dataSource.loadCharacters(page, pageSize);
    } catch (error) {
      this.error = `Failed to load characters: ${error instanceof Error ? error.message : 'Unknown error'}. The Cosmic Compiler is displeased.`;
    }
  }
}
```

## Updating the DataSource for Pagination

Now, let's enhance our GalacticDataSource to handle pagination properly. We'll build on the foundation we created in the previous post, adding new features specifically for pagination.

First, let's look at the imports and state management:

```typescript
// src/app/features/star-wars/datasources/galactic.datasource.ts
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, finalize } from 'rxjs';
import { Character } from '../../../core/models/character.interface';
import { StarWarsService } from '../../../core/services/star-wars.service';

export class GalacticDataSource extends DataSource<Character> {
  // Internal subjects to manage state
  private charactersSubject = new BehaviorSubject<Character[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private countSubject = new BehaviorSubject<number>(0);
  private pageSubject = new BehaviorSubject<number>(1); // Track current page
  private pageSizeSubject = new BehaviorSubject<number>(10); // Track page size

  // Public observables that components can subscribe to
  public loading$ = this.loadingSubject.asObservable();
  public count$ = this.countSubject.asObservable();
  public page$ = this.pageSubject.asObservable();
  public pageSize$ = this.pageSizeSubject.asObservable(); // Expose page size observable
```

The key addition here is the `pageSubject` which tracks the current page. This allows components to react to page changes and enables features like "current page" indicators. We expose this as a public observable `page$` that components can subscribe to.

> The Recursive Philosopher once said, "To truly understand state management, one must first understand that state is merely a snapshot of truth at a given moment in time." The Ancient Order of Angular nodded in agreement, then proceeded to create BehaviorSubject to make this philosophical concept concrete.

Next, let's look at the constructor and required DataSource methods:

```typescript
  constructor(private starWarsService: StarWarsService) {
    super();
  }

  connect(): Observable<Character[]> {
    return this.charactersSubject.asObservable();
  }

  disconnect(): void {
    this.charactersSubject.complete();
    this.loadingSubject.complete();
    this.countSubject.complete();
    this.pageSubject.complete();
    this.pageSizeSubject.complete(); // Complete page size subject to prevent memory leaks
  }
```

The `connect()` method remains the same as before - it's the bridge between our DataSource and the table. The `disconnect()` method now includes completing our new `pageSubject` to prevent memory leaks.

Now for the most important part - loading data with pagination:

```typescript
  /**
   * Load characters from the API with pagination
   * @param page The page number to load (1-based for SWAPI)
   * @param pageSize The number of items per page
   * @param filter Optional filter term
   */
  loadCharacters(page: number = 1, pageSize: number = this.pageSizeSubject.value, filter: string = ''): void {
    this.loadingSubject.next(true);
    this.pageSubject.next(page);
    this.pageSizeSubject.next(pageSize);

    // Log the request parameters for debugging
    console.log(`Loading characters: page=${page}, pageSize=${pageSize}`);

    // Always replace data when using pagination
    this.charactersSubject.next([]);

    const request$ = filter
      ? this.starWarsService.searchCharacters(filter)
      : this.starWarsService.getCharacters(page, pageSize);

    request$.pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: (response) => {
        this.charactersSubject.next(response.results);
        this.countSubject.next(response.count);
      },
      error: (error) => {
        console.error('Error loading characters:', error);
      }
    });
  }
```

There are several key changes in this method:

1. We update the `pageSubject` with the current page number
2. We clear the existing data by setting an empty array (`[]`) before loading new data
3. We use the page parameter in our service call to fetch the correct page of data

This is different from an "infinite scroll" approach where you would append new data to existing data. With pagination, we replace the entire dataset when changing pages.

Finally, let's add some utility methods to help with pagination:

```typescript
  /**
   * Get the current data without subscribing
   */
  getData(): Character[] {
    return this.charactersSubject.value;
  }

  /**
   * Get the current page number without subscribing
   */
  getCurrentPage(): number {
    return this.pageSubject.value;
  }

  /**
   * Get the current page size without subscribing
   */
  getCurrentPageSize(): number {
    return this.pageSizeSubject.value;
  }

  /**
   * Clear all data in the DataSource
   */
  clear(): void {
    this.charactersSubject.next([]);
    this.countSubject.next(0);
    this.pageSubject.next(1);
    this.pageSizeSubject.next(10); // Reset to default page size
  }
}
```

These helper methods allow components to:

1. Get the current data synchronously without subscribing
2. Check the current page number
3. Reset the DataSource to its initial state

These are particularly useful for testing and for handling edge cases like resetting filters.

## Updating the StarWarsService for Page Size Support

To fully support pagination with dynamic page sizes, we need to update our StarWarsService to accept and use the page size parameter when making API requests:

```typescript
// src/app/core/services/star-wars.service.ts
@Injectable({
  providedIn: "root", // The Ancient Order approves of this modern injection approach
})
export class StarWarsService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  // Fetch all characters with optional pagination and page size
  getCharacters(page = 1, pageSize = 10): Observable<CharacterResponse> {
    // The Cosmic Compiler demands proper URL formatting
    const url = `${this.apiUrl}people?page=${page}&limit=${pageSize}&expanded=true`;
    console.log(`API Request URL: ${url}`);

    return this.http.get<CharacterResponse>(url).pipe(
      retry(2), // The Cosmic Compiler suggests retrying failed requests
      catchError(this.handleError)
    );
  }
}
```

The key changes here are:

1. Adding a `pageSize` parameter with a default value of 10
2. Using this parameter in the URL construction with the `limit` query parameter
3. Adding logging to help debug pagination issues

## Understanding Pagination Differences

One important detail to note is that SWAPI uses 1-based pagination (pages start at 1), while Angular Material's MatPaginator uses 0-based pagination (pages start at 0). This inconsistency is a classic example of the integration challenges developers face when connecting different systems.

```typescript
// Converting from MatPaginator's 0-based index to SWAPI's 1-based index
const apiPage = event.pageIndex + 1;
```

> The Recursive Philosopher once pondered, "Is the first page page 0 or page 1? The answer depends not on mathematical truth but on which API you're consuming." The Ancient Order of Angular nodded sagely, having dealt with this exact inconsistency across countless projects. Legend has it that during the Great Framework Wars of 2015, entire development teams were torn apart over this very question.

This conversion is crucial because if we don't account for it, we'll always be one page off in our requests. For example, when the user clicks on page 2 in the UI (which is index 1 in MatPaginator), we need to request page 3 from SWAPI.

## Handling Pagination Events

The MatPaginator emits events when the user changes the page or page size. We subscribe to these events in the `ngAfterViewInit` lifecycle hook:

```typescript
ngAfterViewInit(): void {
  // Connect paginator to the dataSource
  this.paginator.page.subscribe(() => {
    this.loadCharacters();
  });
}
```

The `page` event contains valuable information:

- `pageIndex`: The current page index (0-based)
- `pageSize`: The number of items per page
- `length`: The total number of items
- `previousPageIndex`: The previous page index

By subscribing to this event, we create a reactive system where any user interaction with the paginator automatically triggers a data reload with the appropriate parameters.

## Managing State During Pagination

Unlike infinite scroll implementations where we append new data to existing data, with pagination we replace the entire dataset on each page change:

```typescript
loadCharacters(page: number = 1, filter: string = ''): void {
  this.loadingSubject.next(true);
  this.pageSubject.next(page);

  // Always replace data when using pagination
  this.charactersSubject.next([]);

  // ... rest of the method
}
```

This replacement approach has several benefits:

1. **Memory efficiency**: We only keep the current page in memory
2. **Simpler state management**: No need to track which items belong to which page
3. **Consistent with user expectations**: Users expect to see only the current page's data

> The Cosmic Compiler once witnessed a developer trying to implement pagination by keeping all pages in memory and just showing/hiding rows. It promptly crashed the developer's IDE and left a single error message: "The path to efficient pagination is not through hiding, but through loading only what is needed."

## Accessibility Considerations

Our implementation includes several accessibility features:

1. The paginator has an `aria-label` that describes its purpose
2. Table headers use proper `scope="col"` attributes
3. The loading spinner provides visual feedback during page transitions
4. Error messages are clearly displayed when issues occur

These considerations ensure that our galactic database is usable by all beings across the universe, regardless of their abilities or the assistive technologies they might be using.

## Testing Our Paginated Table

Let's run our application and see our new table with pagination in action:

```bash
ng serve
```

Navigate to `http://localhost:4200` and you should see:

1. A table displaying Star Wars characters with multiple columns
2. A paginator at the bottom showing the total number of records
3. The ability to navigate between pages
4. Options to change the page size

Try clicking through different pages and changing the page size. Notice how the DataSource handles these interactions smoothly, updating the display and maintaining the correct state.

## Cosmic Compiler Summary

- We've **transitioned from cards to a MatTable** for a more structured data display
- We've **added MatPaginator** to enable navigation through large datasets
- We've **updated our DataSource** to handle pagination properly with dynamic page sizes
- We've **enhanced our StarWarsService** to accept page size parameters
- We've **implemented reactive page size tracking** with BehaviorSubjects
- We've **handled the conversion** between 0-based and 1-based pagination
- We've **managed loading states** to provide feedback during page transitions
- We've **added proper error handling** to gracefully handle API failures

> The Council of Patterns once decreed: "A table without pagination is merely a list with delusions of grandeur." The Cosmic Compiler, ever the enforcer of good practices, has been known to mysteriously increase build times for applications that ignore this wisdom.

_In our next transmission, we'll enhance our table further by adding sorting capabilities. We'll implement client-side sorting for our data, allowing users to organize the Galactic Archives by various attributes like name, height, or birth year. The Ancient Order of Angular teaches that a well-organized archive is the mark of a civilized application._

_May your tables be paginated and your users never reach the dreaded "page 404"._
