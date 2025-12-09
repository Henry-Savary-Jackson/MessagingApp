package com.hsj.messagingdemo.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.service.FileService;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public UUID uploadFile(@RequestBody byte[] entity) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return fileService.uploadFile(user,entity).getFileId();
    }

    @GetMapping("/{id}")
    public byte[] getFile(@PathVariable UUID id) {
        return fileService.getFileByUUID(id).getData();
    }


}
