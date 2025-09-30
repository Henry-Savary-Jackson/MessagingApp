package com.hsj.messagingdemo.controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.kafka.config.KafkaListenerEndpoint;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.security.access.method.P;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import com.google.protobuf.InvalidProtocolBufferException;
import com.hsj.messagingdemo.dto.Messages.ChatMessage;
import com.hsj.messagingdemo.dto.Messages.MessageType;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.service.KafkaListenerCreator;
import com.hsj.messagingdemo.service.MessageService;

@Controller
public class WebSocketController {

    @Autowired
    private KafkaTemplate<String, byte[]> kafkaTemplate;

    @Autowired
    MessageService messageService;

    @Autowired
    KafkaListenerCreator kafkaListenerCreator;

    @MessageMapping("/send/{user_id}")
    public void sendMessageMap(@DestinationVariable String user_id, @Payload byte[] message, Principal principal)
            throws Exception {
        User user = (User) ((Authentication) principal).getPrincipal();
        if (user == null) {
            throw new NullPointerException("User not found!");
        }
        try {
            ChatMessage newMessage = ChatMessage.parseFrom(message);
            ChatMessage.Builder builder = newMessage.toBuilder();
            newMessage = builder.setTimestamp((long) LocalDateTime.now().toEpochSecond(ZoneOffset.ofHours(2))).build();
            kafkaTemplate.send(new ProducerRecord<String, byte[]>(user_id, newMessage.toByteArray()));
        } catch (InvalidProtocolBufferException ie) {
            throw ie;
        }
    }

    @SubscribeMapping("/user/messages")
    private void onSubscribe(SimpMessageHeaderAccessor headerAccessor, Principal principal)
            throws Exception {
        User user = (User) ((Authentication) principal).getPrincipal();
        if (user == null) {
            throw new NullPointerException("User not found!");
        }

        KafkaListenerEndpoint endpoint = kafkaListenerCreator.createAndRegisterListener(
                user.getId(), user.getUsername(), headerAccessor.getSessionId(), 0);

        messageService.linkUserToKafkaEventListener(user.getId(), endpoint.getId());

    }

    @EventListener
    private void handleSessionDisconnect(SessionDisconnectEvent event) throws Exception {
        // remove all relevant kafka listeners
        Authentication token = (Authentication) event.getUser();
        if (token == null) {
            throw new Exception("Not token.");
        }
        User user = (User) token.getPrincipal();
        if (user == null) {
            throw new Exception("User not found.");
        }
        messageService.getKafkaListenersForUser(user.getId()).forEach((id) -> {
            kafkaListenerCreator.stopListener(id);
        });
        messageService.removeUsersKafkaEventListeners(user.getId());
    }

    @EventListener
    private void handleSessionUnsub(SessionUnsubscribeEvent event) throws Exception {
        // remove all relevant kafka listeners
        Authentication token = (Authentication) event.getUser();
        if (token == null) {
            throw new Exception("Not token.");
        }
        User user = (User) token.getPrincipal();

        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());

        String destination = headers.getDestination();
        if (destination == null)
            return;
        String listenerId = KafkaListenerCreator.generateListenerId(user.getId(), headers.getSessionId());

        messageService.unLinkUserToKafkaEventListener(user.getId(), listenerId);
        kafkaListenerCreator.stopListener(listenerId);
    }
}
