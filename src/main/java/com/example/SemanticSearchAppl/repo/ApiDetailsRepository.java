package com.example.SemanticSearchAppl.repo;

import com.example.SemanticSearchAppl.entity.ApiDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ApiDetailsRepository extends JpaRepository<ApiDetails, UUID>{
}
