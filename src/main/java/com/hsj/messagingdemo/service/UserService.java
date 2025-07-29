package com.hsj.messagingdemo.service;

import java.io.IOException;
import java.lang.foreign.Linker.Option;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import java.util.Base64.Decoder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jms.JmsProperties.Listener.Session;
import org.springframework.data.domain.Example;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.stereotype.Service;

import java.security.InvalidKeyException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.Signature;
import java.security.SignatureException;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.RememberMeAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.RememberMeServices;

import com.hsj.messagingdemo.model.AuthenticationRequest;
import com.hsj.messagingdemo.model.DigitalSignatureAuthenticationToken;
import com.hsj.messagingdemo.model.ProfileImage;
import com.hsj.messagingdemo.model.RegistrationRequest;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.repo.UserRepo;
import com.hsj.messagingdemo.utils.CryptoUtils;

@Service
public class UserService {

    @Autowired
    UserRepo userRepo;


    public Authentication getSpingSecurityAuthentication(User user) {
        return new DigitalSignatureAuthenticationToken(user, null);
    }

    public Authentication loginUser(AuthenticationRequest request) {
        try {
            User user = getUserByUsername(request.getUsername()).orElseThrow();
            if (!CryptoUtils.verifySignature(user.getBase64PublicKey(), request.getChallenge(), request.getChallengeSignature())) {
                throw new SignatureException("");
            }
            return getSpingSecurityAuthentication(user);
        } catch (SignatureException e) {
            throw new AuthenticationServiceException("Signature failed.");
        } catch (NoSuchAlgorithmException nsae) {

            throw new AuthenticationServiceException("No such algo.");
        } catch (InvalidKeySpecException invse) {

            throw new AuthenticationServiceException("Invalid key spec.");
        } catch (InvalidKeyException e) {
            throw new AuthenticationServiceException("Invalid public key.");
        } catch (IOException e) {
            throw new AuthenticationServiceException("IOException.");
        }
    }

    public User saveUser(RegistrationRequest request) throws InvalidKeySpecException, NoSuchAlgorithmException, IOException {
        // verify inegrity of pubkey
        CryptoUtils.createPubKeyFrombase64(request.getBase64PubKey());

        User user = User.builder().id(UUID.randomUUID().toString()).username(request.getUsername())
                .base64PublicKey(request.getBase64PubKey()).build();
        userRepo.save(user);
        return user;

    }

    public Optional<User> getUserByUsername(String username) {
        return userRepo.findUserByUsername(username);
    }

    public void setProfile(String id, ProfileImage image) {
        User user = userRepo.findById(id).orElseThrow();
        user.setProfilePicture(image);
        userRepo.save(user);
    }
}
