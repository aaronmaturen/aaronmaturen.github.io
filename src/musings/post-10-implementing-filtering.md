---
layout: post.njk
title: "Galactic Archives - Implementing Filtering"
description: "Building advanced search filters with dynamic query parameters to filter Star Wars characters by species, homeworld, and other attributes"
date: 2025-06-10
tags:
  - filtering
  - search
  - query-parameters
  - angular
  - reactive-forms
  - star-wars
seriesId: galactic-archives
part: 10
github:
  org: aaronmaturen
  repo: galactic-archives
  tag: post-10
---

# Angular DataSource with SWAPI: Building the Galactic Archives - Implementing Advanced Filtering

_In the vastness of the galactic archives, finding specific information without proper filtering is like searching for a specific grain of sand on Tatooine. As our collection of character data grows, we need more sophisticated ways to sift through it all._

> The Cosmic Compiler once remarked that a table without filtering is merely a static display of data, not much different from ancient scrolls carved in stone. "True power," it whispered, "comes from giving users control over what they see."

## The Need for Filtering

With pagination and sorting in place, our Galactic Archives are becoming increasingly useful. But our users—rebel intelligence officers, imperial bureaucrats, and curious padawans alike—need to quickly find specific characters based on various attributes. They might want to find all human characters, or everyone from a specific planet, or perhaps all characters above a certain height.

In this transmission, we'll implement advanced filtering capabilities that will allow users to:

1. Filter by text across multiple fields
2. Apply debouncing to prevent excessive API calls
3. Integrate filtering with our existing pagination and sorting

Let's begin by adding a search input to our component template.

## Adding the Search Input

First, we'll add a search input above our table:

```html
<div class="tw-mb-4 tw-flex tw-items-center">
  <mat-form-field class="tw-w-full">
    <mat-label>Search Characters</mat-label>
    <input
      matInput
      [formControl]="searchControl"
      placeholder="Search by name, gender, etc."
      aria-label="Search characters"
    />
    <mat-icon matPrefix class="tw-mr-2 tw-text-yellow-400">search</mat-icon>
    <button
      *ngIf="searchControl.value"
      matSuffix
      mat-icon-button
      aria-label="Clear"
      (click)="clearSearch()"
    >
      <mat-icon>close</mat-icon>
    </button>
  </mat-form-field>
</div>
```

This search input uses Angular Material's `mat-form-field` with a few key features:

- A search icon prefix using `matPrefix`
- A clear button that appears only when there's text in the input
- Proper ARIA labels for accessibility
- Tailwind CSS classes prefixed with `tw-` for styling

> The Ancient Order of Angular teaches that inputs without proper accessibility attributes are like lightsabers without handles—dangerous to everyone involved and likely to cause harm in unexpected ways.

## Setting Up the Form Control

Next, we need to update our component class to handle the search functionality. We'll use a `FormControl` to manage the search input's state and value:

```typescript
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

// Inside the component class
searchControl = new FormControl('');

ngOnInit(): void {
  // Set up search with debouncing
  this.searchControl.valueChanges.pipe(
    debounceTime(300), // Wait 300ms after the last event before emitting
    distinctUntilChanged(), // Only emit if value has changed
    tap((value) => {
      this.paginator.pageIndex = 0; // Reset to first page on new search
      this.loadCharacters();
    })
  ).subscribe();
}

clearSearch(): void {
  this.searchControl.setValue('');
}
```

This implementation includes several important features:

1. **Debouncing** with `debounceTime(300)` to prevent excessive API calls while the user is typing
2. **Distinct values only** with `distinctUntilChanged()` to avoid redundant searches
3. **Page reset** to ensure users see the first page of filtered results
4. A **clear search method** that resets the search input

Don't forget to import the ReactiveFormsModule in your component:

```typescript
// In component metadata
imports: [
  // ... other imports
  ReactiveFormsModule,
];
```

## Updating the DataSource

Now we need to modify our `loadCharacters` method to include the search term:

```typescript
loadCharacters(): void {
  this.error = '';
  // Get current page, sort, and filter information
  const pageIndex = this.paginator?.pageIndex ?? 0;
  const pageSize = this.paginator?.pageSize ?? this.pageSize;
  const sortActive = this.sort?.active ?? '';
  const sortDirection = this.sort?.direction ?? '';
  const filter = this.searchControl?.value ?? '';

  // SWAPI uses 1-based pagination, but MatPaginator is 0-based
  const swapiPage = pageIndex + 1;

  // Tell our DataSource to load the characters with all parameters
  this.dataSource.loadCharacters(swapiPage, sortActive, sortDirection, filter);
}
```

We've updated the method to extract the filter value from our search control and pass it to the DataSource.

## Enhancing the GalacticDataSource

Finally, we need to update our `GalacticDataSource` to handle filtering. The SWAPI API actually supports searching by name using the `name=` parameter (not `search=` as you might expect), so we'll use that for server-side filtering when possible. We also need to handle the different response structure that comes back from search queries versus regular queries:

```typescript
// src/app/features/star-wars/datasources/galactic.datasource.ts
/**
 * Load characters from the API with pagination, sorting, and filtering
 * @param page The page number to load (1-based for SWAPI)
 * @param sortField The field to sort by
 * @param sortDirection The direction to sort ('asc' or 'desc')
 * @param filter Optional filter term
 */
loadCharacters(page: number = 1, sortField: string = '', sortDirection: string = '', filter: string = ''): void {
  this.loadingSubject.next(true);
  this.pageSubject.next(page);

  // Always replace data when using pagination or filtering
  this.charactersSubject.next([]);

  // SWAPI API supports searching by name using the 'name=' parameter
  const request$ = filter
    ? this.starWarsService.searchCharacters(filter, page, this.pageSizeSubject.value, sortField, sortDirection)
    : this.starWarsService.getCharacters(page, this.pageSizeSubject.value, sortField, sortDirection);

  request$.pipe(
    finalize(() => this.loadingSubject.next(false))
  ).subscribe({
    next: (response) => {
      let characters: Character[] = [];
      let totalCount = 0;

      // Handle different response structures for search vs regular queries
      if ('result' in response && Array.isArray(response.result)) {
        // Search response structure
        characters = response.result
          .map(item => item.properties)
          .filter((char): char is Character => char !== undefined);

        totalCount = characters.length;
      } else if ('results' in response && Array.isArray(response.results)) {
        // Regular response structure
        characters = response.results
          .map(item => item.properties)
          .filter((char): char is Character => char !== undefined);

        totalCount = response.total_records || 0;
      }

      // Apply client-side sorting if sort parameters are provided
      if (sortField && sortDirection) {
        characters = this.sortData(characters, sortField, sortDirection);
      }

      this.charactersSubject.next(characters);
      this.countSubject.next(totalCount);
    },
    error: (error) => {
      console.error('Error loading characters:', error);
    }
  });
}

/**
 * Filter data client-side based on the provided filter term
 * @param data The array of characters to filter
 * @param filterTerm The term to filter by
 * @returns The filtered array
 */
private filterData(characters: Character[], filterTerm: string): Character[] {
  const term = filterTerm.toLowerCase().trim();

  return characters.filter(character => {
    // Check common text fields
    if (
      character.name.toLowerCase().includes(term) ||
      character.gender.toLowerCase().includes(term) ||
      character.birth_year.toLowerCase().includes(term) ||
      character.eye_color.toLowerCase().includes(term) ||
      character.hair_color.toLowerCase().includes(term) ||
      character.skin_color.toLowerCase().includes(term)
    ) {
      return true;
    }

    // Check numeric fields (convert to string first)
    if (
      String(character.height).includes(term) ||
      String(character.mass).includes(term)
    ) {
      return true;
    }

    return false;
  });
}
```

This implementation:

1. Uses the SWAPI search endpoint when a filter is provided
2. Applies additional client-side filtering to check other fields
3. Maintains compatibility with our existing sorting functionality

> A member of the Council of Patterns once said, "The true power of the DataSource pattern is revealed when filtering, sorting, and pagination work in harmony." Another council member replied, "Yes, but the true test is how it handles the edge cases." The room fell silent as everyone contemplated that one user who would inevitably search for "Skywalker" while sorting by height in descending order on page 3.

## Testing Our Filtering Implementation

To ensure our filtering works correctly, we should add a test:

```typescript
// src/app/features/star-wars/components/character-list/character-list.component.spec.ts
it("should filter data when search input changes", fakeAsync(() => {
  // Arrange
  const fixture = TestBed.createComponent(CharacterListComponent);
  const component = fixture.componentInstance;
  const dataSourceSpy = spyOn(
    component.dataSource,
    "loadCharacters"
  ).and.callThrough();
  fixture.detectChanges();

  // Act - simulate search input
  component.searchControl.setValue("Luke");
  tick(300); // Wait for debounce time
  fixture.detectChanges();

  // Assert
  expect(dataSourceSpy).toHaveBeenCalled();
  expect(component.paginator.pageIndex).toBe(0); // Should reset to first page

  // Check that the last call included the search term
  const lastCall = dataSourceSpy.calls.mostRecent();
  expect(lastCall.args[3]).toBe("Luke"); // The 4th argument should be the filter term
}));
```

This test verifies that:

1. Changing the search input triggers the `loadCharacters` method
2. The paginator resets to the first page when filtering changes
3. The search term is correctly passed to the DataSource

## Enhancing the UI for Filtering

Let's add some visual feedback to show when filtering is active:

```html
<div
  class="tw-mb-2 tw-flex tw-justify-between tw-items-center"
  *ngIf="searchControl.value"
>
  <span class="tw-text-yellow-400">
    <mat-icon class="tw-align-middle tw-mr-1">filter_list</mat-icon>
    Filtering results for "{{ searchControl.value }}"
  </span>
  <button mat-button color="accent" (click)="clearSearch()">
    Clear Filter
  </button>
</div>
```

This adds a helpful message showing the current filter term and provides another way to clear the filter.

## Cosmic Compiler Summary

- We've **implemented advanced filtering** for our Galactic Archives table
- We've **added debouncing** to prevent excessive API calls while typing
- We've **integrated filtering with pagination and sorting** for a seamless experience
- We've **enhanced the UI** with visual feedback for active filters
- We've **maintained accessibility** with proper ARIA labels and keyboard support
- We've **handled different API response structures** for search vs regular queries
- We've **used the correct `name=` parameter** for SWAPI search functionality

> The Cosmic Compiler reviewed our filtering implementation with unusual interest. "A proper search function," it noted, "is the difference between a data dump and a useful tool." It paused, then added, "The debouncing is particularly elegant—not triggering API calls with every keystroke shows respect for both the server and the user." Several junior developers frantically scribbled notes, having never before heard the Compiler use the word "elegant."

## Next Steps

With filtering, sorting, and pagination in place, our Galactic Archives have become a powerful tool for exploring the Star Wars universe. But there's still more we can do to enhance the user experience. In our next transmission, we'll implement keyboard navigation and accessibility improvements to ensure our application is usable by all beings across the galaxy, regardless of their input methods or assistive technologies.

Until then, may your builds be green and your runtime errors few.
