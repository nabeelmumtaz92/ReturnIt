# ReturnIt Backend - Cloud Run Deployment
FROM node:18-alpine

# Install security updates
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Set environment
ENV NODE_ENV=production

# Cloud Run uses PORT env var
ENV PORT=8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
