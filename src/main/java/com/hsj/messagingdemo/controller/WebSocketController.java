package com.hsj.messagingdemo.controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.kafka.config.KafkaListenerEndpoint;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import com.hsj.messagingdemo.dto.ChatMessage;
import com.hsj.messagingdemo.model.Chat;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.service.KafkaListenerCreator;
import com.hsj.messagingdemo.service.MessageService;

@Controller
public class WebSocketController {

    @Autowired
    private KafkaTemplate<String, ChatMessage> kafkaTemplate;

    @Autowired
    MessageService messageService;

    @Autowired
    KafkaListenerCreator kafkaListenerCreator;

    @MessageMapping("/chat")
    public void sendMessageMap(@Payload ChatMessage message, Principal principal) throws Exception {
        User user = (User) principal;
        if (user == null) {
            throw new NullPointerException("User not found!");
        }

        Chat chat = messageService.getChatById(UUID.fromString(message.getChatId())).orElseThrow();
        if (!chat.getUsers().contains(user.getId())) {
            throw new Exception("User not in chat.");
        }
        // verify joining chats
        message.setTimestamp((int) LocalDateTime.now().toEpochSecond(ZoneOffset.UTC));
        kafkaTemplate.send(new ProducerRecord<String, ChatMessage>(message.getChatId(), message));
    }

    @SubscribeMapping("/chat/{id}")
    private void onSubscribe(@PathVariable UUID id, Principal principal, @Header("offset") int offset)
            throws Exception {
        User user = (User) principal;
        if (user == null) {
            throw new NullPointerException("User not found!");
        }
        Chat chat = messageService.getChatById(id).orElseThrow();
        if (!chat.getUsers().contains(user.getId())) {
            throw new Exception("User not in chat.");
        }
        // get the offset

        KafkaListenerEndpoint endpoint = kafkaListenerCreator.createAndRegisterListener(id, user.getId(), offset);

        messageService.linkUserToKafkaEventListener(user.getId(), endpoint.getId());

    }

    @EventListener
    private void handleSessionDisconnect(SessionDisconnectEvent event) throws Exception {
        // remove all relevant kafka listeners
        User user = (User) event.getUser();
        if (user == null) {
            throw new Exception("User not found.");
        }
        messageService.getKafkaListenersForUser(user.getId()).forEach((id) -> kafkaListenerCreator.stopListener(id));
    }

    @EventListener
    private void handleSessionUnsub(SessionUnsubscribeEvent event) throws Exception {
        // remove all relevant kafka listeners
        User user = (User) event.getUser();
        if (user == null) {
            throw new Exception("User not found.");
        }

        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());

        String destination = headers.getDestination();
        String chatId = destination.substring(destination.lastIndexOf("/"));
        String listenerId = kafkaListenerCreator.generateListenerId(UUID.fromString(chatId), user.getId());

        messageService.unLinkUserToKafkaEventListener(user.getId(), listenerId);
        kafkaListenerCreator.stopListener(listenerId);
    }
}
