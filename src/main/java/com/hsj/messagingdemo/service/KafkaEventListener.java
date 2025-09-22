package com.hsj.messagingdemo.service;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.hsj.messagingdemo.dto.Messages.ChatMessage;

public class KafkaEventListener {

    private SimpMessagingTemplate template;
    private String username ;

    private String sessionId;

    public KafkaEventListener(String username,String sessionId, SimpMessagingTemplate template){
        this.username = username;
        this.template = template;
        this.sessionId = sessionId;
    }

    
    public void listen(ConsumerRecord<String, ChatMessage> data) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);
        headerAccessor.setSessionId(sessionId);
        headerAccessor.setLeaveMutable(true);
        template.convertAndSendToUser(username,"/messages",data.value(), headerAccessor.getMessageHeaders()); 
    }
    
}
