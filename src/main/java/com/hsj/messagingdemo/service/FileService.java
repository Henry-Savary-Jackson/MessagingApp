package com.hsj.messagingdemo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hsj.messagingdemo.repo.FileRepo;

@Service
public class FileService {

    @Autowired
    FileRepo fileRepo;

}
