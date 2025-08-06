package com.hsj.messagingdemo.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {
    UUID messageId;
    String sender;
    String chatId;
    MessageContents contents;
    int timestamp;
}
