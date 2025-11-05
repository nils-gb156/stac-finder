FROM node:22

# Set the /app directory as working directory
WORKDIR /app

# Copy app code from our local folder into the docker /app working directory
COPY api/package*.json ./api/

# Install app dependicies
WORKDIR /app/api
RUN npm install

# Copy project files
WORKDIR /app
COPY . .

# Expose app on given port
EXPOSE 3000

# Start app
WORKDIR /app/api
CMD ["npm", "start"]
