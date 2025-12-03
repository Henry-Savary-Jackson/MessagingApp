package com.hsj.messagingdemo.controller;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hsj.messagingdemo.dto.RegistrationRequest;
import com.hsj.messagingdemo.dto.UserChangeDTO;
import com.google.protobuf.InvalidProtocolBufferException;
import com.hsj.messagingdemo.dto.Messages.PreKeyBundle;
import com.hsj.messagingdemo.model.ProfileImage;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    UserService userService;

    @Autowired
    RememberMeServices rememberMeServices;

    @PostMapping("/register")
    public String registerPubKey(CsrfToken token, HttpServletRequest servletRequest, HttpServletResponse response,
            @RequestBody RegistrationRequest request)
            throws InvalidKeySpecException, NoSuchAlgorithmException, IOException {

        User user =userService.saveUser(request);
        rememberMeServices.loginSuccess(servletRequest, response,
                userService.getSpingSecurityAuthentication(user));
        return user.getId();
    }

    @PutMapping("/profile")
    public String putUser( @RequestBody UserChangeDTO userChangeDTO) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (currentUser == null){
            throw new AuthenticationServiceException("User is not logged in.");
        }
       userService.modifyUser(currentUser, userChangeDTO);
        return "Success";
    }

    @GetMapping("/profile/{id}")
    public ProfileImage getUserProfile(@PathVariable String id) {
        return userService.getUserById(id).getProfilePicture();
    }

    @GetMapping("/username/{id}")
    public String userProfile(@PathVariable String id) {
        return userService.getUserById(id).getUsername();
    }

    @GetMapping(value="/prekeybundle/{username}",produces="application/octet-stream")
    public byte[] fetchPrekeyBundle(@PathVariable String username) throws InvalidProtocolBufferException {
        User user = userService.getUserByUsername(username).orElseThrow();
        PreKeyBundle pk = PreKeyBundle.parseFrom(user.getPreKeyBundle());
        return pk.toBuilder().setId(user.getId()).build().toByteArray(); 
    }
    


}
