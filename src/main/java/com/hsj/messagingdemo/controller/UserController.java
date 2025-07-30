package com.hsj.messagingdemo.controller;

import org.springframework.web.bind.annotation.RestController;

import com.hsj.messagingdemo.dto.AuthenticationRequest;
import com.hsj.messagingdemo.dto.RegistrationRequest;
import com.hsj.messagingdemo.model.ProfileImage;
import com.hsj.messagingdemo.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.RememberMeAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    UserService userService;

    @Autowired
    RememberMeServices rememberMeServices;

    @PostMapping("/register")
    public CsrfToken registerPubKey(CsrfToken token,HttpServletRequest servletRequest, HttpServletResponse response,@RequestBody RegistrationRequest request) throws InvalidKeySpecException, NoSuchAlgorithmException, IOException {
        
        rememberMeServices.loginSuccess(servletRequest, response, userService.getSpingSecurityAuthentication(userService.saveUser(request)));
        return token;
    }

    @PutMapping("/profile/{id}")
    public String userProfile(@PathVariable String id, @RequestBody ProfileImage entity) {
        userService.setProfile(id, entity);
        return "Success";
    }
    

}
