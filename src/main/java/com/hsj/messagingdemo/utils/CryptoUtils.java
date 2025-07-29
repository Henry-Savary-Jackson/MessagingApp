package com.hsj.messagingdemo.utils;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
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

import org.bouncycastle.asn1.x509.SubjectPublicKeyInfo;
import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;
import org.bouncycastle.crypto.util.SubjectPublicKeyInfoFactory;
import org.bouncycastle.util.io.pem.PemObject;
import org.bouncycastle.util.io.pem.PemReader;

public class CryptoUtils {
    private static final Decoder decoderb64 = Base64.getDecoder();

    public static byte[] readPublicKeybytesFromSPKI(String base64Data) throws IOException {
        PemReader reader = new PemReader(new BufferedReader(new InputStreamReader(new
        ByteArrayInputStream(decoderb64.decode(base64Data)))));
        PemObject pemObj = reader.readPemObject();

        byte[] pubKeyBytes = pemObj.getContent();
        return pubKeyBytes;
    }

    public static boolean verifySignature(String base64PubKey, String challenge, String challengeSignature)
            throws SignatureException, NoSuchAlgorithmException, InvalidKeySpecException, InvalidKeyException,
            IOException {
        Ed25519Signer signer = new Ed25519Signer();
        byte[] challengeBytes = decoderb64.decode(challenge);
        signer.init(false, new Ed25519PublicKeyParameters(decoderb64.decode(base64PubKey)));
        signer.update(challengeBytes, 0, challengeBytes.length);
        return signer.verifySignature(decoderb64.decode(challengeSignature));
    }

    public static void createPubKeyFrombase64(String base64PubKey)
            throws InvalidKeySpecException, NoSuchAlgorithmException, IOException {
        new Ed25519PublicKeyParameters(decoderb64.decode(base64PubKey));
    }

}
