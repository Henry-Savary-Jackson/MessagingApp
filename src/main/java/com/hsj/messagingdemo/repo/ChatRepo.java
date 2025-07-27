package com.hsj.messagingdemo.repo;

import java.util.List;
import java.util.UUID;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.hsj.messagingdemo.model.Chat;

public interface ChatRepo extends MongoRepository< Chat,UUID>{

    public List<Chat> findByUsers(String userId);
}
