# Agriculture (WIP) - Back-end Repository

## Overview

A full-stack application for gardeners, allotment owners, and subsistence farmers to keep track of the crops, jobs, and issues on their plots.

> This project is a work in progress.

## Tech

### Languages and Frameworks

This is a **Node.js** REST API built in **TypeScript** with the **Express** framework.

### Database

Database management is handled with **PostgreSQL**. The application uses the `pg` library to interact with the database, and `pg-format` for secure dynamic SQL queries. 

### Authentication

Access to routes, services, and resources is handled by a **JSON Web Token (JWT)** authentication system.

### Testing

The project contains a full suite of integration tests using **Jest** and **SuperTest** with the `ts-jest` library for TypeScript support.

## Documentation

Comprehensive API documentation is hosted on **Swagger** using the `swagger-ui-express` and `swagger-jsdoc` libraries to generate and serve up the docs.

## Continuous Integration

This project includes a CI workflow using **GitHub Actions** for automated testing with a PostgreSQL service container.