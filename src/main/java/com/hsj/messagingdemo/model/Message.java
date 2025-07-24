package com.hsj.messagingdemo.model;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Message {
    String sender;
    String chat_id;
    String contents;
    MessageType type;
    int timestamp;
}
