package com.hsj.messagingdemo.dto;

import java.util.UUID;

import com.hsj.messagingdemo.model.ProfileImage;
import com.hsj.messagingdemo.model.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    String userId;
    String username;
    ProfileImage profileImage;

    public static UserProfileDTO createFromUser(User user) {
        return UserProfileDTO.builder().profileImage(user.getProfilePicture()).userId(user.getId())
                .username(user.getUsername()).build();
    }

}
