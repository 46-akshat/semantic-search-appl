package com.example.SemanticSearchAppl.controller;

import com.example.SemanticSearchAppl.dto.CreateApi;
import com.example.SemanticSearchAppl.entity.ApiDetails;
import com.example.SemanticSearchAppl.service.ApiDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/details")
public class ApiController {

    private final ApiDetailService apiDetailService;

    public ApiController(ApiDetailService apiDetailService){
        this.apiDetailService=apiDetailService;
    }

    @PostMapping
    public ResponseEntity<ApiDetails> createApiDetails(@RequestBody CreateApi createApi){
        ApiDetails createdApi=apiDetailService.createApiDetails(createApi);
        return new ResponseEntity<>(createdApi, HttpStatus.CREATED);
    }

    @GetMapping
    public List<ApiDetails> getAllApiDetails(){
        return apiDetailService.getAllApiDetails();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiDetails> getApiDetailsById(@PathVariable UUID id){
        return ResponseEntity.ok(apiDetailService.getApiDetailsById(id));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ApiDetails> updateApiDetails(@PathVariable UUID id,@RequestBody CreateApi createApi){
        ApiDetails updatedApi=apiDetailService.updateApiDetails(id,createApi);
        return ResponseEntity.ok(updatedApi);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApiDetails(@PathVariable UUID id){
        apiDetailService.deleteApiDetails(id);
        return ResponseEntity.noContent().build();
    }
}
