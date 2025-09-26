package com.hsj.messagingdemo.utils;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import java.util.Base64.Decoder;

import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;

import java.security.cert.CertificateException;


public class CryptoUtils {
    private static final Decoder decoderb64 = Base64.getDecoder();


    public static boolean verifySignature(byte[] publicKeyBytes, String challenge, String challengeSignature)
            throws SignatureException, NoSuchAlgorithmException,  InvalidKeyException,
            IOException, CertificateException {
        Ed25519Signer signer = new Ed25519Signer();
        byte[] challengeBytes = decoderb64.decode(challenge);
        signer.init(false, new Ed25519PublicKeyParameters(publicKeyBytes));
        signer.update(challengeBytes, 0, challengeBytes.length);
        return signer.verifySignature(decoderb64.decode(challengeSignature));
    }


}
