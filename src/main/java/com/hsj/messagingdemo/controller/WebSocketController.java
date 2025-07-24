package com.hsj.messagingdemo.controller;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.hsj.messagingdemo.model.Message;

@Controller
public class WebSocketController {

    @Autowired
    private KafkaTemplate<String, Message> kafkaTemplate;

    @MessageMapping("/chat")
    public void sendMessageMap(@Payload Message message) {
        message.setTimestamp((int)LocalDateTime.now().toEpochSecond(ZoneOffset.UTC));
        kafkaTemplate.send(new ProducerRecord<String,Message>("chat", message));
    }

    

}
