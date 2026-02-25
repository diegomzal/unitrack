FROM node:20-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Cloud Run defaults to port 8080, but your app uses PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Command to run the application
CMD [ "npm", "start" ]
