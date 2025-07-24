package com.hsj.messagingdemo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.hsj.messagingdemo.model.Message;


// @Compo.nent
@Component
public class KafkaEventListener {

    @Autowired
    SimpMessagingTemplate template;

    @KafkaListener(topics = "chat", groupId = "my-group-id")
    public void listen(@Payload Message data) {
        template.convertAndSend("/chat/messages",data);
    }
    
}
