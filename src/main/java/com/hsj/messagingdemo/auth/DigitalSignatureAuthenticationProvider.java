package com.hsj.messagingdemo.auth;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.security.spec.InvalidKeySpecException;
import java.util.List;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.RememberMeAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.hsj.messagingdemo.dto.AuthenticationRequest;
import com.hsj.messagingdemo.dto.DigitalSignatureAuthenticationToken;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.utils.CryptoUtils;

public class DigitalSignatureAuthenticationProvider implements AuthenticationProvider {

    UserDetailsService userDetailsService;

    public DigitalSignatureAuthenticationProvider(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Authentication authenticate(Authentication authentication)
            throws AuthenticationException, UsernameNotFoundException {

        try {
            DigitalSignatureAuthenticationToken token = (DigitalSignatureAuthenticationToken) authentication;
            if (token == null)
                throw new AuthenticationServiceException("Null token");

            AuthenticationRequest request = token.getCredentials();
            User user = (User) userDetailsService.loadUserByUsername(request.getUsername());
            if (!CryptoUtils.verifySignature(user.getBase64PublicKey(), request.getChallenge(),
                    request.getChallengeSignature())) {

                    throw new SignatureException("Digital Signature did not match.");
            }
            // token.setAuthenticated(true);
            return new DigitalSignatureAuthenticationToken(user, request);
        } catch (InvalidKeyException | SignatureException | NoSuchAlgorithmException | InvalidKeySpecException
                | IOException e) {
            throw new AuthenticationServiceException(e.getMessage());
        }
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(DigitalSignatureAuthenticationToken.class);
    }

}
