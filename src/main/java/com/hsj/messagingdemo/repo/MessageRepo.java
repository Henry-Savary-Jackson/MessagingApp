package com.hsj.messagingdemo.repo;

import java.util.UUID;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.hsj.messagingdemo.dto.ChatMessage;

public interface MessageRepo extends MongoRepository<ChatMessage,UUID>{

}
