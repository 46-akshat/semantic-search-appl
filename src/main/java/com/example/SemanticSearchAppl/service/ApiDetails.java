package com.example.SemanticSearchAppl.service;

import com.example.SemanticSearchAppl.dto.CreateApi;

import java.util.List;
import java.util.UUID;

public interface ApiDetails {

    public com.example.SemanticSearchAppl.entity.ApiDetails createApiDetails(CreateApi createApi);

    public List<com.example.SemanticSearchAppl.entity.ApiDetails> getAllApiDetails();

    public com.example.SemanticSearchAppl.entity.ApiDetails getApiDetailsById(UUID uuid);

    public com.example.SemanticSearchAppl.entity.ApiDetails updateApiDetails(UUID uuid, CreateApi createApi);

    public void deleteApiDetails(UUID uuid);
}
