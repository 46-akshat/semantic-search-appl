package com.example.SemanticSearchAppl.dto;

import com.example.SemanticSearchAppl.entity.ApiMethod;
import com.example.SemanticSearchAppl.entity.AuthType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Data
@Getter
@Setter
public class CreateApi {

    private ApiMethod method;
    private String description;
    private Boolean isDeprecated ;
    private String path;
    private AuthType authType;
    private String requestBody;
    private String requestParam;
    private String requestQuery;
    private String responseBody;
    private List<Integer> responseStatusCode;
}
