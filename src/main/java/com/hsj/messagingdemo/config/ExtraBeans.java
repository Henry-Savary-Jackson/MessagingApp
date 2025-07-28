package com.hsj.messagingdemo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;

import com.hsj.messagingdemo.service.UserService;

@Configuration
public class ExtraBeans {

    @Value("remember-me-key")
    String rememberMeKey;

    @Bean
    RememberMeServices rememberMeServices() {
        return new TokenBasedRememberMeServices(rememberMeKey, userDetailsService());
    }

    @Autowired
    UserService userService;

    @Bean
    UserDetailsService userDetailsService() {

        return (username) -> {
            return userService.getUserByUsername(username).orElseThrow();
        };
    }
}
