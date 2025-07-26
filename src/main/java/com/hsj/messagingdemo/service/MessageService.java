package com.hsj.messagingdemo.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hsj.messagingdemo.model.Chat;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.repo.ChatRepo;
import com.hsj.messagingdemo.repo.MessageRepo;

@Service
public class MessageService {

    @Autowired
    MessageRepo messageRepo;

    @Autowired
    ChatRepo chatRepo;

    public Optional<Chat> getChatById(UUID id){
        return chatRepo.findById(id);
    }

    public Chat createChat(User userInitial){
        Chat chat = Chat.builder().users(List.of(userInitial.getId())).build();
        chatRepo.save(chat);
        return chat;
    }

    public void addUserToChat(Chat chat, User user){
        chat.getUsers().add(user.getId());
        chatRepo.save(chat);

    }

}
