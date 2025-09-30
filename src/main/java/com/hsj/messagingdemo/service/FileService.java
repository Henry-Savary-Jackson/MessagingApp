package com.hsj.messagingdemo.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hsj.messagingdemo.model.DBFile;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.repo.FileRepo;

@Service
public class FileService {

    @Autowired
    FileRepo fileRepo;

    public DBFile uploadFile(User user,byte[] data){
        DBFile file = DBFile.builder().fileId(UUID.randomUUID()).data(data).build();
        fileRepo.save(file);
        return file;
    }

    public void deleteFile(DBFile file){
        fileRepo.delete(file);
    }


    public DBFile getFileByUUID(UUID uuid){
        return fileRepo.findById(uuid).orElseThrow();
    }

}
