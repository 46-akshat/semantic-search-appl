package com.example.SemanticSearchAppl.service;

import com.example.SemanticSearchAppl.entity.ApiDetails;
import com.example.SemanticSearchAppl.entity.ApiMethod;
import com.example.SemanticSearchAppl.entity.AuthType;
import com.example.SemanticSearchAppl.repo.ApiDetailsRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * This service handles uploading and processing JSON files
 * It converts JSON data into our ApiDetails entities and saves them to database
 */
@Service
public class IngestionService {
    
    // Repository to save data to database
    private final ApiDetailsRepository apiDetailsRepository;
    
    // Jackson ObjectMapper to parse JSON files
    private final ObjectMapper objectMapper;
    
    // Constructor - Spring will automatically inject these dependencies
    public IngestionService(ApiDetailsRepository apiDetailsRepository) {
        this.apiDetailsRepository = apiDetailsRepository;
        this.objectMapper = new ObjectMapper(); // Creates a new JSON parser
    }
    
    /**
     * Main method to process uploaded JSON files
     * @param file - The uploaded JSON file
     * @return List of saved ApiDetails
     * @throws Exception if file processing fails
     */
    public List<ApiDetails> processJsonFile(MultipartFile file) throws Exception {
        
        // Step 1: Read the file content as a string
        String fileContent = new String(file.getBytes());
        System.out.println("📁 File received: " + file.getOriginalFilename());
        System.out.println("📄 File size: " + file.getSize() + " bytes");
        
        // Step 2: Parse the JSON string into a JsonNode (tree structure)
        JsonNode rootNode = objectMapper.readTree(fileContent);
        System.out.println("✅ JSON parsed successfully");
        
        // Step 3: Extract API information from JSON
        List<ApiDetails> apiDetailsList = extractApiDetailsFromJson(rootNode);
        
        // Step 4: Save all extracted APIs to database
        List<ApiDetails> savedApis = apiDetailsRepository.saveAll(apiDetailsList);
        System.out.println("💾 Saved " + savedApis.size() + " APIs to database");
        
        return savedApis;
    }
    
    /**
     * Extracts API details from JSON structure
     * This method handles different JSON formats - you can customize it based on your JSON structure
     */
    private List<ApiDetails> extractApiDetailsFromJson(JsonNode rootNode) {
        List<ApiDetails> apiList = new ArrayList<>();
        
        // Check if JSON has "paths" field (OpenAPI format)
        if (rootNode.has("paths")) {
            System.out.println("🔍 Detected OpenAPI format");
            apiList = extractFromOpenApiFormat(rootNode);
        }
        // Check if JSON is an array of APIs
        else if (rootNode.isArray()) {
            System.out.println("🔍 Detected array format");
            apiList = extractFromArrayFormat(rootNode);
        }
        // Check if JSON is a single API object
        else if (rootNode.isObject()) {
            System.out.println("🔍 Detected single object format");
            apiList = extractFromSingleObjectFormat(rootNode);
        }
        else {
            System.out.println("❌ Unknown JSON format");
        }
        
        return apiList;
    }
    
    /**
     * Handles OpenAPI specification format
     * Example: { "paths": { "/users": { "get": {...}, "post": {...} } } }
     */
    private List<ApiDetails> extractFromOpenApiFormat(JsonNode rootNode) {
        List<ApiDetails> apiList = new ArrayList<>();
        JsonNode pathsNode = rootNode.get("paths");
        
        // Loop through each path (like /users, /products, etc.)
        Iterator<String> pathNames = pathsNode.fieldNames();
        while (pathNames.hasNext()) {
            String pathName = pathNames.next();
            JsonNode pathNode = pathsNode.get(pathName);
            
            // Loop through each HTTP method (GET, POST, PUT, DELETE)
            Iterator<String> methodNames = pathNode.fieldNames();
            while (methodNames.hasNext()) {
                String methodName = methodNames.next();
                JsonNode methodNode = pathNode.get(methodName);
                
                // Create ApiDetails object for this path + method combination
                ApiDetails apiDetails = createApiDetailsFromNode(pathName, methodName, methodNode);
                apiList.add(apiDetails);
            }
        }
        
        return apiList;
    }
    
    /**
     * Handles array format
     * Example: [{"path": "/users", "method": "GET", "description": "..."}, {...}]
     */
    private List<ApiDetails> extractFromArrayFormat(JsonNode rootNode) {
        List<ApiDetails> apiList = new ArrayList<>();
        
        // Loop through each item in the array
        for (JsonNode itemNode : rootNode) {
            ApiDetails apiDetails = createApiDetailsFromSimpleNode(itemNode);
            apiList.add(apiDetails);
        }
        
        return apiList;
    }
    
    /**
     * Handles single object format
     * Example: {"path": "/users", "method": "GET", "description": "..."}
     */
    private List<ApiDetails> extractFromSingleObjectFormat(JsonNode rootNode) {
        List<ApiDetails> apiList = new ArrayList<>();
        ApiDetails apiDetails = createApiDetailsFromSimpleNode(rootNode);
        apiList.add(apiDetails);
        return apiList;
    }
    
    /**
     * Creates ApiDetails from OpenAPI method node
     */
    private ApiDetails createApiDetailsFromNode(String path, String method, JsonNode methodNode) {
        ApiDetails apiDetails = new ApiDetails();
        
        // Set basic information
        apiDetails.setPath(path);
        apiDetails.setMethod(parseHttpMethod(method));
        
        // Extract description (with fallback to summary)
        String description = getTextValue(methodNode, "description");
        if (description == null || description.isEmpty()) {
            description = getTextValue(methodNode, "summary");
        }
        apiDetails.setDescription(description);
        
        // Set default values
        apiDetails.setIsDeprecated(getBooleanValue(methodNode, "deprecated", false));
        apiDetails.setAuthType(AuthType.NONE); // Default to no auth
        
        // Extract request/response information (simplified)
        apiDetails.setRequestBody(getTextValue(methodNode, "requestBody"));
        apiDetails.setResponseBody(getTextValue(methodNode, "responses"));
        
        System.out.println("📝 Created API: " + method.toUpperCase() + " " + path);
        return apiDetails;
    }
    
    /**
     * Creates ApiDetails from simple JSON node (for array/single object formats)
     */
    private ApiDetails createApiDetailsFromSimpleNode(JsonNode node) {
        ApiDetails apiDetails = new ApiDetails();
        
        // Extract basic fields
        apiDetails.setPath(getTextValue(node, "path"));
        apiDetails.setMethod(parseHttpMethod(getTextValue(node, "method")));
        apiDetails.setDescription(getTextValue(node, "description"));
        
        // Set defaults
        apiDetails.setIsDeprecated(getBooleanValue(node, "deprecated", false));
        apiDetails.setAuthType(AuthType.NONE);
        
        // Extract additional fields if present
        apiDetails.setRequestBody(getTextValue(node, "requestBody"));
        apiDetails.setResponseBody(getTextValue(node, "responseBody"));
        apiDetails.setRequestParam(getTextValue(node, "requestParam"));
        apiDetails.setRequestQuery(getTextValue(node, "requestQuery"));
        
        System.out.println("📝 Created API: " + apiDetails.getMethod() + " " + apiDetails.getPath());
        return apiDetails;
    }
    
    // ========== HELPER METHODS ==========
    
    /**
     * Safely gets text value from JSON node
     */
    private String getTextValue(JsonNode node, String fieldName) {
        if (node != null && node.has(fieldName)) {
            JsonNode fieldNode = node.get(fieldName);
            if (fieldNode.isTextual()) {
                return fieldNode.asText();
            } else {
                // If it's not text, convert to string representation
                return fieldNode.toString();
            }
        }
        return null;
    }
    
    /**
     * Safely gets boolean value from JSON node with default
     */
    private boolean getBooleanValue(JsonNode node, String fieldName, boolean defaultValue) {
        if (node != null && node.has(fieldName)) {
            return node.get(fieldName).asBoolean(defaultValue);
        }
        return defaultValue;
    }
    
    /**
     * Converts string to ApiMethod enum
     */
    private ApiMethod parseHttpMethod(String method) {
        if (method == null) {
            return ApiMethod.GET; // Default to GET
        }
        
        try {
            return ApiMethod.valueOf(method.toUpperCase());
        } catch (IllegalArgumentException e) {
            System.out.println("⚠️ Unknown HTTP method: " + method + ", defaulting to GET");
            return ApiMethod.GET;
        }
    }
}