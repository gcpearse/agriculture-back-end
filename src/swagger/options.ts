export const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Agriculture API",
      description: "API for gardeners, allotment owners, and other subsistence farmers to keep track of crops, issues, and jobs on their plots.",
      version: "1.0.0"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./dist/routes/*.js"]
}
