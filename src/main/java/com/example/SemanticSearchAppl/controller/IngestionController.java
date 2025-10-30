package com.example.SemanticSearchAppl.controller;

import com.example.SemanticSearchAppl.entity.ApiDetails;
import com.example.SemanticSearchAppl.service.IngestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller to handle file uploads and JSON ingestion
 * This is where users can upload their JSON files containing API information
 */
@RestController
@RequestMapping("/api/v1/ingest")  // Base URL: /api/v1/ingest
public class IngestionController {
    
    // Service that handles the actual file processing
    private final IngestionService ingestionService;
    
    // Constructor - Spring automatically injects the service
    public IngestionController(IngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }
    
    /**
     * Endpoint to upload JSON files
     * URL: POST /api/v1/ingest/upload
     * 
     * How to test:
     * - Use Postman or curl
     * - Send POST request with form-data
     * - Key: "file", Value: select your JSON file
     */
    @PostMapping("/upload")
    public ResponseEntity<String> uploadJsonFile(@RequestParam("file") MultipartFile file) {
        
        // Step 1: Basic validation
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("❌ Error: File is empty!");
        }
        
        // Check if it's a JSON file
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().endsWith(".json")) {
            return ResponseEntity.badRequest().body("❌ Error: Please upload a JSON file (.json extension required)");
        }
        
        try {
            // Step 2: Process the file using our service
            System.out.println("🚀 Starting to process file: " + fileName);
            List<ApiDetails> savedApis = ingestionService.processJsonFile(file);
            
            // Step 3: Return success response
            String successMessage = String.format(
                "✅ Success! Processed file '%s' and saved %d API endpoints to database", 
                fileName, 
                savedApis.size()
            );
            
            return ResponseEntity.ok(successMessage);
            
        } catch (Exception e) {
            // Step 4: Handle any errors
            System.err.println("💥 Error processing file: " + e.getMessage());
            e.printStackTrace(); // Print full error for debugging
            
            String errorMessage = String.format(
                "❌ Error processing file '%s': %s", 
                fileName, 
                e.getMessage()
            );
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage);
        }
    }
    
    /**
     * Simple endpoint to check if the ingestion service is working
     * URL: GET /api/v1/ingest/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("🟢 Ingestion service is running and ready to accept files!");
    }
    
    /**
     * Endpoint to get information about supported file formats
     * URL: GET /api/v1/ingest/info
     */
    @GetMapping("/info")
    public ResponseEntity<String> getInfo() {
        String info = """
            📋 JSON Ingestion Service Information
            
            Supported JSON formats:
            
            1️⃣ OpenAPI Format:
            {
              "paths": {
                "/users": {
                  "get": {
                    "description": "Get all users",
                    "responses": {...}
                  }
                }
              }
            }
            
            2️⃣ Array Format:
            [
              {
                "path": "/users",
                "method": "GET",
                "description": "Get all users"
              },
              {
                "path": "/users",
                "method": "POST",
                "description": "Create user"
              }
            ]
            
            3️⃣ Single Object Format:
            {
              "path": "/users",
              "method": "GET",
              "description": "Get all users",
              "requestBody": "...",
              "responseBody": "..."
            }
            
            📤 Upload endpoint: POST /api/v1/ingest/upload
            """;
        
        return ResponseEntity.ok(info);
    }
}