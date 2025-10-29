package com.example.SemanticSearchAppl.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)        // disable CSRF (for POST/PUT testing)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()        // allow all requests
                )
                .httpBasic(AbstractHttpConfigurer::disable) // disable basic auth
                .formLogin(AbstractHttpConfigurer::disable);  // disable form login

        return http.build();
    }
}
