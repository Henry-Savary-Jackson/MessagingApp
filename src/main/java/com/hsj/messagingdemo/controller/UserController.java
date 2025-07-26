package com.hsj.messagingdemo.controller;

import org.springframework.web.bind.annotation.RestController;

import com.hsj.messagingdemo.model.AuthenticationRequest;
import com.hsj.messagingdemo.model.ProfileImage;
import com.hsj.messagingdemo.model.RegistrationRequest;
import com.hsj.messagingdemo.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @PostMapping("/register")
    public String registerPubKey(@RequestBody RegistrationRequest request) {
        userService.saveUser(request);
        return "Success";
    }

    @PostMapping("/login")
    public String loginMethod(@RequestBody AuthenticationRequest request) throws AuthenticationException{
        SecurityContextHolder.getContext().setAuthentication(userService.loginUser(request));
        return "Success";
    }


    @PutMapping("/profile/{id}")
    public String userProfile(@PathVariable String id, @RequestBody ProfileImage entity) {
        userService.setProfile(id, entity);
        return "Success";
    }
    
    


}
