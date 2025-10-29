package com.example.SemanticSearchAppl.service;

import com.example.SemanticSearchAppl.dto.CreateApi;
import com.example.SemanticSearchAppl.repo.ApiDetailsRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApiDetailService implements ApiDetails {

    private final ApiDetailsRepository apiDetailsRepository;


    @Override
    @Transactional
    public com.example.SemanticSearchAppl.entity.ApiDetails createApiDetails(CreateApi createApi) {
        com.example.SemanticSearchAppl.entity.ApiDetails apiDetails = new com.example.SemanticSearchAppl.entity.ApiDetails();
        apiDetails.setMethod(createApi.getMethod());
        apiDetails.setDescription(createApi.getDescription());
        apiDetails.setIsDeprecated(createApi.getIsDeprecated());
        apiDetails.setPath(createApi.getPath());
        apiDetails.setAuthType(createApi.getAuthType());
        apiDetails.setRequestBody(createApi.getRequestBody());
        apiDetails.setRequestParam(createApi.getRequestParam());
        apiDetails.setRequestQuery(createApi.getRequestQuery());
        apiDetails.setResponseBody(createApi.getResponseBody());
        apiDetails.setResponseStatusCode(createApi.getResponseStatusCode());
        
        return apiDetailsRepository.save(apiDetails);
    }
    @Override
    public List<com.example.SemanticSearchAppl.entity.ApiDetails> getAllApiDetails() {
        return apiDetailsRepository.findAll();
    }
    @Override
    public com.example.SemanticSearchAppl.entity.ApiDetails getApiDetailsById(UUID uuid) {
        return apiDetailsRepository.findById(uuid)
                .orElseThrow(() -> new RuntimeException("ApiDetails not found with id: " + uuid));
    }
    @Override
    @Transactional
    public com.example.SemanticSearchAppl.entity.ApiDetails updateApiDetails(UUID uuid, CreateApi createApi) {
        com.example.SemanticSearchAppl.entity.ApiDetails existingApiDetails = getApiDetailsById(uuid);

        existingApiDetails.setMethod(createApi.getMethod());
        existingApiDetails.setDescription(createApi.getDescription());
        existingApiDetails.setIsDeprecated(createApi.getIsDeprecated());
        existingApiDetails.setPath(createApi.getPath());
        existingApiDetails.setAuthType(createApi.getAuthType());
        existingApiDetails.setRequestBody(createApi.getRequestBody());
        existingApiDetails.setRequestParam(createApi.getRequestParam());
        existingApiDetails.setRequestQuery(createApi.getRequestQuery());
        existingApiDetails.setResponseBody(createApi.getResponseBody());
        existingApiDetails.setResponseStatusCode(createApi.getResponseStatusCode());

        return apiDetailsRepository.save(existingApiDetails);
    }
    @Override
    @Transactional
    public void deleteApiDetails(UUID uuid) {
        com.example.SemanticSearchAppl.entity.ApiDetails existingApiDetails = getApiDetailsById(uuid);
        apiDetailsRepository.delete(existingApiDetails);
    }
}
