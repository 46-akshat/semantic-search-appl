# Semantic Search Application

A Spring Boot application that allows developers to upload their API endpoints and perform semantic searches. Developers can document their endpoints with details like HTTP methods, descriptions, request/response bodies, and search through them efficiently.

## Features

- **API Documentation**: Store comprehensive API endpoint information
- **Semantic Search**: Search through API endpoints using natural language queries
- **HTTP Method Support**: Support for GET, POST, PUT, DELETE, OPTIONS methods
- **Request/Response Details**: Store request bodies, parameters, queries, and response information
- **Data Persistence**: PostgreSQL database for reliable data storage

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

## Core Data Model

### ApiDetails Entity
Stores comprehensive information about API endpoints:

- `id` (UUID) - Unique identifier for each endpoint
- `method` (ApiMethod) - HTTP method (GET, POST, PUT, DELETE, OPTIONS)
- `description` (String, max 300 chars) - Brief description of the endpoint
- `url` (String) - API endpoint path (e.g., "/api/users/profile")
- `requestBody` (String) - JSON structure of request body
- `requestParam` (String) - Request parameters information
- `requestQuery` (String) - Query parameters information
- `responseBody` (String) - Expected response structure
- `responseStatusCode` (String) - HTTP status codes returned

### ApiMethod Enum
Supported HTTP methods:
```java
public enum ApiMethod {
    GET, POST, PUT, DELETE, OPTIONS
}
```

## API Endpoints

### Endpoint Management
```http
# Create new API endpoint
POST /api/endpoints
Content-Type: application/json

{
  "method": "GET",
  "description": "Get user profile information",
  "url": "/api/users/profile",
  "requestBody": null,
  "requestParam": "userId (required)",
  "requestQuery": "include=details",
  "responseBody": "{ \"id\": 1, \"name\": \"John\", \"email\": \"john@example.com\" }",
  "responseStatusCode": "200"
}
```

```http
# Get all endpoints
GET /api/endpoints

# Get endpoint by ID
GET /api/endpoints/{id}

# Update endpoint
PUT /api/endpoints/{id}

# Delete endpoint
DELETE /api/endpoints/{id}
```

### Search Endpoints
```http
# Search endpoints by description or URL
GET /api/search?query=user profile

# Filter by HTTP method
GET /api/search?method=GET

# Combined search
GET /api/search?query=authentication&method=POST
```

## Database Schema

### api_details table
```sql
CREATE TABLE api_details (
    id UUID PRIMARY KEY,
    method VARCHAR(10) NOT NULL,
    description VARCHAR(300),
    url VARCHAR(255),
    request_body TEXT,
    request_param TEXT,
    request_query TEXT,
    response_body TEXT,
    response_status_code VARCHAR(50)
);
```

## Development Phases

### Phase 1: Core CRUD Operations
- [x] Spring Boot project setup
- [x] ApiDetails entity and ApiMethod enum
- [ ] Repository layer implementation
- [ ] Service layer for business logic
- [ ] REST controllers for API endpoints

### Phase 2: Search Functionality
- [ ] Basic keyword search implementation
- [ ] Search by HTTP method filtering
- [ ] Advanced search with multiple criteria

### Phase 3: Semantic Search Enhancement
- [ ] Integration with embedding models
- [ ] Vector database setup
- [ ] Semantic similarity search

### Phase 4: Frontend & Polish
- [ ] Simple web interface for endpoint management
- [ ] Search interface with filters
- [ ] Documentation and deployment

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

Create a new API endpoint:

```bash
curl -X POST http://localhost:8080/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "description": "Retrieve user profile information",
    "url": "/api/users/profile",
    "requestParam": "userId (required)",
    "requestQuery": "include=details,permissions",
    "responseBody": "{\"id\": 1, \"name\": \"John Doe\", \"email\": \"john@example.com\"}",
    "responseStatusCode": "200"
  }'
```

Search for endpoints:

```bash
curl "http://localhost:8080/api/search?query=user"
curl "http://localhost:8080/api/search?method=GET"
```

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/example/SemanticSearchAppl/
│   │       ├── SemanticSearchApplApplication.java
│   │       ├── controller/
│   │       │   ├── ApiEndpointController.java
│   │       │   └── SearchController.java
│   │       ├── entity/
│   │       │   ├── ApiDetails.java
│   │       │   └── ApiMethod.java
│   │       ├── repository/
│   │       │   └── ApiDetailsRepository.java
│   │       └── service/
│   │           ├── ApiDetailsService.java
│   │           └── SearchService.java
│   └── resources/
│       └── application.properties
└── test/
    └── java/
        └── com/example/SemanticSearchAppl/
            └── SemanticSearchApplApplicationTests.java
```

## Example Use Cases

- **API Documentation**: Teams can document all their REST endpoints in one place
- **Endpoint Discovery**: Developers can search for existing endpoints before creating new ones
- **API Catalog**: Maintain a searchable catalog of all microservice endpoints
- **Integration Helper**: Find relevant endpoints when integrating with other services

