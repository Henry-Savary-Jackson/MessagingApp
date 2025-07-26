package com.hsj.messagingdemo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.EventListener;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.service.KafkaListenerCreator;

@Component
public class SubscribeListener {
    @Autowired
    KafkaListenerCreator kafkaListenerCreator;

    @EventListener
    public void onSubscribe(@NonNull SessionSubscribeEvent event) {
        //add kafka listener
        User user = (User)event.getUser();
        kafkaListenerCreator.createAndRegisterListener();
    } 

     @EventListener
    private void handleSessionDisconnect(SessionDisconnectEvent event) {
        // remove all relevant kafka listeners
    }

}
