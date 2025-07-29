package com.hsj.messagingdemo.model;

import java.util.Collection;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

public class DigitalSignatureAuthenticationToken extends AbstractAuthenticationToken {

    private Object username;
    private AuthenticationRequest authenticationRequest;

    public DigitalSignatureAuthenticationToken(Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
    }

    public DigitalSignatureAuthenticationToken(Object username, AuthenticationRequest authenticationRequest) {
        super(null);
        this.username = username;
        this.authenticationRequest = authenticationRequest;
        setDetails(authenticationRequest);
    }

    @Override
    public AuthenticationRequest getCredentials() {
        return authenticationRequest;
    }

    @Override
    public Object getPrincipal() {
        return username;
    }

}
