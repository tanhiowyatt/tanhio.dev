# Use official Node.js lightweight image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for Tailwind)
RUN npm ci --ignore-scripts

# Copy necessary directories and files
COPY sites/ ./sites/
COPY server.js ./server.js

# Build Tailwind CSS
RUN npm run build:css && npm prune --omit=dev

# Expose port 5173
EXPOSE 5173

# Run the production server
USER node
CMD ["node", "server.js"]
