package com.hsj.messagingdemo.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;

import com.hsj.messagingdemo.service.UserService;

@EnableWebSecurity
@Configuration
public class SecurityConfig {

    @Value("remember-me-key")
    String rememberMeKey;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(
                (a) -> a.requestMatchers("/user/login", "/user/register").permitAll().anyRequest().authenticated())
                .rememberMe(rememberMe -> rememberMe.key(rememberMeKey)).csrf(c -> c.disable())
                .cors((c) -> c.disable());
        return http.build();
    }

    @Autowired
    UserService userService;

    // @Bean
    // AuthenticationManager authenticationManager() {
    // AuthenticationManager authmanager = new ProviderManager(List.of(new
    // SignatureAuthenticationProvider()));
    // return authmanager;
    // }

    @Bean
    UserDetailsService userDetailsService() {

        return (username) -> {
            return userService.getUserByUsername(username).orElseThrow();
        };
    }
}
