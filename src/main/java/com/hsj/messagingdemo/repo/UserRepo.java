package com.hsj.messagingdemo.repo;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.hsj.messagingdemo.model.User;

public interface UserRepo  extends MongoRepository< User,String>{

    @Query("{ 'username' : ?0 }")
    User findUserByUsername(String username);
}