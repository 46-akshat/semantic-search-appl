package com.example.SemanticSearchAppl.service;

import com.example.SemanticSearchAppl.entity.ApiDetails;
import com.example.SemanticSearchAppl.repo.ApiDetailsRepository;
import jakarta.transaction.Transactional;
import lombok.Data;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;
import java.util.UUID;

@Service
@Data
public class ApiDetailService {
    private final ApiDetailsRepository apiDetailsRepository;

    public ApiDetailService(ApiDetailsRepository apiDetailsRepository){
        this.apiDetailsRepository=apiDetailsRepository;
    }
    //create a new api detail
     @Transactional
      public ApiDetails createApiDetails(ApiDetails apiDetails){
        return apiDetailsRepository.save(apiDetails);
     }
     public List<ApiDetails> getAllApiDetails(){
        return apiDetailsRepository.findAll();
     }
     public ApiDetails getApiDetailsById(UUID uuid){
         return apiDetailsRepository.findById(uuid)
                 .orElseThrow(() -> new RuntimeException("ApiDetails not found with id: " + uuid));
     }
     @Transactional
    public ApiDetails updateApiDetails(UUID uuid, ApiDetails updatedApiDetails){
        ApiDetails existingApiDetails = getApiDetailsById(uuid);

       existingApiDetails.setMethod(updatedApiDetails.getMethod());
        existingApiDetails.setDescription(updatedApiDetails.getDescription());
        existingApiDetails.setIsDeprecated(updatedApiDetails.getIsDeprecated());
        existingApiDetails.setPath(updatedApiDetails.getPath());
        existingApiDetails.setAuthType(updatedApiDetails.getAuthType());
        existingApiDetails.setRequestBody(updatedApiDetails.getRequestBody());
        existingApiDetails.setRequestParam(updatedApiDetails.getRequestParam());
        existingApiDetails.setRequestQuery(updatedApiDetails.getRequestQuery());
        existingApiDetails.setResponseBody(updatedApiDetails.getResponseBody());
        existingApiDetails.setResponseStatusCode(updatedApiDetails.getResponseStatusCode());

        return apiDetailsRepository.save(existingApiDetails);
     }
     @Transactional
     public void deleteApiDetails(UUID uuid){
        ApiDetails existingApiDetails = getApiDetailsById(uuid);
        apiDetailsRepository.delete(existingApiDetails);
     }
}
