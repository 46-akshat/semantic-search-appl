package com.example.SemanticSearchAppl.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Simple controller to serve the main web page
 */
@Controller
public class WebController {
    
    /**
     * Serves the main index.html page when user visits the root URL
     */
    @GetMapping("/")
    public String index() {
        return "index.html";
    }
}