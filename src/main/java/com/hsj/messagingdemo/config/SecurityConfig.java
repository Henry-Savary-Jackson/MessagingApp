package com.hsj.messagingdemo.config;

import java.beans.Customizer;
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
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.rememberme.RememberMeAuthenticationFilter;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices.RememberMeTokenAlgorithm;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import com.hsj.messagingdemo.filter.DigitalSignatureAuthenticationFilter;
import com.hsj.messagingdemo.service.UserService;

@EnableWebSecurity
@Configuration
public class SecurityConfig {


    @Value("${remember-me-key}")
    String rememberMeKey;

    @Autowired
    UserService userService;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(
                (a) -> a.requestMatchers("/csrf", "/user/login", "/user/register").permitAll().anyRequest()
                        .authenticated())
                .addFilterBefore(digitalSignatureAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .userDetailsService(userDetailsService())
                .rememberMe(rememberMe -> rememberMe.rememberMeServices(rememberMeServices(userDetailsService())))
                .csrf((csrf) -> csrf
                .csrfTokenRepository(new HttpSessionCsrfTokenRepository()))
                .cors((c) -> c.disable());
        return http.build();
    }

    @Bean
    DigitalSignatureAuthenticationFilter digitalSignatureAuthenticationFilter() throws Exception {
        DigitalSignatureAuthenticationFilter filter = new DigitalSignatureAuthenticationFilter(
                PathPatternRequestMatcher.withDefaults().matcher("/user/login"));
        filter.setAuthenticationManager(authenticationManager());
        filter.setRememberMeServices(rememberMeServices(userDetailsService()));
        return filter;
    }

    @Bean
    RememberMeServices rememberMeServices(UserDetailsService userDetailsService) {
        RememberMeTokenAlgorithm encodingAlgorithm = RememberMeTokenAlgorithm.SHA256;
        TokenBasedRememberMeServices rememberMe = new CustomRememberMeServices(rememberMeKey, userDetailsService,
                encodingAlgorithm);
        rememberMe.setTokenValiditySeconds(12*60*60);
        rememberMe.setMatchingAlgorithm(RememberMeTokenAlgorithm.MD5);
        return rememberMe;
    }

    @Bean
    AuthenticationManager authenticationManager() {
        AuthenticationManager authmanager = new ProviderManager(
                List.of(new DigitalSignatureAuthenticationProvider(userDetailsService())));
        return authmanager;
    }

    @Bean
    UserDetailsService userDetailsService() {
        return (username) -> userService.getUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
    }
}
