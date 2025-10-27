# Semantic Search Application - 7-Day Development Plan

## Day 1: Project Scaffolding & Core Data Models
Goal: Set up a robust and scalable Spring Boot project foundation with a proper database.

Workflow:
Today is about building the empty, but sturdy, skeleton of your application.

Project Initialization: Go to start.spring.io. Create a new project with these dependencies: Spring Web, Spring Data JPA, Spring Security, Lombok, PostgreSQL Driver (or H2 Database for testing), and the Spring AI dependencies (spring-ai-google-gemini-starter, spring-ai-chroma-vector-store-starter).

Database Setup: Configure your application.properties to connect to a PostgreSQL database. Using a real database from day one is crucial for a product. You can run PostgreSQL easily via Docker.

Define JPA Entities: Create the core Java classes that will map to your database tables. You'll need:
- ApiEndpoint.java: To store details like path, method, summary, description, etc.
- User.java: To store user information like username and hashed password. This prepares you for future authentication.

Create Repositories: Make JpaRepository interfaces for your entities (e.g., ApiEndpointRepository, UserRepository). Spring Data JPA will automatically provide you with methods to save and retrieve data.

✅ Outcome: A well-structured Spring Boot application connected to a real database, with the core data models defined. The project is ready for business logic.

## Day 2: Manual Ingestion & Basic Catalog API
Goal: Create a secure endpoint that allows a user to upload an openapi.json file, which is then parsed and saved to your PostgreSQL database.

Workflow:
This flow is about getting data into your system in a structured, persistent way.

File Upload Controller: Create a RestController with a POST endpoint (e.g., /api/ingest/upload). This endpoint will accept a multipart file (the openapi.json).

Ingestion Service: The controller will pass the file to an IngestionService.

Parse and Map: This service will use the swagger-parser library to read the file. It will then loop through the parsed data and map it to your ApiEndpoint JPA entity objects.

Save to Database: The service will use the ApiEndpointRepository to save the list of new ApiEndpoint entities to your PostgreSQL database.

Basic Security: Use Spring Security to protect this endpoint, ensuring only authenticated users (for now, a default user) can upload specs.

Test with Postman: Use Postman to send a POST request with a file to your endpoint to verify that the API data is correctly saved in your database.

✅ Outcome: A working API that can populate your primary database with API specifications. You now have a persistent, non-AI catalog of all your APIs.

## Day 3: The Semantic Indexing Engine
Goal: Create a process that reads from your PostgreSQL database and populates the ChromaDB vector store.

Workflow:
This workflow connects your traditional database to your AI vector database.

Run ChromaDB: Start your ChromaDB container using Docker (docker run -p 8000:8000 chromadb/chroma).

Create Indexing Service: Build a new IndexingService.

Fetch from DB: This service will use the ApiEndpointRepository to fetch all the API endpoint records from your PostgreSQL database.

Generate Embeddings: It will then convert these records into Spring AI Document objects. The service calls vectorStore.add(documents), which, behind the scenes, sends the text to the Gemini API for embedding.

Store in Vector DB: The resulting vectors are then stored in ChromaDB. Crucially, in the metadata for each vector, you should store the unique ID of the endpoint from your PostgreSQL database (e.g., metadata.put("db_id", endpoint.getId())). This link is vital.

Triggering: You can make this an admin-only API endpoint (POST /api/index/rebuild) or have it run on a schedule.

✅ Outcome: A system that can create a searchable semantic index of all the APIs stored in your main database.

## Day 4: The Core Semantic Search API
Goal: Build the primary, secured search endpoint that users will interact with.

Workflow:
This is the heart of your application, combining the power of the AI search with the reliability of your structured database.

Create Search Endpoint: Add a GET /api/search endpoint to a SearchController. Protect it with Spring Security.

Embed User Query: When a user query comes in, the SearchService sends it to the Gemini API to get a query vector.

Query Vector DB: The service performs a similarity search in ChromaDB using this vector.

Retrieve IDs: ChromaDB returns the matching documents. Your service extracts the db_id from the metadata of each document.

Fetch from Primary DB: Using these IDs, the service now makes a fast lookup in your PostgreSQL database (via the ApiEndpointRepository) to get the full, detailed ApiEndpoint objects.

Return Full Response: The service returns the complete ApiEndpoint objects as the JSON response. This is better than returning the raw Document because it's your clean, structured data model.

Test with Postman: Thoroughly test this endpoint with various queries to ensure the entire flow is working correctly.

✅ Outcome: A secure, efficient, and intelligent search API that provides rich, structured data as its result.

## Day 5: User Interface (UI) Development
Goal: Build a clean, professional frontend for your product using a modern framework.

Workflow:

Setup Frontend Project: Initialize a new project using a framework like React or Vue.

Component Design:
- SearchBar.js: A component for the main search input.
- ResultsList.js: A component to display the list of search results.
- ResultItem.js: A component for rendering a single API endpoint in the list.
- LoginPage.js: A simple login form (we'll make it functional tomorrow).

API Integration: Create a dedicated service in your frontend (e.g., apiService.js) to handle all fetch calls to your backend.

State Management: When a user searches, the search term is stored in the component's state. The API call is made, and the results are stored in another state variable, which automatically triggers the UI to re-render and display the results.

Styling: Use a CSS framework like Tailwind CSS or Material-UI to make the application look professional and polished.

✅ Outcome: A functional and visually appealing web interface where users can enter queries and see formatted results.

## Day 6: User Management & Authentication
Goal: Turn your application into a true multi-user product with secure registration and login.

Workflow:

Build Authentication API:
- Create POST /api/auth/register to allow new users to sign up. This service will hash the password before saving the new User entity to the database.
- Create POST /api/auth/login that validates user credentials.

Implement JWT: Upon successful login, generate a JSON Web Token (JWT) and send it back to the user. JWT is the standard for securing modern web applications.

Secure Endpoints: Configure Spring Security to require a valid JWT for all important endpoints (/api/search, /api/ingest/upload, etc.).

Frontend Login Flow:
- Connect your LoginPage UI to the /api/auth/login endpoint.
- Upon receiving the JWT, save it securely in the browser (e.g., in localStorage or a cookie).
- For all subsequent API calls (like to the search endpoint), attach the JWT in the Authorization header.
- Implement logout functionality that deletes the token.

✅ Outcome: A secure, production-grade application where users can register, log in, and have their sessions managed securely.

## Day 7: Productionizing & Deployment
Goal: Package your entire application for easy deployment and distribution.

Workflow:

Dockerize Everything:
- Create a Dockerfile for your Spring Boot application to package it into a container image.
- Create a Dockerfile for your React/Vue frontend application.

Orchestrate with Docker Compose: Create a docker-compose.yml file. This single file will define and link all the services that make up your product:
- Your Spring Boot backend container.
- Your frontend container.
- A PostgreSQL database container.
- The ChromaDB container.

This allows anyone (or any server) to launch your entire application with a single command: docker-compose up.

Final Touches:
- Configuration: Externalize your configuration (database passwords, Gemini API key) using environment variables so you don't have to hardcode them.
- CORS: Ensure your CORS configuration in Spring Security is set up correctly for your production frontend URL.
- Documentation: Create a detailed README.md file explaining what the project is, how to configure it (e.g., setting the API key), and how to launch it using Docker Compose.
- Add Swagger UI: Now is a good time to add the springdoc-openapi dependency to your project. This will automatically generate a Swagger UI page (e.g., at /swagger-ui.html) for developers who want to integrate with your product's API.

✅ Outcome: Your product is fully containerized and ready for deployment on any cloud provider or server that supports Docker.