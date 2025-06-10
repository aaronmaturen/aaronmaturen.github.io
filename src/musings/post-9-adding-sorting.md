---
layout: post.njk
title: Adding Sorting Capabilities
description: Implementing client-side sorting with MatSort in our Angular DataSource
date: 2025-06-08
tags: angular, datasource, sorting, material
---

# Angular DataSource with SWAPI: Building the Galactic Archives - Adding Sorting Capabilities

*In the vast expanse of the Galactic Archives, chaos reigns when data lacks order. As any seasoned Imperial data analyst knows, the difference between finding a specific Jedi's record in seconds versus hours comes down to one critical feature: sorting. Today, we'll bring order to our galaxy of data.*

## The Unsorted Galaxy Problem

Our Galactic Archives have come a long way. We've implemented a robust DataSource pattern and added pagination to navigate through our vast collection of character records. But our users—primarily Imperial officers with tight schedules and low patience—have been filing complaints faster than stormtroopers miss blaster shots:

"How am I supposed to find the tallest potential recruits?"
"Can I sort by birth year to identify the most experienced operatives?"
"Why can't I organize these rebels alphabetically for my wanted posters?"

Without sorting capabilities, our otherwise impressive data table is like a library where books are shelved in the order they were published—technically functional but practically maddening.

> The Cosmic Compiler once reviewed an unsorted data table and simply printed: "A table without sorting is like a starship without navigation—you have the power to travel, but no control over your destination." The junior developer responsible was found the next day, still staring blankly at their monitor, muttering about "natural ordering" and "comparative algorithms."

## Enter MatSort: The Imperial Organizer

Angular Material's `MatSort` directive is our answer to this organizational chaos. It provides a standardized way to add sorting capabilities to tables with minimal effort. Think of it as the Imperial bureaucracy of data organization—rigid, efficient, and surprisingly effective when implemented correctly.

Let's start by updating our component imports to include the necessary sorting modules:

```typescript
// src/app/features/star-wars/components/character-list/character-list.component.ts
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort'; // Add this import
import { MatIconModule } from '@angular/material/icon';
import { StarWarsService } from '../../../../core/services/star-wars.service';
import { GalacticDataSource } from '../../datasources/galactic.datasource';
import { Character } from '../../../../core/models/character.interface';
import { Subscription } from 'rxjs';
```

Notice we've added `MatSortModule` and `MatSort` to our imports. The module provides the directives needed for sorting, while the `MatSort` class gives us a reference to the sorting state.

Next, we need to update our component's metadata to include the new module:

```typescript
@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule, // Add this import
    MatIconModule
  ],
  // ... template and styles
})
```

Now, let's add a `ViewChild` reference to capture the `MatSort` instance from our template:

```typescript
export class CharacterListComponent implements OnInit, AfterViewInit, OnDestroy {
  // Existing properties...
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; // Add this line
  
  // Rest of the component...
}
```

> The Ancient Order of Angular teaches that the `!` operator is not just a TypeScript non-null assertion but a solemn promise to the compiler that you, the developer, take full responsibility for any runtime null reference exceptions. "Use it wisely," they warn, "for with great assertion comes great debugging responsibility."

## Updating the Template

Now we need to update our template to include the sorting directives. This involves two key changes:

1. Adding the `matSort` directive to the table element
2. Adding `mat-sort-header` to each column header we want to be sortable

Here's how we update our table element:

```html
<table mat-table [dataSource]="dataSource" matSort class="tw-w-full">
```

The `matSort` directive tells Angular Material that this table should support sorting. Next, we need to update each column header that we want to be sortable. Let's modify our name column as an example:

```html
<!-- Name Column -->
<ng-container matColumnDef="name">
  <th mat-header-cell *matHeaderCellDef mat-sort-header class="tw-text-yellow-400">
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

Notice the addition of `mat-sort-header` to the `th` element. This transforms our plain header into a clickable sorting control. Let's do the same for our other columns:

```html
<!-- Gender Column -->
<ng-container matColumnDef="gender">
  <th mat-header-cell *matHeaderCellDef mat-sort-header class="tw-text-yellow-400">
    <div class="tw-flex tw-items-center">
      <mat-icon class="tw-mr-1 tw-text-base tw-text-yellow-400">wc</mat-icon>
      <span>GENDER</span>
    </div>
  </th>
  <td mat-cell *matCellDef="let character">{{ character.gender }}</td>
</ng-container>

<!-- Birth Year Column -->
<ng-container matColumnDef="birth_year">
  <th mat-header-cell *matHeaderCellDef mat-sort-header class="tw-text-yellow-400">
    <div class="tw-flex tw-items-center">
      <mat-icon class="tw-mr-1 tw-text-base tw-text-yellow-400">cake</mat-icon>
      <span>BIRTH YEAR</span>
    </div>
  </th>
  <td mat-cell *matCellDef="let character">{{ character.birth_year }}</td>
</ng-container>

<!-- Height Column -->
<ng-container matColumnDef="height">
  <th mat-header-cell *matHeaderCellDef mat-sort-header class="tw-text-yellow-400">
    <div class="tw-flex tw-items-center">
      <mat-icon class="tw-mr-1 tw-text-base tw-text-yellow-400">height</mat-icon>
      <span>HEIGHT</span>
    </div>
  </th>
  <td mat-cell *matCellDef="let character">{{ character.height }}cm</td>
</ng-container>
```

> A member of the Council of Patterns once remarked, "The beauty of declarative templates is that they hide the complexity of event binding and state management behind simple directives." Another council member replied, "Yes, until you need to debug them." The room fell silent as the Cosmic Compiler nodded in solemn agreement.

With these changes, our table headers now display sorting indicators and respond to clicks. But clicking them doesn't actually sort our data yet - we need to connect the sorting events to our DataSource.

## Connecting Sort Events to the DataSource

Now we need to update our component's `ngAfterViewInit` method to listen for sort events and trigger data reloading when they occur. We'll also need to reset pagination when sorting changes, as users typically expect to see the first page of newly sorted data.

```typescript
ngAfterViewInit(): void {
  // Connect paginator and sort to our datasource after view init
  if (this.paginator && this.sort) {
    // Reset to first page when sort changes
    this.subscription.add(
      this.sort.sortChange.subscribe(() => {
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
      })
    );
    
    // Merge sort and paginator events to reload data
    this.subscription.add(
      merge(this.sort.sortChange, this.paginator.page)
        .pipe(
          tap(() => this.loadCharacters(
            this.paginator.pageIndex + 1,
            this.paginator.pageSize,
            this.sort.active,
            this.sort.direction
          ))
        )
        .subscribe()
    );
  }
}
```

This code does two important things:

1. It resets the paginator to the first page whenever sorting changes
2. It merges the sort and paginator events into a single stream that triggers data loading

The `merge` operator from RxJS combines multiple observables into one, so we can react to either sort or paginate events with the same logic. The `tap` operator lets us execute a side effect (loading data) without affecting the stream.

We've also updated our `loadCharacters` method to pass the sort information to our DataSource:

```typescript
loadCharacters(
  page: number = 1, 
  pageSize: number = this.pageSize,
  sortField: string = '',
  sortDirection: string = ''
): void {
  this.error = '';
  try {
    // Update the page size if it changed
    this.pageSize = pageSize;
    // Let the DataSource handle loading the data with sort parameters
    this.dataSource.loadCharacters(page, sortField, sortDirection, pageSize);
  } catch (error) {
    this.error = `Failed to load characters: ${error instanceof Error ? error.message : 'Unknown error'}. The Cosmic Compiler is displeased.`;
  }
}
```

We've updated the method to extract the active sort column and direction from our `MatSort` instance, then pass those values to the DataSource.

> The Recursive Philosopher once pondered, "If a sort event triggers in a component, but no DataSource is listening, does it make a sound?" After three days of contemplation, they concluded: "No, but it does generate 17 console warnings about unhandled events."

## Updating the DataSource

Now comes the most important part: updating our `GalacticDataSource` to handle sorting. We need to modify the `loadCharacters` method to accept sort parameters and implement a custom sorting function.

First, let's update the method signature and implementation:

```typescript
// src/app/features/star-wars/datasources/galactic-datasource.ts
/**
 * Load characters from the API with pagination and sorting
 * @param page The page number to load (1-based for SWAPI)
 * @param sortField The field to sort by
 * @param sortDirection The direction to sort ('asc' or 'desc')
 * @param pageSize The number of items per page
 */
loadCharacters(
  page: number = 1, 
  sortField: string = '', 
  sortDirection: string = '', 
  pageSize: number = this.pageSizeSubject.value
): void {
  this.loadingSubject.next(true);
  this.pageSubject.next(page);
  this.pageSizeSubject.next(pageSize);
  
  // Update sort state
  if (sortField) {
    this.sortSubject.next({ active: sortField, direction: sortDirection as 'asc' | 'desc' });
  }

  // Log the request parameters for debugging
  console.log(`Loading characters: page=${page}, pageSize=${pageSize}, sort=${sortField}, direction=${sortDirection}`);

  // Clear current data when loading new page
  this.charactersSubject.next([]);

  const request = this.starWarsService
    .getCharacters(page, pageSize)
    .pipe(finalize(() => this.loadingSubject.next(false)));

  const subscription = request.subscribe({
    next: response => {
      // Get character data from response
      const characters = response.results
        .map(item => item.properties)
        .filter((char): char is Character => char !== undefined);
      
      // Apply client-side sorting if needed
      const sortedCharacters = this.applySorting(characters);
      
      // Update our subjects with the new data
      this.charactersSubject.next(sortedCharacters);
      this.countSubject.next(response.total_records);
    },
    error: error => {
      console.error('Error loading characters:', error);
      this.charactersSubject.next([]);
      this.countSubject.next(0);
      // Keep the current page and page size values to allow retry
      this.loadingSubject.next(false);
    },
  });

  // Add to our subscription for cleanup
  this.subscription.add(subscription);
}
```

The key change here is that we're now accepting `sortField` and `sortDirection` parameters, and applying client-side sorting to the data after we receive it from the API. This is necessary because the SWAPI doesn't support server-side sorting.

Next, we need to implement the `sortData` method that will handle the actual sorting logic:

```typescript
/**
 * Apply sorting to the character data
 * @param characters The array of characters to sort
 * @returns The sorted array
 */
private applySorting(characters: Character[]): Character[] {
  const sort = this.sortSubject.value;
  if (!sort || !sort.active || !sort.direction) {
    return characters;
  }

  return [...characters].sort((a, b) => {
    const sortField = sort.active;
    const sortDirection = sort.direction === 'asc' ? 1 : -1;
    
    // Handle nested properties (not needed for current model but included for extensibility)
    const getPropertyValue = (obj: any, path: string) => {
      return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null;
      }, obj);
    };
    
    // Get values to compare
    let valueA = getPropertyValue(a, sortField);
    let valueB = getPropertyValue(b, sortField);
    
    // Handle special cases for our data types
    if (sortField === 'height' || sortField === 'mass') {
      // Convert to numbers for numeric comparison, handling 'unknown' values
      valueA = valueA === 'unknown' ? -1 : parseFloat(valueA);
      valueB = valueB === 'unknown' ? -1 : parseFloat(valueB);
    } else if (sortField === 'birth_year') {
      // Handle 'BBY' (Before Battle of Yavin) format
      valueA = valueA === 'unknown' ? -99999 : parseFloat(valueA);
      valueB = valueB === 'unknown' ? -99999 : parseFloat(valueB);
    }
    
    // Compare the values
    if (valueA < valueB) {
      return -1 * sortDirection;
    }
    if (valueA > valueB) {
      return 1 * sortDirection;
    }
    return 0;
  });
}
```

This implementation does several important things:

1. It creates a copy of the data array before sorting to avoid mutating the original
2. It handles different data types appropriately (numbers vs. strings)
3. It supports nested properties through the `getPropertyValue` helper method
4. It applies the sort direction ('asc' or 'desc') to the comparison result

> The Ancient Order of Angular whispers of a time when developers had to write their own sort functions for every table. "The Great Sorting Crisis of 2014," they call it, when thousands of developers independently implemented the same bubble sort algorithm with slightly different bugs. The MatSort directive was created shortly thereafter, a beacon of hope in the darkness of manual DOM manipulation.

## Making Sort Headers Visually Distinct

While our sorting functionality works, we want to make the sort headers more visually distinct to improve the user experience. Let's add some custom styles to make them stand out and provide better feedback when interacting with them.

We can add these styles to our component:

```typescript
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
  
  /* Custom sort header styles */
  .mat-sort-header-container {
    align-items: center;
  }
  
  .mat-sort-header-arrow {
    color: #fbbf24 !important; /* tw-yellow-400 */
  }
  
  th.mat-header-cell.mat-sort-header:hover {
    background-color: rgba(251, 191, 36, 0.1); /* tw-yellow-400 with opacity */
    cursor: pointer;
  }
  
  th.mat-header-cell.mat-sort-header-sorted {
    background-color: rgba(251, 191, 36, 0.15); /* tw-yellow-400 with opacity */
  }
`]
```

These styles do several important things:

1. They make the sort arrow yellow to match our Star Wars theme
2. They add a subtle hover effect to sort headers
3. They highlight the currently active sort column with a background color
4. They ensure proper alignment of the sort header content

The Cosmic Compiler particularly appreciates when we maintain a consistent color theme throughout our application, so we're using the same `tw-yellow-400` color that we've been using for our text.

## Testing Our Sorting Implementation

To ensure our sorting works correctly, we should test it with different data types and edge cases. Here's a simple test we can add to our component spec file:

```typescript
// src/app/features/star-wars/components/character-list/character-list.component.spec.ts
it('should sort data when sort header is clicked', () => {
  // Arrange
  const fixture = TestBed.createComponent(CharacterListComponent);
  const component = fixture.componentInstance;
  const dataSourceSpy = spyOn(component.dataSource, 'loadCharacters').and.callThrough();
  fixture.detectChanges();
  
  // Act - simulate sort event
  const sortHeader = fixture.debugElement.query(By.css('th.mat-sort-header'));
  sortHeader.triggerEventHandler('click', {});
  fixture.detectChanges();
  
  // Assert
  expect(dataSourceSpy).toHaveBeenCalled();
  expect(component.paginator.pageIndex).toBe(0); // Should reset to first page
});
```

This test verifies that:
1. Clicking a sort header triggers the `loadCharacters` method
2. The paginator resets to the first page when sorting changes

## End-to-End Testing

Unit tests are great for verifying component logic, but we also need to ensure our sorting works correctly in a real browser environment. Let's add some e2e tests using Playwright to verify our sorting functionality:

```typescript
// e2e/sorting.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Character List Sorting', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the character list page
    await page.goto('/characters');
    
    // Wait for the table to be visible
    await page.waitForSelector('table', { timeout: 30000 });
  });

  test('should sort characters by name', async ({ page }) => {
    // Get the initial order of character names
    const initialNames = await page.$$eval('table tbody tr td:first-child', elements => 
      elements.map(el => el.textContent?.trim())
    );

    // Click on the name column header to sort
    await page.click('th:has-text("NAME")');

    // Wait for sorting to complete
    await page.waitForTimeout(1000);

    // Get the sorted order of character names
    const sortedNames = await page.$$eval('table tbody tr td:first-child', elements => 
      elements.map(el => el.textContent?.trim())
    );

    // Verify the names are in alphabetical order
    const sortedCopy = [...sortedNames];
    expect(sortedNames).toEqual(sortedCopy.sort());
  });

  test('should sort characters by height', async ({ page }) => {
    // Get the initial order of character heights
    const initialHeights = await page.$$eval('table tbody tr td:nth-child(4)', elements => 
      elements.map(el => el.textContent?.trim())
    );

    // Click on the height column header to sort
    await page.click('th:has-text("HEIGHT")');

    // Wait for sorting to complete
    await page.waitForTimeout(1000);

    // Extract numeric values for comparison (remove 'cm' and convert to numbers)
    const getNumericHeight = (h: string | undefined) => parseFloat(h?.replace('cm', '') || '0');
    
    // Get the sorted heights after clicking the header
    const sortedHeights = await page.$$eval('table tbody tr td:nth-child(4)', elements => 
      elements.map(el => el.textContent?.trim())
    );
    
    // Verify the heights are in ascending numeric order
    const currentHeights = sortedHeights.map(getNumericHeight);
    const sortedCopy = [...currentHeights].sort((a, b) => a - b);
    expect(currentHeights).toEqual(sortedCopy);
  });
});
```

These tests verify that:
1. Clicking on the name column header sorts the names alphabetically
2. Clicking on the height column header sorts the heights numerically
3. The sorting works correctly for both string and numeric data

> The Cosmic Compiler reminds us: "End-to-end tests are your final defense against the chaos of production. They verify not just that your code works in isolation, but that all the pieces work together as a harmonious whole."

## Server-Side Sorting Support

> **Technical Note:** The actual SWAPI (Star Wars API) doesn't natively support sorting parameters. In a production environment, you'd either need to implement client-side sorting or use a backend proxy that adds sorting capabilities. For our tutorial, we've implemented sorting in our MSW mocks to simulate how a real API with sorting support would work.

To ensure our sorting works with real API calls, we need to update our mock handlers to support sorting parameters:

```typescript
// src/mocks/handlers.ts
// Get sort parameters if they exist
const sortField = url.searchParams.get('sort_by');
const sortDirection = url.searchParams.get('sort_direction');

// Sort the characters if sort parameters are provided
let sortedCharacters = [...characters];
if (sortField && sortDirection) {
  sortedCharacters.sort((a, b) => {
    // Use type assertion to handle property access
    const aValue = a.properties[sortField as keyof typeof a.properties];
    const bValue = b.properties[sortField as keyof typeof b.properties];
    
    // Handle numeric sorting
    if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
      return sortDirection === 'asc' 
        ? Number(aValue) - Number(bValue) 
        : Number(bValue) - Number(aValue);
    }
    
    // Handle string sorting
    return sortDirection === 'asc' 
      ? String(aValue).localeCompare(String(bValue)) 
      : String(bValue).localeCompare(String(aValue));
  });
}
```

This mock handler implementation ensures that our API mocks properly support sorting, making our e2e tests more realistic and reliable.

We also need to update our `StarWarsService` to pass the sorting parameters to the API:

```typescript
// src/app/core/services/star-wars.service.ts
getCharacters(
  page: number = 1,
  limit: number = 10,
  sortField: string = '',
  sortDirection: string = ''
): Observable<ApiResponse<Character>> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString())
    .set('expanded', 'true');
    
  // Add sort parameters if provided
  if (sortField) {
    params = params.set('sort_by', sortField);
  }
  
  if (sortDirection) {
    params = params.set('sort_direction', sortDirection);
  }
  
  return this.http.get<ApiResponse<Character>>(`${this.apiUrl}people`, { params });
}
```

Finally, we update our `GalacticDataSource` to pass the sorting parameters to the service:

```typescript
// src/app/features/star-wars/datasources/galactic-datasource.ts
loadCharacters(
  page: number = 1, 
  sortField: string = '', 
  sortDirection: string = '', 
  pageSize: number = this.pageSizeSubject.value
): void {
  this.loadingSubject.next(true);
  this.pageSubject.next(page);
  this.pageSizeSubject.next(pageSize);
  
  if (sortField) {
    this.sortSubject.next({ active: sortField, direction: sortDirection as 'asc' | 'desc' });
  }
  
  const request = this.starWarsService
    .getCharacters(page, pageSize, sortField, sortDirection)
    .pipe(finalize(() => this.loadingSubject.next(false)));
  
  // Handle the response...
}
```

## Cosmic Compiler Summary

- We've **implemented client-side sorting** with MatSort for our Galactic Archives table
- We've **handled different data types** in our sort function (strings vs. numbers)
- We've **dealt with nested properties** in our character objects
- We've **made sort headers visually distinct** with custom styling
- We've **connected sorting with pagination** to create a seamless user experience
- We've **added e2e tests** to verify sorting functionality in a real browser environment
- We've **implemented server-side sorting support** in our mock handlers

> The Cosmic Compiler reviewed our sorting implementation and, after a tense moment of silence, nodded approvingly. "The code respects both the data and the user," it whispered. "It handles edge cases gracefully and maintains visual consistency." The junior developers in the room let out a collective sigh of relief. The Compiler's approval is rare and precious.

## Next Steps

With sorting and pagination in place, our Galactic Archives are becoming increasingly powerful. But users are demanding more control over the data they see. In our next transmission, we'll implement filtering capabilities to allow users to search for specific characters based on various criteria. Prepare your quantum processors for "Part 10: Implementing Advanced Filtering" - where we'll teach our DataSource to sift through the noise and find the droids you're looking for.

Until then, may your builds be green and your runtime errors few.
