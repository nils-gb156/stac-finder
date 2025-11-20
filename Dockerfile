FROM node:22

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create symlink for python command
RUN ln -s /usr/bin/python3 /usr/bin/python

# Set the /app directory as working directory
WORKDIR /app

# Copy requirements file and install Python dependencies
COPY api/utils/requirements.txt ./api/utils/
RUN pip3 install --no-cache-dir -r ./api/utils/requirements.txt --break-system-packages

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
