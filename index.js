import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
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

// Initialize Database Connection
connectDB();

// Express Session Configuration
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || "sidgigs_hr_session_secret",
  })
);

// Body Parser Middlewares
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

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

app.listen(port, () => {
  console.log(`🚀 SidGigs HR Backend server running on port ${port}`);
  console.log(`📖 Swagger API Docs available at /api/documentation`);
});

export default app;
