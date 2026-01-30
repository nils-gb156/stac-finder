FROM node:22

# Set the /app directory as working directory
WORKDIR /app

# Copy app code from our local folder into the docker /app working directory
COPY package*.json ./

# Install app dependicies
RUN npm install

# Copy project files
COPY . .

# Expose app on given port
EXPOSE 4000

# Start app
CMD ["npm", "start"]
