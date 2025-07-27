package com.hsj.messagingdemo.utils;

import java.security.InvalidKeyException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.Signature;
import java.security.SignatureException;
import java.security.Signer;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Base64.Decoder;

import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;


public class CryptoUtils {
    private static final Decoder decoderb64 = Base64.getDecoder();

    public static boolean verifySignature(String base64PubKey, String challenge, String challengeSignature) throws SignatureException, NoSuchAlgorithmException, InvalidKeySpecException, InvalidKeyException {
        // KeyFactory rsaKeyFactory = KeyFactory.getInstance("RSA");
        Ed25519Signer signer = new Ed25519Signer();
        byte[] challengeBytes = decoderb64.decode(challenge);
        signer.init(false, new Ed25519PublicKeyParameters(decoderb64.decode(base64PubKey)) );
        signer.update(challengeBytes, 0 ,challengeBytes.length);
        return signer.verifySignature(decoderb64.decode(challengeSignature));
    }


    public static void createPubKeyFrombase64(String base64PubKey) throws InvalidKeySpecException, NoSuchAlgorithmException{

        new Ed25519PublicKeyParameters(decoderb64.decode(base64PubKey));
    }

}
