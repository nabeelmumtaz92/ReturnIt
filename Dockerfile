# ReturnIt Backend - Cloud Run / Railway Deployment
FROM node:20-alpine

# Install security updates
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies (production only)
# Using npm install instead of npm ci to avoid lockfile mismatch errors
RUN npm install --omit=dev

# Copy application code
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
