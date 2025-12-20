package com.hsj.messagingdemo.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import com.hsj.messagingdemo.model.User;

public interface UserRepo  extends MongoRepository< User,String>{

    @Query("{ 'username' : ?0 }")
    Optional<User> findUserByUsername(String username);

    @Query(value="{ 'username' :  {$regex : ?0, $options: 'i'} }", fields="{ '_id': 1}")
    List<User> findByUsernameStartsWith(String username);

    @Query("{ '_id': ?0 }")
    @Update("{ '$pull': { 'prekeyBundle.oneTimePreKeys': ?1  } }")
    void removeOtp(String userId, byte[] otpString);

}