package com.example.SemanticSearchAppl.entity;


import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity(name = "api_details")
@EntityListeners(AuditingEntityListener.class)
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

    @ElementCollection
    @CollectionTable(name = "api_response_status_codes", joinColumns = @JoinColumn(name = "api_details_id"))
    @Column(name = "status_code")
    private List<Integer> responseStatusCode;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
