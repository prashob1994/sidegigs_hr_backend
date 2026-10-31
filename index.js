import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./src/config/db.js";
import swagger from "./src/config/swagger.js";
import configureRoutes from "./src/routes/routes.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;

const app = express();

// Enable CORS
app.use(cors());

// HTTP Request Logger
app.use(morgan(process.env.LOGGING_FORMAT || "dev"));

// Set View Engine with absolute path resolution for Vercel / Serverless tracing
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// Serverless-friendly Database Connection Middleware
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Body Parser Middlewares
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Home / Health check
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API Status and documentation info
 */
// Home Route with graceful fallback rendering for serverless deployments
app.get("/", (req, res) => {
  res.render("index", (err, html) => {
    if (err) {
      return res.json({
        status: true,
        message: "SidGigs HR Backend API Running",
        documentation: "/api/documentation",
      });
    }
    res.send(html);
  });
});

// Swagger API Documentation (Configured with CDN links for Vercel serverless compatibility)
const specs = swaggerJsdoc(swagger);
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css";
const JS_URL = [
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.min.js",
];

app.use(
  "/api/documentation",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCssUrl: CSS_URL,
    customJs: JS_URL,
    customSiteTitle: "SidGigs HR API Documentation",
  })
);

// Register API Routes
configureRoutes(app);

// Serve Static Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));

// Only start TCP listener in local / non-Vercel environment
if (!process.env.VERCEL) {
  const server = app.listen(port, () => {
    console.log(`🚀 SidGigs HR Backend server running on port ${port}`);
    console.log(`📖 Swagger API Docs available at /api/documentation`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`❌ Port ${port} is already in use by another process. Please free the port or change PORT in .env.`);
    } else {
      console.error(`❌ Server listener error: ${error.message}`);
    }
    process.exit(1);
  });
}

// Graceful termination handling
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT signal — shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM signal — shutting down gracefully...");
  process.exit(0);
});

export default app;
