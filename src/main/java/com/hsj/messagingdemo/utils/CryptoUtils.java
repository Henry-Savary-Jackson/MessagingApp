package com.hsj.messagingdemo.utils;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.InvalidKeyException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.Signature;
import java.security.SignatureException;
import java.security.Signer;
import java.security.cert.X509Certificate;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import java.util.Base64.Decoder;

import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters;
import org.bouncycastle.x509.X509V3CertificateGenerator;
import java.security.cert.X509Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.io.FileInputStream;


public class CryptoUtils {
    private static final Decoder decoderb64 = Base64.getDecoder();


    public static boolean verifySignature(byte[] publicKeyBytes, String challenge, String challengeSignature)
            throws SignatureException, NoSuchAlgorithmException,  InvalidKeyException,
            IOException, CertificateException {
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        X509Certificate cert = (X509Certificate) cf.generateCertificate(new ByteArrayInputStream(publicKeyBytes));
        PublicKey publicKey = cert.getPublicKey(); 
        byte[] challengeBytes = decoderb64.decode(challenge);
        Signature signer = Signature.getInstance("Ed25199");
        signer.initVerify(publicKey);
        signer.update(challengeBytes);
        return signer.verify(decoderb64.decode(challengeSignature));
    }

    public static void createPubKeyFrombase64(String base64PubKey)
            throws InvalidKeySpecException, NoSuchAlgorithmException, IOException {
        new Ed25519PublicKeyParameters(decoderb64.decode(base64PubKey));
    }

}
