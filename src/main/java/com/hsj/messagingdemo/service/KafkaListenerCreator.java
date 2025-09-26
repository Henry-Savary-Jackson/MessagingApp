package com.hsj.messagingdemo.service;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.config.KafkaListenerContainerFactory;
import org.springframework.kafka.config.KafkaListenerEndpoint;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.kafka.config.MethodKafkaListenerEndpoint;
import org.springframework.kafka.listener.MessageListenerContainer;
import org.springframework.kafka.support.TopicPartitionOffset;
import org.springframework.messaging.handler.annotation.support.DefaultMessageHandlerMethodFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.hsj.messagingdemo.dto.Messages.ChatMessage;

@Service
public class KafkaListenerCreator {

    @Autowired
    private KafkaListenerEndpointRegistry kafkaListenerEndpointRegistry;

    @Autowired
    private SimpMessagingTemplate template;

    @Autowired
    private KafkaListenerContainerFactory kafkaListenerContainerFactory;

    private KafkaListenerEndpoint createKafkaListenerEndpoint( String userId, String username, String sessionId,
            int offset) {
        MethodKafkaListenerEndpoint<String, byte[]> kafkaListenerEndpoint = createDefaultMethodKafkaListenerEndpoint(
                 userId, sessionId, offset);
        kafkaListenerEndpoint.setBean(new KafkaEventListener(username, sessionId, template));

        try {
            kafkaListenerEndpoint.setMethod(KafkaEventListener.class.getMethod("listen", ConsumerRecord.class));
        } catch (NoSuchMethodException e) {
            throw new RuntimeException("Attempt to call a non-existent method " + e);
        }
        return kafkaListenerEndpoint;
    }

    private MethodKafkaListenerEndpoint<String, byte[]> createDefaultMethodKafkaListenerEndpoint(
            String userId,String sessionId, int offset) {

        MethodKafkaListenerEndpoint<String, byte[]> kafkaListenerEndpoint = new MethodKafkaListenerEndpoint<>();
        String listenerId = generateListenerId( userId, sessionId);
        kafkaListenerEndpoint.setId(listenerId);
        kafkaListenerEndpoint.setGroupId(listenerId);
        kafkaListenerEndpoint.setAutoStartup(true);
        TopicPartitionOffset partionOffset = new TopicPartitionOffset(userId, 0, TopicPartitionOffset.SeekPosition.BEGINNING);
        kafkaListenerEndpoint.setTopicPartitions(partionOffset);

        kafkaListenerEndpoint.setMessageHandlerMethodFactory(new DefaultMessageHandlerMethodFactory());
        return kafkaListenerEndpoint;
    }

    public static String generateListenerId( String userId, String sessionId) {
        return "%s : %s".formatted(userId, sessionId);
    }

    public KafkaListenerEndpoint createAndRegisterListener( String userId, String username, String sessionId, int offset) {
        KafkaListenerEndpoint listener = createKafkaListenerEndpoint( userId, username, sessionId,offset);
        kafkaListenerEndpointRegistry.registerListenerContainer(listener, kafkaListenerContainerFactory, true);
        return listener;
    }
    

    public void stopListener(String litenerId) {
        MessageListenerContainer  container  = kafkaListenerEndpointRegistry.getListenerContainer(litenerId);
        if (container == null)
            return;
        container.stop();
        kafkaListenerEndpointRegistry.unregisterListenerContainer(litenerId);
    }
}