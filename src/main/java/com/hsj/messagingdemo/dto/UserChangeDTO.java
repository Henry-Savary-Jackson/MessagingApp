package com.hsj.messagingdemo.dto;

import com.hsj.messagingdemo.model.ProfileImage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
@Getter
public class UserChangeDTO {
    String username;
    ProfileImage profile;
}
