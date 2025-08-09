package com.hsj.messagingdemo.service;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.broker.DefaultSubscriptionRegistry;
import org.springframework.messaging.simp.broker.SimpleBrokerMessageHandler;
import org.springframework.messaging.simp.user.DefaultUserDestinationResolver;
import org.springframework.messaging.simp.user.UserDestinationMessageHandler;
import org.springframework.messaging.support.ExecutorSubscribableChannel;
import org.springframework.web.socket.messaging.DefaultSimpUserRegistry;

import com.hsj.messagingdemo.dto.ChatMessage;

public class KafkaEventListener {

    private SimpMessagingTemplate template;
    private String userId ;


    public KafkaEventListener(String userId, SimpMessagingTemplate template){
        this.userId = userId;
        this.template = template;
    }

    
    public void listen(ConsumerRecord<String, ChatMessage> data) {
        template.convertAndSendToUser(userId,"/messages",data.value()); 
    }
    
}
