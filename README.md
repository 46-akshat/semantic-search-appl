# Semantic Search Application

A Spring Boot application that provides semantic search capabilities for API documentation. Users can upload OpenAPI JSON files and perform intelligent keyword-based searches to find relevant API endpoints.

## Current Status

This project is currently in the initial development phase, implementing a basic CRUD system with the following capabilities:

- **JSON Upload**: Upload OpenAPI specification files in JSON format
- **Keyword Search**: Search through uploaded API documentation using keywords
- **Data Persistence**: Store API endpoint information in a PostgreSQL database
- **RESTful API**: Expose endpoints for file upload and search operations

## Architecture Overview

The application follows a layered architecture pattern:

```
┌─────────────────┐
│   Frontend UI   │  (Planned for Day 5)
├─────────────────┤
│  REST API Layer │  
├─────────────────┤
│ Service Layer   │  
├─────────────────┤
│ Repository Layer│  
├─────────────────┤
│ Database Layer  │  (PostgreSQL)
└─────────────────┘
```

## Technology Stack

### Backend
- **Spring Boot 3.x** - Main application framework
- **Spring Data JPA** - Database abstraction layer
- **Spring Web** - REST API development
- **Spring Security** - Authentication and authorization (planned)
- **PostgreSQL** - Primary database for structured data
- **Lombok** - Reduce boilerplate code
- **Swagger Parser** - Parse OpenAPI specifications

### Future Enhancements (Days 3-7)
- **Spring AI** - Integration with Google Gemini for embeddings
- **ChromaDB** - Vector database for semantic search
- **JWT** - Token-based authentication
- **Docker** - Containerization
- **React/Vue** - Frontend framework

## Core Data Models

### ApiEndpoint Entity
Stores information about API endpoints extracted from OpenAPI specifications:
- `id` - Unique identifier
- `path` - API endpoint path (e.g., `/api/users/{id}`)
- `method` - HTTP method (GET, POST, PUT, DELETE)
- `summary` - Brief description of the endpoint
- `description` - Detailed description
- `operationId` - Unique operation identifier
- `tags` - Associated tags for categorization

### User Entity (Planned)
Stores user information for authentication:
- `id` - Unique identifier
- `username` - User login name
- `password` - Hashed password
- `email` - User email address
- `createdAt` - Account creation timestamp

## API Endpoints

### Current Implementation

#### Upload OpenAPI Specification
```http
POST /api/ingest/upload
Content-Type: multipart/form-data

Body: file (OpenAPI JSON specification)
```

#### Search API Endpoints
```http
GET /api/search?query={keyword}

Response: List of matching ApiEndpoint objects
```

### Planned Endpoints

#### Authentication (Day 6)
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

#### Semantic Indexing (Day 3)
```http
POST /api/index/rebuild
```

## Database Schema

### api_endpoints table
```sql
CREATE TABLE api_endpoints (
    id BIGSERIAL PRIMARY KEY,
    path VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    summary VARCHAR(1000),
    description TEXT,
    operation_id VARCHAR(255),
    tags VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### users table (Planned)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Development Roadmap

### ✅ Day 1: Project Foundation
- [x] Spring Boot project setup
- [x] Database configuration
- [x] Core JPA entities
- [x] Repository interfaces

### 🔄 Day 2: Basic CRUD Operations (Current)
- [ ] File upload controller
- [ ] OpenAPI parsing service
- [ ] Basic search functionality
- [ ] Database persistence

### 📋 Day 3: Semantic Indexing
- [ ] ChromaDB integration
- [ ] Embedding generation with Google Gemini
- [ ] Vector storage and retrieval

### 📋 Day 4: Advanced Search API
- [ ] Semantic search implementation
- [ ] Vector similarity matching
- [ ] Hybrid search (keyword + semantic)

### 📋 Day 5: Frontend Development
- [ ] React/Vue application setup
- [ ] Search interface components
- [ ] API integration

### 📋 Day 6: Authentication System
- [ ] User registration and login
- [ ] JWT token management
- [ ] Endpoint security

### 📋 Day 7: Production Deployment
- [ ] Docker containerization
- [ ] Docker Compose orchestration
- [ ] Environment configuration
- [ ] Documentation completion

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- Docker (for future ChromaDB integration)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SemanticSearchAppl
   ```

2. **Configure Database**
   Update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/semantic_search
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Run the Application**
   ```bash
   ./mvnw spring-boot:run
   ```

4. **Test the API**
   The application will be available at `http://localhost:8080`

### Testing with Sample Data

You can test the upload functionality using a sample OpenAPI specification:

```bash
curl -X POST -F "file=@sample-openapi.json" http://localhost:8080/api/ingest/upload
```

Then search for endpoints:

```bash
curl "http://localhost:8080/api/search?query=user"
```

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/example/semanticsearch/
│   │       ├── SemanticSearchApplication.java
│   │       ├── controller/
│   │       │   ├── IngestionController.java
│   │       │   └── SearchController.java
│   │       ├── entity/
│   │       │   ├── ApiEndpoint.java
│   │       │   └── User.java
│   │       ├── repository/
│   │       │   ├── ApiEndpointRepository.java
│   │       │   └── UserRepository.java
│   │       └── service/
│   │           ├── IngestionService.java
│   │           └── SearchService.java
│   └── resources/
│       ├── application.properties
│       └── data.sql (sample data)
└── test/
    └── java/
        └── com/example/semanticsearch/
            └── SemanticSearchApplicationTests.java
```

## Contributing

This project follows a structured 7-day development plan. Each day builds upon the previous day's work, gradually evolving from a basic CRUD application to a sophisticated semantic search platform.

## License

This project is licensed under the MIT License - see the LICENSE file for details.