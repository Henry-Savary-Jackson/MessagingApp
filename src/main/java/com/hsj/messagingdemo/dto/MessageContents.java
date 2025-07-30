package com.hsj.messagingdemo.dto;

import java.util.UUID;

import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageContents {

    String text;

    UUID file_id;

    MessageType type;
    
}
