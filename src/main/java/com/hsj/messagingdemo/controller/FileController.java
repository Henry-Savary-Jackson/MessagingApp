package com.hsj.messagingdemo.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hsj.messagingdemo.model.MessageFile;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.service.FileService;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.method.P;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/file")
public class FileController {

    @Autowired
    FileService fileService;

    @PostMapping("/upload")
    public UUID uploadFile(@RequestBody MessageFile entity) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return fileService.uploadFile(user,entity).getFileId();
    }

    @GetMapping("/{id}")
    public MessageFile getFile(@PathVariable UUID id) {
        return fileService.getFileByUUID(id);
    }

    @DeleteMapping("/{id}")
    public String deleteFile(@PathVariable UUID id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        MessageFile file = fileService.getFileByUUID(id);
        if (!user.getId().equals(file.getOwnerId())){
            throw new AuthenticationServiceException("Logged-in user is not the owner of the file.");
        }
        fileService.deleteFile(file);
        return "Success";
    }

}
