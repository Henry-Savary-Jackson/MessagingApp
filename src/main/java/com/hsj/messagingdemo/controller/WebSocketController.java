package com.hsj.messagingdemo.controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.UUID;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import com.hsj.messagingdemo.model.Chat;
import com.hsj.messagingdemo.model.ChatMessage;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.service.MessageService;

@Controller
public class WebSocketController {

    @Autowired
    private KafkaTemplate<String, ChatMessage> kafkaTemplate;

    @Autowired
    MessageService messageService;

    @MessageMapping("/chat")
    public void sendMessageMap(@Payload ChatMessage message, Principal principal) throws Exception {
        User user = (User)principal;
        if (user == null){
            throw new NullPointerException("User not found!");
        }

        Chat chat = messageService.getChatById(UUID.fromString(message.getChatId())).orElseThrow(); 
        if (!chat.getUsers().contains(user.getId())){
            throw new Exception("User not in chat.");
        }
        // verify joining chats 
        message.setTimestamp((int)LocalDateTime.now().toEpochSecond(ZoneOffset.UTC));
        kafkaTemplate.send(new ProducerRecord<String,ChatMessage>(message.getChatId(), message));
    }


}
