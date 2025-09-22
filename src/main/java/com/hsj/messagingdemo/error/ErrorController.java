package com.hsj.messagingdemo.error;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException.Forbidden;
import com.hsj.messagingdemo.dto.ErrorMessage;

@RestControllerAdvice
public class ErrorController {

    private static ResponseEntity<ErrorMessage> generateErrorResponse(ErrorMessage e) {
        return ResponseEntity.status(HttpStatusCode.valueOf(e.getCode())).body(e);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorMessage> onAuthError(AuthenticationException a) {
        return generateErrorResponse(ErrorMessage.builder().code(401).message(a.getMessage())
                .advice("Login with proper credentials.").build());

    }

    @ExceptionHandler(Forbidden.class)
    public ResponseEntity<ErrorMessage> onForbidden(Forbidden a) {
        return generateErrorResponse(ErrorMessage.builder().code(403).message("Unauthenticated/Unauthorized")
                .advice("Login with proper credentials.").build());
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorMessage> onUsernameNotFound(UsernameNotFoundException a) {
        return generateErrorResponse(ErrorMessage.builder().code(404)
                .message("User %s doesnt exist".formatted(a.getAuthenticationRequest().getName()))
                .advice("Try different username").build());

    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorMessage> onUsernameNotFound(NoSuchElementException a) {
        return generateErrorResponse(ErrorMessage.builder().code(404)
                .message("Not found: %s".formatted(a.getMessage()))
                .advice("Enter correct name/id for element").build());

    }

    @ExceptionHandler(SignatureException.class)
    public ResponseEntity<ErrorMessage> onSigError(SignatureException a) {
        return generateErrorResponse(
                ErrorMessage.builder().code(400).message("Incorrect private key and/or signature provided.")
                        .advice("Make usre you use the correct private key").build());

    }

    @ExceptionHandler(NoSuchAlgorithmException.class)
    public ResponseEntity<ErrorMessage> onNoSuchAlgo(NoSuchAlgorithmException a) {
        return generateErrorResponse(
                ErrorMessage.builder().code(500).message("Error server-side. An invalid ID for an alogrithm was used.")
                        .advice("Admin should check the logs.").build());
    }

    @ExceptionHandler(InvalidKeyException.class)
    public ResponseEntity<ErrorMessage> onInvalidKey(InvalidKeyException a) {
        return generateErrorResponse(ErrorMessage.builder().code(400)
                .message("Incorrect private key and/or signature provided.")
                .advice("Make sure you use the correct private key file and that it is not corrupted.").build());
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<ErrorMessage> onIoError(SignatureException a) {
        return generateErrorResponse(ErrorMessage.builder().code(500).message("An IOError ocurred on the server.")
                .advice("Admin should check the logs.").build());
    }
}