package com.hsj.messagingdemo.filter;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.security.spec.InvalidKeySpecException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.converter.json.MappingJacksonInputMessage;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.RememberMeAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExceptionResolver;

import com.hsj.messagingdemo.auth.DigitialSignatureAuthenticationConverter;
import com.hsj.messagingdemo.dto.AuthenticationRequest;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.utils.CryptoUtils;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
@Component
public class DigitalSignatureAuthenticationFilter extends AbstractAuthenticationProcessingFilter {
    private static final DigitialSignatureAuthenticationConverter converter = new DigitialSignatureAuthenticationConverter();


    public DigitalSignatureAuthenticationFilter(RequestMatcher requiresAuthenticationRequestMatcher) {
        super(requiresAuthenticationRequestMatcher);
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException, IOException, ServletException {
        Authentication authentication = converter.convert(request);
        if (authentication == null){
            return null;
        }
        Authentication result =  this.getAuthenticationManager().authenticate(authentication);
        return result;
   }

}
