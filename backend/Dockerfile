# Use Node.js official base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the backend server
CMD ["node", "server.js"]
