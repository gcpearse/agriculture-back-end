# Agriculture (WIP) - Back-end Repository

## Overview

A full-stack application for gardeners, allotment owners, and subsistence farmers to keep track of the crops, jobs, and issues on their plots.

> This project is a work in progress.

## Tech

### Languages and frameworks

This is a **Node.js** REST API built in **TypeScript** with the **Express** framework.

### Database

Database management is handled with **PostgreSQL**. The application uses the `pg` library to interact with the database, and `pg-format` for secure dynamic SQL queries. 

### Authentication

Access to routes, services, and resources is handled by a **JSON Web Token (JWT)** authentication system.

### Testing

The project contains a full suite of integration tests using **Jest** and **SuperTest** with the `ts-jest` library for TypeScript support.

## Documentation

Comprehensive API documentation is served up using **Swagger** with the `swagger-ui-express` and `swagger-jsdoc` libraries.

> A link to the Swagger documentation will be provided once the API is hosted.

## Continuous Integration

This project includes a CI workflow using **GitHub Actions** for automated testing with a PostgreSQL service container.

## Local Setup Guide

### Prerequisites

Node.js (including NPM) and PostgreSQL must be installed to run this project locally.

This project was developed using the following versions:

| Node.js | NPM | PostgreSQL |
| --- | --- | --- |
| v20.15.0 | 10.8.2 | 14.12 |

### Environment variables

Create the following `.env` files in the root directory.

`.env.test`\
`.env.development`

Add the following environment variables to each file:

`PGDATABASE=` followed by the relevant database name.\
`JWT_SECRET=` followed by a JWT secret key.

A random string can be generated to serve as a JWT secret key with the following JavaScript code:

```js
console.log(require("crypto").randomBytes(64).toString("hex"))
```

### Continuous integration workflow

The `test.yml` YAML file in `.github/workflows` requires a repository secret to run the **Run tests** workflow.

On GitHub, select the repository and go to **Settings**.

Under **Security**, select **Secrets and variables** and then **Actions**.

Under **Repository secrets**, select **New repository secret**.

In the **Name** field, enter `JWT_SECRET`.

In the **Secret** field, enter a JWT secret key.

## Scripts

The following scripts are included in `package.json`:

```json
"scripts": {
  "db-setup": "psql -f src/db/setup.sql",
  "seed": "tsc && node dist/db/seeding/run-seed.js",
  "start": "tsc && node dist/listen.js",
  "test": "jest src/ --runInBand"
}
```

`npm run db-setup`\
Drops and creates the test and development databases.

`npm run seed`\
Runs the TypeScript compiler and seeds the databases.

`npm run start`\
Runs the TypeScript compiler and starts the server locally on port 9090.

`npm t`\
Runs all tests in the `src` directory serially.
