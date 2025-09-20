package com.hsj.messagingdemo.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException.BadRequest;

import com.hsj.messagingdemo.model.Chat;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.repo.ChatRepo;
import com.hsj.messagingdemo.service.MessageService;
import com.hsj.messagingdemo.service.UserService;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    MessageService messageService;

    @Autowired
    UserService userService;

    @PostMapping("/delete")
    public String delete(@RequestBody UUID id) throws Exception {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Chat chat = messageService.getChatById(id).orElseThrow();
        if (!chat.getOwnerId().equals(user.getId())){
            throw new Exception("Not owner."); 
        }

        messageService.deleteChat(chat);
        return "Success";
    }
}
