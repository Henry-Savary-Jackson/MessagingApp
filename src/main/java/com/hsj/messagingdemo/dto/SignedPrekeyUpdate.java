package com.hsj.messagingdemo.dto;

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
public class SignedPrekeyUpdate {
    String b64NewSignedPrekey;
    String b64NewPrekeySignature;
}
