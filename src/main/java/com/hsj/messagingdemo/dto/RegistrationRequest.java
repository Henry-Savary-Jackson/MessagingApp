package com.hsj.messagingdemo.dto;

import com.hsj.messagingdemo.dto.Messages.PreKeyBundle;
import com.hsj.messagingdemo.model.ProfileImage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegistrationRequest {
    String username;
    String base64PrekeyBundle;
    ProfileImage profileImage;
}
