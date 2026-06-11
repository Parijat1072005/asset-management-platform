# Use official Node.js Alpine image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Start the Vite dev server and expose it to the network host
CMD ["npm", "run", "dev"]