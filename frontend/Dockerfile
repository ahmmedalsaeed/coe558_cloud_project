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

CMD node app.js

RUN npm run build 
# Make port 5000 available to the world outside this container
EXPOSE 3000

RUN npm install -g serve 

# Define the command to run the app
CMD [ "serve", "-s","build","-l","3000" ]
