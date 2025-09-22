package com.hsj.messagingdemo.filter;

import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import com.hsj.messagingdemo.auth.DigitialSignatureAuthenticationConverter;
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
