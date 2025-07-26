package com.hsj.messagingdemo.service;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.config.KafkaListenerContainerFactory;
import org.springframework.kafka.config.KafkaListenerEndpoint;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.kafka.config.MethodKafkaListenerEndpoint;
import org.springframework.messaging.handler.annotation.support.DefaultMessageHandlerMethodFactory;
import org.springframework.stereotype.Service;

import com.hsj.messagingdemo.model.ChatMessage;

@Service
public class KafkaListenerCreator {

    @Autowired
    private KafkaListenerEndpointRegistry kafkaListenerEndpointRegistry;

    @Autowired
    private KafkaListenerContainerFactory kafkaListenerContainerFactory;

    private KafkaListenerEndpoint createKafkaListenerEndpoint(UUID chatUuid, String userId) {
        MethodKafkaListenerEndpoint<String, ChatMessage> kafkaListenerEndpoint = createDefaultMethodKafkaListenerEndpoint(
                chatUuid, userId);
        kafkaListenerEndpoint.setBean(new KafkaEventListener(userId));
        try {
            kafkaListenerEndpoint.setMethod(KafkaEventListener.class.getMethod("listen", ConsumerRecord.class));
        } catch (NoSuchMethodException e) {
            throw new RuntimeException("Attempt to call a non-existent method " + e);
        }
        return kafkaListenerEndpoint;
    }

    private MethodKafkaListenerEndpoint<String, ChatMessage> createDefaultMethodKafkaListenerEndpoint(UUID chatUuid,
            String userId) {
        MethodKafkaListenerEndpoint<String, ChatMessage> kafkaListenerEndpoint = new MethodKafkaListenerEndpoint<>();
        String listenerId = generateListenerId(chatUuid, userId);
        kafkaListenerEndpoint.setId(listenerId);
        kafkaListenerEndpoint.setGroupId(listenerId);
        kafkaListenerEndpoint.setAutoStartup(true);
        kafkaListenerEndpoint.setTopics(chatUuid.toString());
        kafkaListenerEndpoint.setMessageHandlerMethodFactory(new DefaultMessageHandlerMethodFactory());
        return kafkaListenerEndpoint;
    }

    private String generateListenerId(UUID chaUuid, String userId) {
        return "%s-%s".formatted(chaUuid.toString(), userId);
    }

    public void createAndRegisterListener(UUID chatUuid, String userId) {

        KafkaListenerEndpoint listener = createKafkaListenerEndpoint(chatUuid, userId);
        kafkaListenerEndpointRegistry.registerListenerContainer(listener, kafkaListenerContainerFactory, true);
    }
}