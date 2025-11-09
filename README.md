# "Blog Posts" Project (DVBS "Web Development Fundamentals")

This is a simple web application for creating and managing blog posts, developed using Node.js, Express, MongoDB, and vanilla JavaScript.

## Main Features

* Creating, editing, and deleting posts.
* Sorting posts (newest first).
* Uploading images to posts.
* Viewing images in a modal window.

## How to run the application locally

### prerequisites

- Installed [Node.js](https://www.nodejs.org/) (version 16 or higher).
- An account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) to obtain the connection string to the database.

### Instructions

1. **Clone the repository:**
    ```bash
    git clone [your repository link]
    cd [project folder name]
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up environment variables:**
    - Create a `.env` file in the root of the project.
    - Add your MongoDB Atlas connection string:
      ```
      MONGO_URI=mongodb+srv://your_user:your_password@cluster_url/your_database?retryWrites=true&w=majority
      ```

4. **Create a folder for uploads:**
    - Inside the `public` folder, create a new folder named `uploads`.

5. **Start the server:**
    ```bash
    node server.js
    ```

6. Open your browser and navigate to `http://localhost:3000`.