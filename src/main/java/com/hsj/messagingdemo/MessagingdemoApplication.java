package com.hsj.messagingdemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories(basePackages = "com.hsj.messagingdemo.repo")
public class MessagingdemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(MessagingdemoApplication.class, args);
	}

}
