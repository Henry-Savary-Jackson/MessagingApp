package com.hsj.messagingdemo.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.kafka.ConcurrentKafkaListenerContainerFactoryConfigurer;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.KafkaListenerContainerFactory;
import org.springframework.kafka.config.KafkaListenerEndpoint;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.kafka.config.MethodKafkaListenerEndpoint;
import org.springframework.kafka.support.TopicPartitionOffset;
import org.springframework.messaging.handler.annotation.support.DefaultMessageHandlerMethodFactory;
import org.springframework.stereotype.Service;

import com.hsj.messagingdemo.dto.ChatMessage;

@Service
public class KafkaListenerCreator {

    @Autowired
    private KafkaListenerEndpointRegistry kafkaListenerEndpointRegistry;

    @Autowired
    private KafkaListenerContainerFactory kafkaListenerContainerFactory;

    private KafkaListenerEndpoint createKafkaListenerEndpoint(UUID chatUuid, String userId, int offset) {
        MethodKafkaListenerEndpoint<String, ChatMessage> kafkaListenerEndpoint = createDefaultMethodKafkaListenerEndpoint(
                chatUuid, userId, offset);
        kafkaListenerEndpoint.setBean(new KafkaEventListener(userId));


        try {
            kafkaListenerEndpoint.setMethod(KafkaEventListener.class.getMethod("listen", ConsumerRecord.class));
        } catch (NoSuchMethodException e) {
            throw new RuntimeException("Attempt to call a non-existent method " + e);
        }
        return kafkaListenerEndpoint;
    }

    private MethodKafkaListenerEndpoint<String, ChatMessage> createDefaultMethodKafkaListenerEndpoint(UUID chatUuid,
            String userId , int offset) {

        MethodKafkaListenerEndpoint<String, ChatMessage> kafkaListenerEndpoint = new MethodKafkaListenerEndpoint<>();
        String listenerId = generateListenerId(chatUuid, userId);
        kafkaListenerEndpoint.setId(listenerId);
        kafkaListenerEndpoint.setGroupId(listenerId);
        kafkaListenerEndpoint.setAutoStartup(true);
        // ONLY WORKS IF ONE PARTITION PER TOPIC, THINK CAREFULLY ABOUT THIS
        TopicPartitionOffset partionOffset = new TopicPartitionOffset(chatUuid.toString(),0);
        partionOffset.setOffset((long)offset);
        kafkaListenerEndpoint.setTopicPartitions(partionOffset);

        kafkaListenerEndpoint.setMessageHandlerMethodFactory(new DefaultMessageHandlerMethodFactory());
        return kafkaListenerEndpoint;
    }

    public String generateListenerId(UUID chaUuid, String userId) {
        return "%s-%s".formatted(chaUuid.toString(), userId);
    }

    public KafkaListenerEndpoint createAndRegisterListener(UUID chatUuid, String userId, int offset) {

        KafkaListenerEndpoint listener = createKafkaListenerEndpoint(chatUuid, userId, offset);
        kafkaListenerEndpointRegistry.registerListenerContainer(listener, kafkaListenerContainerFactory, true);
        return listener; 
    }

    public void stopListener(String litenerId){
        Optional.of(kafkaListenerEndpointRegistry.getListenerContainer(litenerId)).orElseThrow().stop();
    }
}