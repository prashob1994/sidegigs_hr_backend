import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";

import connectDB from "./src/config/db.js";
import swagger from "./src/config/swagger.js";
import configureRoutes from "./src/routes/routes.js";

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3000;
const hostname = process.env.HOST || "localhost";

const app = express();

// Enable CORS
app.use(cors());

// HTTP Request Logger
app.use(morgan(process.env.LOGGING_FORMAT || "dev"));

// Set View Engine
app.set("view engine", "ejs");
app.set("views", "./src/views");

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

// Home Route
app.get("/", (req, res) => {
  res.render("index");
});

// Swagger API Documentation
const specs = swaggerJsdoc(swagger);
app.use(
  "/api/documentation",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

// Register API Routes
configureRoutes(app);

// Serve Static Uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/public", express.static(path.join(process.cwd(), "public")));

app.listen(port, hostname, () => {
  console.log(`🚀 SidGigs HR Backend server running at http://${hostname}:${port}/`);
  console.log(`📖 Swagger API Docs available at http://${hostname}:${port}/api/documentation`);
});

export default app;
