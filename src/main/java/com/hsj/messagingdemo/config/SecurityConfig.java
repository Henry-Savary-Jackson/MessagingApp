package com.hsj.messagingdemo.config;

import java.beans.Customizer;
import java.util.Arrays;
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
import org.springframework.security.web.authentication.logout.HeaderWriterLogoutHandler;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.security.web.authentication.rememberme.RememberMeAuthenticationFilter;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices.RememberMeTokenAlgorithm;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.header.writers.ClearSiteDataHeaderWriter;
import org.springframework.security.web.header.writers.ClearSiteDataHeaderWriter.Directive;
import org.springframework.security.web.method.annotation.CsrfTokenArgumentResolver;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.socket.sockjs.transport.handler.DefaultSockJsService;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hsj.messagingdemo.auth.CustomRememberMeServices;
import com.hsj.messagingdemo.auth.DigitalSignatureAuthenticationProvider;
import com.hsj.messagingdemo.filter.DigitalSignatureAuthenticationFilter;
import com.hsj.messagingdemo.filter.ExceptionHandlerFilter;
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
    ObjectMapper mapper;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        
        http.authorizeHttpRequests(
                (a) -> a.requestMatchers("/csrf", "/user/login", "/user/register").permitAll().anyRequest()
                        .authenticated())
                .addFilterBefore(digitalSignatureAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(exceptionHandlerFilter, LogoutFilter.class)
                .userDetailsService(userDetailsService())
                .rememberMe(rememberMe -> rememberMe.rememberMeServices(rememberMeServices(userDetailsService())))
                .logout((logout) -> logout.addLogoutHandler(
                        new HeaderWriterLogoutHandler(new ClearSiteDataHeaderWriter(Directive.COOKIES)))
                        .logoutUrl("/user/logout").invalidateHttpSession(true)
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler()))
                .csrf((csrf) -> csrf
                        .csrfTokenRepository(httpSessionCsrfTokenRepository()))
                .cors((c) -> c.configurationSource(corsConfigurationSource()));
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
        configuration.setAllowedMethods(Arrays.asList("POST", "GET", "PUT", "DELETE"));
        configuration.setAllowCredentials(true);
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
                    .write(mapper.writeValueAsString(
                            httpSessionCsrfTokenRepository().loadDeferredToken(request, response).get()));
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
