# Use official Node.js Alpine image for a small footprint
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Expose the port the Express app runs on
EXPOSE 5000

# Start the application using nodemon for development auto-restarts
CMD ["npm", "run", "dev"]