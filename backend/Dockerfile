# Use an official Node runtime as a parent image
FROM node

# Set the working directory in the container
WORKDIR .

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle the app's source code inside the Docker image
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define the command to run the app
CMD [ "node", "index.js" ]
