package com.hsj.messagingdemo.model;

import java.util.List;

import com.google.protobuf.ByteString;
import com.hsj.messagingdemo.dto.Messages.PreKeyBundle;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder(toBuilder = true)
@Data
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Setter
public class PrekeyBundleDB {
    byte[] identityKey;
    List<byte[]> oneTimePreKeys;
    byte[] verifierKey ;
    byte[] signedPrekey ;
    byte[] prekeySignature ; 

    public PreKeyBundle convertToProtobufPrekeyBundle(){
        return PreKeyBundle.newBuilder()
        .addAllOneTimePrekey(oneTimePreKeys.stream().map((otp)->ByteString.copyFrom(otp)).toList())
        .setIdentityKey(ByteString.copyFrom(identityKey))
        .setVerifierKey(ByteString.copyFrom(verifierKey))
        .setSignedPrekey(ByteString.copyFrom(signedPrekey))
        .setPrekeySignature(ByteString.copyFrom(prekeySignature))
        .build();
    }
    public PrekeyBundleDB(PreKeyBundle preKeyBundle){
        identityKey=preKeyBundle.getIdentityKey().toByteArray(); 
        verifierKey=preKeyBundle.getVerifierKey().toByteArray(); 
        signedPrekey=preKeyBundle.getSignedPrekey().toByteArray(); 
        prekeySignature=preKeyBundle.getPrekeySignature().toByteArray(); 
        oneTimePreKeys=preKeyBundle.getOneTimePrekeyList().stream().map((otp)->otp.toByteArray()).toList();
    }

}
