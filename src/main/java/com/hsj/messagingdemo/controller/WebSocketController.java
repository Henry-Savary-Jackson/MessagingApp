package com.hsj.messagingdemo.controller;

import java.security.Principal;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.List;

import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.kafka.config.KafkaListenerEndpoint;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import com.google.protobuf.InvalidProtocolBufferException;
import com.hsj.messagingdemo.dto.Messages.ChatMessage;
import com.hsj.messagingdemo.dto.Messages.MessageHeader;
import com.hsj.messagingdemo.model.PrekeyBundleDB;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.service.KafkaListenerCreator;
import com.hsj.messagingdemo.service.MessageService;
import com.hsj.messagingdemo.service.UserService;
import com.hsj.messagingdemo.utils.CryptoUtils;

@Controller
public class WebSocketController {

    @Autowired
    private KafkaTemplate<String, byte[]> kafkaTemplate;

    @Autowired
    MessageService messageService;

    @Autowired
    UserService userService;

    @Autowired
    KafkaListenerCreator kafkaListenerCreator;

    @MessageMapping("/send/{user_id}")
    public void sendMessageMap(@DestinationVariable String user_id, @Payload byte[] message, Principal principal)
            throws Exception {
        try {
            ChatMessage newMessage = ChatMessage.parseFrom(message);
            ChatMessage.Builder builder = newMessage.toBuilder();

            // if X3DH message remove the relvant otp
            if (newMessage.hasMessageHeader()){
                MessageHeader messageHeader = newMessage.getMessageHeader();
                if (messageHeader.hasOneTimePrekey()){
                    // delete this one time prekey from the prekey bundle
                    byte[] otp_user = messageHeader.getOneTimePrekey().toByteArray();
                    userService.removeOtp(user_id, otp_user);
                }
            }
            // set timestamp correctly
            newMessage = builder.setTimestamp(Instant.now().toEpochMilli()).build();
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
        long timestamp =(long) headerAccessor.getMessageHeaders().getOrDefault("last_timestamp", Instant.now().toEpochMilli());

        if (messageService.isUserListeningToChat(user.getId(), headerAccessor.getSessionId()))
            return;
        KafkaListenerEndpoint endpoint = kafkaListenerCreator.createAndRegisterListener(
                user.getId(), user.getUsername(), headerAccessor.getSessionId(),timestamp);

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

        String listenerId = KafkaListenerCreator.generateListenerId(user.getId(), headers.getSessionId());

        kafkaListenerCreator.stopListener(listenerId);
        messageService.unLinkUserToKafkaEventListener(user.getId(), listenerId);
    }
}
