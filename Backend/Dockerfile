# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Install system dependencies for Puppeteer and Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxshmfence1 \
    libx11-xcb1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer bundles its own Chromium; no separate Chrome install needed

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Puppeteer auto-detects its bundled Chromium

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
