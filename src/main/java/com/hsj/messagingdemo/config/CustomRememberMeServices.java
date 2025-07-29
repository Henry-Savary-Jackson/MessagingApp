package com.hsj.messagingdemo.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CustomRememberMeServices extends TokenBasedRememberMeServices {

    public CustomRememberMeServices(String key, UserDetailsService userDetailsService) {
        super(key, userDetailsService);
    }

    public CustomRememberMeServices(String key, UserDetailsService userDetailsService,RememberMeTokenAlgorithm algo) {
        super(key, userDetailsService, algo);
    }

    @Override
    public void loginSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication successfulAuthentication) {
        this.onLoginSuccess(request, response, successfulAuthentication);
    }

}
