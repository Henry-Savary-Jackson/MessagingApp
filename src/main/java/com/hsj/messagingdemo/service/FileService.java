package com.hsj.messagingdemo.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hsj.messagingdemo.model.MessageFile;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.repo.FileRepo;

@Service
public class FileService {

    @Autowired
    FileRepo fileRepo;

    public MessageFile uploadFile(User user,MessageFile file){
        file.setFileId(UUID.randomUUID());
        file.setOwnerId(user.getId());
        fileRepo.save(file);
        return file;
    }

    public void deleteFile(MessageFile file){
        fileRepo.delete(file);
    }


    public MessageFile getFileByUUID(UUID uuid){
        return fileRepo.findById(uuid).orElseThrow();
    }

}
