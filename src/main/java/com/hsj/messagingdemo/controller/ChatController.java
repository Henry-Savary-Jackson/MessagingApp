package com.hsj.messagingdemo.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException.BadRequest;

import com.hsj.messagingdemo.model.Chat;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.repo.ChatRepo;
import com.hsj.messagingdemo.service.MessageService;

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

    @PostMapping("/join")
    public Chat postMethodName(@RequestBody String id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Chat chat = messageService.getChatById(id).orElseThrow();

        messageService.addUserToChat(chat, user);
        return chat;
    }


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

    @PostMapping("/leave")
    public String leaveChat(@RequestBody UUID id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Chat chat = messageService.getChatById(id).orElseThrow();

        messageService.removeUserFromChat(chat, user);
        
        return "Success";
    }

    @GetMapping("/list")
    public List<Chat> getChats() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return messageService.getChatByUserId(user.getId());
    }

    @PostMapping("/create")
    public Chat postMethodName(@RequestBody String name) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return messageService.createChat(user, name);
    }
}
