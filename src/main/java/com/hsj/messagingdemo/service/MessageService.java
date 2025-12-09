package com.hsj.messagingdemo.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hsj.messagingdemo.model.User;

@Service
public class MessageService {



    private static final Map<String, Set<String>> userToKafkaListener = new HashMap<>();

    public void linkUserToKafkaEventListener(String userId, String listenerId) {

        Set<String> listener = userToKafkaListener.get(userId);
        if (listener == null) {
            listener = new HashSet<>();
            userToKafkaListener.put(userId, listener);
        }
        listener.add(listenerId);
    }

    public void unLinkUserToKafkaEventListener(String userId, String listenerId) {

        Set<String> listener = userToKafkaListener.get(userId);
        if (listener == null) {
            return;
        }
        listener.remove(listenerId);
    }

    public void removeUsersKafkaEventListeners(String userId){
        userToKafkaListener.remove(userId);
    }

    public Set<String> getKafkaListenersForUser(String userId) {
        return userToKafkaListener.getOrDefault(userId, new HashSet<>());
    }

    public boolean isUserListeningToChat(String userId, String sessionId) {
        return getKafkaListenersForUser(userId).stream()
                .anyMatch((listenerId) -> listenerId.equals(KafkaListenerCreator.generateListenerId( userId, sessionId)));
    }


    

}
