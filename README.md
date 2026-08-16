# SidGigs HR Backend

Base Node.js API server for SidGigs HR platform built with Express, Mongoose, Joi, and Swagger documentation.

## Project Structure

```
src/
├── config/         # Database, swagger, and mail configurations
├── exceptions/     # Custom error and validation handlers
├── middlewares/    # Auth and authorization middlewares
├── modules/        # Domain modules (auth, hr, etc.)
│   └── <module>/
│       ├── controllers/
│       ├── models/
│       ├── repositories/
│       ├── requests/
│       ├── resources/
│       └── routes/
├── routes/         # Central routing registry
├── utils/          # Helper utilities
└── views/          # EJS templates
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`.

3. Run the development server:
   ```bash
   npm run server
   ```

4. Access API Documentation at `http://localhost:3000/api/documentation`.
# sidegigs_hr_backend
