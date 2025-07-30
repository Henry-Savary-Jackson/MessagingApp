package com.hsj.messagingdemo.service;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.hsj.messagingdemo.dto.ChatMessage;

public class KafkaEventListener {

    @Autowired
    SimpMessagingTemplate template;

    private String userId ;


    public KafkaEventListener(String userId){
        this.userId = userId;
    }

    public void listen(ConsumerRecord<String, ChatMessage> data) {
        ChatMessage message = data.value();
        template.convertAndSendToUser(userId,"/chat/%s".formatted(message.getChatId()),data.value());
    }
    
}
