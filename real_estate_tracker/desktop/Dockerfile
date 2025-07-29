# Desktop App Dockerfile - Multi-stage build
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the frontend
RUN npm run build

# Rust stage for Tauri
FROM rust:1.70-alpine AS tauri-builder

# Install dependencies
RUN apk add --no-cache \
    nodejs \
    npm \
    pkgconfig \
    openssl-dev \
    musl-dev

# Set working directory
WORKDIR /app

# Copy the built frontend
COPY --from=frontend-builder /app/dist ./dist
COPY --from=frontend-builder /app/src-tauri ./src-tauri

# Build Tauri app
WORKDIR /app/src-tauri
RUN cargo build --release

# Final stage - minimal image
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache \
    libgcc \
    libstdc++ \
    webkit2gtk \
    openssl

# Copy the built application
COPY --from=tauri-builder /app/src-tauri/target/release/real-estate-tracker /usr/local/bin/

# Set up user
RUN adduser -D appuser
USER appuser

# Run the application
CMD ["real-estate-tracker"]