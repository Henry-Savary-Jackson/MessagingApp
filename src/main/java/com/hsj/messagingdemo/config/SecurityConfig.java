package com.hsj.messagingdemo.config;

import java.util.Arrays;
import java.util.List;

import org.apache.catalina.filters.CorsFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.access.AccessDeniedHandlerImpl;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.HeaderWriterLogoutHandler;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.security.web.authentication.rememberme.RememberMeAuthenticationFilter;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices.RememberMeTokenAlgorithm;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.header.writers.ClearSiteDataHeaderWriter;
import org.springframework.security.web.header.writers.ClearSiteDataHeaderWriter.Directive;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hsj.messagingdemo.auth.CustomRememberMeServices;
import com.hsj.messagingdemo.auth.DigitalSignatureAuthenticationProvider;
import com.hsj.messagingdemo.error.CustomAccessDeniedHandler;
import com.hsj.messagingdemo.filter.DigitalSignatureAuthenticationFilter;
import com.hsj.messagingdemo.filter.ExceptionHandlerFilter;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.service.UserService;

@EnableWebSecurity
@Configuration
public class SecurityConfig {


    @Value("${remember-me-key}")
    String rememberMeKey;

    @Autowired
    UserService userService;

    @Autowired
    ExceptionHandlerFilter exceptionHandlerFilter;

    @Autowired 
    CustomAccessDeniedHandler customAccessDeniedHandler;

    @Autowired
    ObjectMapper mapper;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.authorizeHttpRequests(
                (a) -> a.requestMatchers("/csrf", "/user/login", "/user/register").permitAll().anyRequest()
                        .authenticated())
                .addFilterBefore(digitalSignatureAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(exceptionHandlerFilter, CsrfFilter.class)
                .userDetailsService(userDetailsService())
                .rememberMe(rememberMe -> rememberMe.rememberMeServices(rememberMeServices(userDetailsService())))
                .logout((logout) -> logout.addLogoutHandler(
                        new HeaderWriterLogoutHandler(new ClearSiteDataHeaderWriter(Directive.COOKIES)))
                        .logoutUrl("/user/logout").invalidateHttpSession(true)
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler()))
                .csrf((csrf) -> csrf
                        .csrfTokenRepository(httpSessionCsrfTokenRepository()).ignoringRequestMatchers("/ws/**", "/ws"))
                .cors((c) -> c.configurationSource(corsConfigurationSource()))
                .exceptionHandling((exceptionHandling) -> exceptionHandling.accessDeniedHandler(customAccessDeniedHandler));
        return http.build();
    }



    @Bean
    HttpSessionCsrfTokenRepository httpSessionCsrfTokenRepository() {
        return new HttpSessionCsrfTokenRepository();
    }

    @Bean
    UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("OPTIONS", "POST", "PATCH", "GET", "PUT", "DELETE"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(Arrays.asList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    DigitalSignatureAuthenticationFilter digitalSignatureAuthenticationFilter() throws Exception {
        DigitalSignatureAuthenticationFilter filter = new DigitalSignatureAuthenticationFilter(
                PathPatternRequestMatcher.withDefaults().matcher("/user/login"));
        filter.setAuthenticationManager(authenticationManager());
        filter.setRememberMeServices(rememberMeServices(userDetailsService()));
        filter.setAuthenticationFailureHandler((request, response, exception) -> {
            throw exception;
        });
        // this gives UUID instead of usual string in #ReponseMapping
        filter.setAuthenticationSuccessHandler((request, response, auth) -> {
            response.getWriter()
                    .write(((User) auth.getPrincipal()).getId());
        });
        return filter;
    }

    @Bean
    RememberMeServices rememberMeServices(UserDetailsService userDetailsService) {
        RememberMeTokenAlgorithm encodingAlgorithm = RememberMeTokenAlgorithm.SHA256;
        TokenBasedRememberMeServices rememberMe = new CustomRememberMeServices(rememberMeKey, userDetailsService,
                encodingAlgorithm);
        rememberMe.setTokenValiditySeconds(12 * 60 * 60);
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
