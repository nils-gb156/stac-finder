# STACFinder

## Features

## Installation & Start

### Option 1: Docker (recommended)

1. Clone or download the repository.
2. Make sure [Docker](https://www.docker.com/) is installed.
3. Start the application in the project directory:
  - **First start (build container):**
    ```bash
    docker-compose up --build
    ```
  - **Subsequent starts:**
    ```bash
    docker-compose up -d
    ```
4. Stop the application:
  ```bash
  docker-compose down
  ```

**Additional notes:**
- The application is accessible at: [http://localhost:4000](http://localhost:4000)
- Development mode with hot-reload is enabled by default in Docker

### Option 2: Node.js (without Docker)

1. Clone or download the repository.
2. Navigate to the `api` directory:
  ```bash
  cd api
  ```
3. Install dependencies:
  ```bash
  npm install
  ```
4. Start the application:
  - **Production mode:**
    ```bash
    npm start
    ```
  - **Development mode (with hot-reload):**
    ```bash
    npm run dev
    ```

**Additional notes:**
- The application is accessible at: [http://localhost:3000](http://localhost:3000)
