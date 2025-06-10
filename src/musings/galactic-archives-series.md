---
layout: post.njk
title: Galactic Archives Series
description: A comprehensive guide to building Angular data sources with SWAPI
date: 2025-06-01
tags:
  - angular
  - datasource
  - star-wars-api
  - tutorial-series
  - typescript
  - frontend-architecture
seriesId: galactic-archives
postCount: 13
github:
  org: aaronmaturen
  repo: galactic-archives
---

# Galactic Archives Series

_A comprehensive guide to building efficient data sources in Angular using the Star Wars API._

This series explores advanced patterns for handling paginated data in Angular applications. Using the Star Wars API (SWAPI) as our data source, we'll build a robust, reusable solution for displaying and navigating large datasets.

**Live Demo:** [https://aaronmaturen.com/galactic-archives/](https://aaronmaturen.com/galactic-archives/)

**Source Code:** [github.com/aaronmaturen/galactic-archives](https://github.com/aaronmaturen/galactic-archives)

## What You'll Learn

- Creating custom data sources in Angular
- Handling paginated APIs efficiently
- Implementing virtual scrolling
- Managing complex state with RxJS
- Building reusable, testable components

## Table of Contents

### Foundation Phase

0. [Introduction](/musings/post-0-introduction/) - Introduces the DataSource pattern concept and outlines the plan to build a Star Wars data explorer application called "Galactic Archives"
1. [Basic Project Setup](/musings/post-1-basic-project-setup/) - Creates the Angular project with standalone components, sets up Angular Material and Tailwind CSS with `tw-` prefix
2. [Code Quality Setup](/musings/post-2-code-quality-setup/) - Implements ESLint, Prettier, and Husky pre-commit hooks to ensure consistent code style
3. [Testing Setup](/musings/post-3-testing-setup/) - Configures Jest for unit testing and Playwright for E2E testing with CI integration

### Architecture Phase

4. [Feature-Based Architecture](/musings/post-4-feature-based-architecture/) - Organizes the application using feature modules, smart/dumb component patterns, and lazy loading
5. [Star Wars API Service](/musings/post-5-star-wars-api-service/) - Builds a robust HTTP client service with TypeScript interfaces for SWAPI endpoints
6. [API Mocking with MSW](/musings/post-6-api-mocking-msw/) - Sets up Mock Service Worker to intercept and mock SWAPI requests for reliable testing

### Core DataSource Implementation Phase

7. [DataSource Foundation](/musings/post-7-datasource-foundation/) - Creates a custom Angular DataSource implementation with reactive state management
8. [Implementing Pagination](/musings/post-8-implementing-pagination/) - Adds client and server-side pagination with infinite scrolling for large datasets
9. [Adding Sorting](/musings/post-9-adding-sorting/) - Implements multi-column sorting with custom comparators for complex data types
10. [Implementing Filtering](/musings/post-10-implementing-filtering/) - Builds advanced search filters with dynamic query parameters for Star Wars data

### UI Enhancement & Deployment Phase

11. [Star Wars Theming](/musings/post-11-star-wars-theming/) - Implements custom Star Wars UI elements, dark mode, and performance optimizations
12. [CI/CD with GitHub Actions](/musings/post-12-cicd-github-actions/) - Sets up automated builds, testing, and deployment to GitHub Pages

## Prerequisites

- Basic knowledge of Angular and TypeScript
- Familiarity with RxJS observables
- Understanding of HTTP client operations

## Project Evolution Overview

This document provides an analysis of the blog post series, demonstrating how each post builds incrementally on the previous one to create a complete Angular application implementing the DataSource pattern with the Star Wars API.

Join me on this journey through the galaxy of Angular data management, where we'll tackle common challenges and build solutions that you can apply to your own projects.
