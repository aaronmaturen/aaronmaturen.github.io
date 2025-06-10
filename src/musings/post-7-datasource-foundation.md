---
layout: post.njk
title: "Galactic Archives - Datasource"
description: "Creating a custom Angular DataSource implementation with reactive state management to handle complex Star Wars API data flows"
date: 2025-06-01
tags:
  - datasource
  - rxjs
  - state-management
  - angular
  - typescript
  - star-wars
seriesId: galactic-archives
part: 7
github:
  org: aaronmaturen
  repo: galactic-archives
  tag: post-7
---

# Angular DataSource with SWAPI: Building the Galactic Archives - DataSource Foundation

_After six transmissions of preparation, we finally arrive at the core of our mission: implementing the legendary DataSource pattern. The Ancient Order of Angular's sacred texts describe it as "the separation that brings clarity" - a pattern designed to bring balance to the chaotic realm of data management in components._

## The Component Data Problem

Before diving into the DataSource pattern, let's understand the problem it solves. In typical Angular applications, components often:

1. Fetch data directly from services
2. Manage loading states
3. Handle pagination logic
4. Track error states
5. Implement sorting and filtering

This leads to bloated components that violate the Single Responsibility Principle faster than a Sith Lord violates peace treaties.

> The Cosmic Compiler once reviewed a component that was handling API calls, pagination, sorting, filtering, and rendering all in one file. It simply printed "No" in the terminal and refused to compile further. Some say that component still sits in a forgotten git branch, a cautionary tale for those who dare to mix concerns.

## Enter the DataSource Pattern

The DataSource pattern separates data management from presentation concerns. It's an abstraction that:

1. Manages data fetching and state
2. Handles pagination, sorting, and filtering
3. Exposes observables that components can subscribe to
4. Centralizes data-related logic

Angular's CDK (Component Development Kit) provides a `DataSource` abstract class that we can extend to create our own implementation.

## Creating the GalacticDataSource

Let's implement our `GalacticDataSource` class that will power the Galactic Archives:

```typescript
// src/app/features/star-wars/datasources/galactic-datasource.ts
import { DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { Character } from "../../../models/character.model";
import { StarWarsService } from "../../../core/services/star-wars.service";

export class GalacticDataSource extends DataSource<Character> {
  // Internal subjects to manage state
  private charactersSubject = new BehaviorSubject<Character[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private countSubject = new BehaviorSubject<number>(0);
  private subscription = new Subscription();

  // Public observables that components can subscribe to
  public loading$ = this.loadingSubject.asObservable();
  public count$ = this.countSubject.asObservable();

  constructor(private starWarsService: StarWarsService) {
    super();
  }

  /**
   * The connect method is called by the table to retrieve the data.
   * This method is part of the DataSource API and is called when the table
   * needs the data to display.
   */
  connect(): Observable<Character[]> {
    // Return the observable that emits the data
    return this.charactersSubject.asObservable();
  }

  /**
   * The disconnect method is called when the table is destroyed.
   * This method is part of the DataSource API and is called when the table
   * is removed from the DOM.
   */
  disconnect(): void {
    // Clean up subscriptions and complete subjects
    this.charactersSubject.complete();
    this.loadingSubject.complete();
    this.countSubject.complete();
    this.subscription.unsubscribe();
  }

  /**
   * Load characters from the API
   * @param page The page number to load
   */
  loadCharacters(page: number = 1): void {
    this.loadingSubject.next(true);

    this.subscription.add(
      this.starWarsService.getCharacters(page).subscribe({
        next: (response) => {
          // Extract characters from the response
          const characters = response.results.map((item) => item.properties);

          // Update our subjects with the new data
          this.charactersSubject.next(characters);
          this.countSubject.next(response.total_records);
          this.loadingSubject.next(false);
        },
        error: () => {
          // Handle errors
          this.loadingSubject.next(false);
        },
      })
    );
  }
}
```

## Understanding the DataSource Lifecycle

The `DataSource` abstract class requires us to implement two key methods:

### 1. connect()

This method is called when a component (typically a table or list) connects to the DataSource. It should return an Observable that emits the data to be displayed. In our implementation, we return the `charactersSubject` as an observable.

```typescript
connect(): Observable<Character[]> {
  return this.charactersSubject.asObservable();
}
```

### 2. disconnect()

This method is called when the component disconnects from the DataSource (usually when the component is destroyed). It's our chance to clean up any subscriptions or resources to prevent memory leaks.

```typescript
disconnect(): void {
  this.charactersSubject.complete();
  this.loadingSubject.complete();
  this.countSubject.complete();
}
```

> A wise member of the Council of Patterns once said: "A DataSource that doesn't properly implement disconnect() is like a Jedi who doesn't turn off their lightsaber - eventually, something's going to get burned." The Recursive Philosopher added: "And that something is usually your application's memory."

## Exposing Observables for Components

One of the key benefits of the DataSource pattern is that it exposes observables that components can subscribe to. This allows components to reactively update when data changes.

```typescript
// Internal subjects (private)
private charactersSubject = new BehaviorSubject<Character[]>([]);
private loadingSubject = new BehaviorSubject<boolean>(false);
private countSubject = new BehaviorSubject<number>(0);

// Public observables (components subscribe to these)
public loading$ = this.loadingSubject.asObservable();
public count$ = this.countSubject.asObservable();
```

Note that we expose the subjects as observables using the `asObservable()` method. This prevents components from directly calling `next()` on our subjects, maintaining proper encapsulation.

## Using BehaviorSubject for State Management

We use `BehaviorSubject` rather than regular `Subject` because:

1. It requires an initial value, ensuring subscribers always get a value
2. It caches the latest value, so new subscribers immediately receive the current state
3. It works perfectly for representing the current state of our data

This is particularly useful for UI components that need to know the current state when they initialize.

## Basic Usage in a Component

Here's a simple example of how a component would use our DataSource:

```typescript
// src/app/features/star-wars/components/character-list/character-list.component.ts
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatButtonModule } from "@angular/material/button";
import { StarWarsService } from "../../../../core/services/star-wars.service";
import { Character } from "../../../../models/character.model";
import { GalacticDataSource } from "../../datasources/galactic-datasource";
import { Subscription } from "rxjs";

@Component({
  selector: "app-character-list",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: "./character-list.component.html",
  styleUrl: "./character-list.component.scss",
})
export class CharacterListComponent implements OnInit, OnDestroy {
  characters: Character[] = [];
  currentPage = 1;
  loading = false;
  totalCount = 0;

  private starWarsService = inject(StarWarsService);
  private dataSource!: GalacticDataSource; // Using definite assignment assertion
  private subscription = new Subscription();

  ngOnInit(): void {
    // Initialize the DataSource
    this.dataSource = new GalacticDataSource(this.starWarsService);

    // Subscribe to the DataSource observables
    this.subscription.add(
      this.dataSource.connect().subscribe((data) => {
        this.characters = data;
      })
    );

    this.subscription.add(
      this.dataSource.loading$.subscribe((isLoading) => {
        this.loading = isLoading;
      })
    );

    this.subscription.add(
      this.dataSource.count$.subscribe((count) => {
        this.totalCount = count;
      })
    );

    // Load initial data
    this.loadCharacters();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscription.unsubscribe();
    this.dataSource.disconnect();
  }

  loadCharacters(): void {
    this.dataSource.loadCharacters(this.currentPage);
  }

  loadMore(): void {
    this.currentPage++;
    this.loadCharacters();
  }

  hasMoreData(): boolean {
    return this.characters.length < this.totalCount;
  }
}
```

Notice how the component:

1. Creates an instance of our DataSource
2. Subscribes to the observables exposed by the DataSource
3. Calls methods on the DataSource to load data
4. Properly cleans up subscriptions in `ngOnDestroy()`

## Cosmic Compiler Summary

- We've **created a GalacticDataSource** that extends Angular CDK's DataSource
- We've **implemented connect() and disconnect()** methods as required by the DataSource interface
- We've **set up BehaviorSubjects** to manage data, loading state, and total count
- We've **created a loadCharacters method** that handles data fetching and state updates
- We've **exposed observables** for components to subscribe to

> The Ancient Order of Angular maintains that the DataSource pattern is not just about code organization but a philosophical approach to component design. "When a component knows too much about data fetching, it loses focus on its primary purpose: presenting information to users. The DataSource liberates the component from this burden, allowing it to achieve enlightenment," reads one of their ancient scrolls, found in a dusty GitHub repository.

_In our next transmission, we'll transition from our simple card layout to a powerful MatTable implementation and expand our GalacticDataSource to handle pagination properly. This will allow users to navigate through the vast database of Star Wars characters with the elegance of a Jedi Master using the Force while showcasing the true power of the DataSource pattern when paired with Material's table components._

_May your components be lean and your data sources clean._
