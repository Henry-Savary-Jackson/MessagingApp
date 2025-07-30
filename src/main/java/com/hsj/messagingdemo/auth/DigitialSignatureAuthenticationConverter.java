package com.hsj.messagingdemo.auth;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.graphql.GraphQlProperties.Http;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.converter.json.MappingJacksonInputMessage;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationConverter;
import org.springframework.stereotype.Component;

import com.hsj.messagingdemo.dto.AuthenticationRequest;
import com.hsj.messagingdemo.dto.DigitalSignatureAuthenticationToken;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class DigitialSignatureAuthenticationConverter implements AuthenticationConverter {

    MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();

    @Override
    public Authentication convert(HttpServletRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            AuthenticationRequest authenticationRequest = (AuthenticationRequest) converter.read(
                    AuthenticationRequest.class,
                    new MappingJacksonInputMessage(request.getInputStream(), headers));

            return new DigitalSignatureAuthenticationToken(authenticationRequest.getUsername(), authenticationRequest);
        } catch (HttpMessageNotReadableException | IOException e) {
            e.printStackTrace();
            return null;
        }
    }

}
