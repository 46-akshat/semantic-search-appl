package com.example.SemanticSearchAppl.service;

import com.example.SemanticSearchAppl.entity.ApiDetails;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Interface for Ingestion Service
 * 
 * This interface defines the contract for processing JSON files and converting them
 * into ApiDetails entities that can be saved to the database.
 * 
 * Why use an interface?
 * - Makes code more testable (we can create mock implementations)
 * - Follows SOLID principles (Dependency Inversion)
 * - Makes it easy to swap implementations if needed
 * - Clearly defines what the service should do
 */
public interface IngestionDetails {
    
    /**
     * Main method to process uploaded JSON files
     * 
     * @param file - The uploaded JSON file from the user
     * @return List of ApiDetails objects that were created and saved to database
     * @throws Exception if file processing fails (invalid JSON, file read error, etc.)
     */
    List<ApiDetails> processJsonFile(MultipartFile file) throws Exception;
    
    /**
     * Validates if the uploaded file is acceptable for processing
     * 
     * @param file - The uploaded file to validate
     * @return true if file is valid (JSON format, not empty, etc.), false otherwise
     */
    boolean isValidJsonFile(MultipartFile file);
    
    /**
     * Gets information about supported file formats
     * 
     * @return String describing what JSON formats are supported
     */
    String getSupportedFormatsInfo();
}