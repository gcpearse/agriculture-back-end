# Agriculture API - (WIP)

## Overview

This API serves as the back end for a full-stack application allowing gardeners, allotment owners, and subsistence farmers to keep track of the crops, jobs, and issues on their plots.

> This project is a work in progress.

## Tech

### Languages and frameworks

This is a **Node.js** REST API built in **TypeScript** with the **Express** framework.

### Database

Database management is handled with **PostgreSQL**. The application uses the `pg` library to interact with the database, and `pg-format` for secure dynamic SQL queries. 

### Authentication

Access to routes, services, and resources is handled by a **JSON Web Token (JWT)** authentication system.

### Security

The application uses the `bcryptjs` library to store hashed passwords in the database and verify those passwords when retrieved.

### Testing

This project contains a full suite of integration tests using **Jest** and **SuperTest** with the `ts-jest` library for TypeScript support.

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

Create the following `.env` files in the root directory:

`.env.test`\
`.env.development`

Add the following environment variables to `.env.test`:

`PGDATABASE=` followed by the name of the test database.\
`JWT_SECRET=` followed by a JWT secret key.\
`SALT_ROUNDS=1`

> For test runs, a single salt round is used to avoid throttling the testing process.

Add the following environment variables to `.env.development`:

`PGDATABASE=` followed by the name of the development database.\
`JWT_SECRET=` followed by a JWT secret key.\
`ADMIN_PASSWORD=` followed by an admin password.\
`SALT_ROUNDS=` followed by the desired number of salt rounds.

> A random string can be generated to serve as a JWT secret key with the following JavaScript code:

```js
console.log(require("crypto").randomBytes(64).toString("hex"))
```

> A lower value can be passed to `randomBytes()` to generate a shorter string.

### Continuous integration workflow

The `test.yaml` YAML file in `.github/workflows` requires a repository secret to run the **Run tests** workflow.

A repository secret can be added by following these steps:

- On GitHub, select the repository and go to **Settings**.

- Under **Security**, select **Secrets and variables** and then **Actions**.

- Under **Repository secrets**, select **New repository secret**.

- In the **Name** field, enter `JWT_SECRET`.

- In the **Secret** field, enter a JWT secret key.

> See the previous section for JavaScript code to generate a random string.

## Scripts

The following scripts are included in the `package.json` file:

```json
"scripts": {
  "db-setup": "psql -f src/db/setup.sql",
  "seed": "tsc && node dist/db/seeding/run-seed.js",
  "start": "tsc && node dist/listen.js",
  "test": "jest src/ --runInBand"
}
```

`npm run db-setup`
> Drops and creates the test and development databases.

`npm run seed`
> Runs the TypeScript compiler and seeds the database.

`npm run start`
> Runs the TypeScript compiler and starts the server locally on port 9090. 

> Swagger documentation is then served up at `http://localhost:9090/api/docs/`

`npm t`
> Runs all tests in the `src` directory serially.
