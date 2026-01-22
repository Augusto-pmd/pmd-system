
# ---- Base ----
# Use a specific, stable version of Node.js for reproducibility.
FROM node:22-alpine AS base
WORKDIR /usr/src/app

# ---- Builder ----
# This stage builds the application. It includes dev dependencies and source code.
FROM base AS builder

# Copy package files and install all dependencies (including devDependencies)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the NestJS application (compiles TypeScript to JavaScript)
# We cd into the backend directory and run the build script from there.
RUN cd apps/backend && npm run build


# ---- Production ----
# This is the final, lean image that will be deployed.
FROM base AS production

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the compiled application from the builder stage
# and other necessary assets like migrations.
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/apps/backend/src/migrations ./src/migrations

# The command to run when the container starts.
# It first attempts to run database migrations, and if successful, starts the application.
# This ensures the database is up-to-date before the app starts.
CMD ["sh", "-c", "npm run typeorm:migration:run -- --dataSource=dist/data-source.js && node dist/apps/backend/main"]
