package com.example.SemanticSearchAppl.entity;


import jakarta.persistence.*;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity(name = "api_details")
@Data
public class ApiDetails {

// id, METHOD, desc, date of creation, date of updation, api url, request body/param/query , response

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(value = EnumType.STRING)
    private ApiMethod method;

    @Column(length = 300)
    private String description;

    private Boolean isDeprecated ;

    @Column(length = 500)
    private String path; // "/api/v1/users/{id}

    @Enumerated(EnumType.STRING)
    private AuthType authType;

    @Column(columnDefinition = "TEXT")
    private String requestBody;

    private String requestParam;

    private String requestQuery;

    @Column(columnDefinition = "TEXT")
    private String responseBody;

    private List<Integer> responseStatusCode;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

}
