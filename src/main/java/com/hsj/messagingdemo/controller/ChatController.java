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
    public String postMethodName(@RequestBody UUID id) {
        User user = (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Chat chat = messageService.getChatById(id).orElseThrow();

        messageService.addUserToChat(chat, user);
        return "Success";
    }

    @GetMapping("/list")
    public List<UUID> getChats(){
        User user = (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return messageService.getChatByUserId(user.getId()).stream().map((chat)-> chat.getChatId()).toList();
    }

   @PostMapping("/create")
   public UUID postMethodName() {
        User user = (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (user == null){
            return null; // TODO: add error handler
        }
       return  messageService.createChat(user).getChatId();
   }
}
