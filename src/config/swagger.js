/**
 * Swagger configurations
 */
const swagger = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "SidGigs HR API",
      version: "1.0.0",
      description: "SidGigs HR Backend API documentation built with Express and Swagger",
      contact: {
        name: "SidGigs HR Team",
        email: "support@sidgigs.app",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          in: "header",
          name: "Authorization",
          description: "Bearer token to access these API endpoints",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/modules/**/*.js"],
};

export default swagger;
