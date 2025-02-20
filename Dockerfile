# Use a lightweight Node.js image
FROM node:18-bullseye-slim AS build

# Set working directory
WORKDIR /app

# Copy only package.json & package-lock.json to leverage Docker caching
COPY package*.json ./

# Install dependencies efficiently
RUN npm ci --only=production

# Copy the rest of the application
COPY . . 

# Build the React application
RUN npm run build

# Use Caddy instead of Nginx (faster & auto-configures)
FROM caddy:2.7.6-alpine

# Copy built React app to the web server directory
COPY --from=build /app/build /srv

# Expose port
EXPOSE 80

# Start Caddy server
CMD ["caddy", "file-server", "--root", "/srv"]