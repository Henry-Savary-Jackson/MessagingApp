package com.hsj.messagingdemo.repo;

import java.util.UUID;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.hsj.messagingdemo.model.MessageFile;

public interface FileRepo extends MongoRepository<MessageFile,UUID>{

}
