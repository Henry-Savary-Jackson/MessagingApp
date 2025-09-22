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

import com.hsj.messagingdemo.model.Chat;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.repo.ChatRepo;

@Service
public class MessageService {


    @Autowired
    ChatRepo chatRepo;

    private static final Map<String, Set<String>> userToKafkaListener = new HashMap<>();

    public void linkUserToKafkaEventListener(String userId, String listenerId) {

        Set<String> listener = userToKafkaListener.get(userId);
        if (listener == null) {
            listener = new HashSet<>();
            userToKafkaListener.put(userId, listener);
        }
        listener.add(listenerId);
    }

    public void deleteChat(Chat chat) {
        chatRepo.delete(chat);
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

    public List<Chat> getChatByUserId(String userId) {
        return chatRepo.findByUsers(userId);
    }

    public Optional<Chat> getChatById(UUID id) {
        return chatRepo.findById(id);
    }

    public Chat createChat(User userInitial, String name) {
        Chat chat = Chat.builder().chatId(UUID.randomUUID()).name(name).ownerId(userInitial.getId())
                .users(List.of(userInitial.getId())).build();
        chatRepo.save(chat);
        return chat;
    }

    public void addUserToChat(Chat chat, User user) {
        chat.getUsers().add(user.getId());
        chatRepo.save(chat);

    }

    public void removeUserFromChat(Chat chat, User user) {
        chat.getUsers().remove(user.getId());
        if (chat.getUsers().isEmpty()) {
            deleteChat(chat);
        } else {
            chatRepo.save(chat);
        }
    }

}
