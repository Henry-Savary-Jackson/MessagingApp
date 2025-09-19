package com.hsj.messagingdemo.service;

import java.io.IOException;
import java.lang.foreign.Linker.Option;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import java.util.Base64.Decoder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jms.JmsProperties.Listener.Session;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Example;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.stereotype.Service;

import java.security.InvalidKeyException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.Signature;
import java.security.SignatureException;
import java.security.cert.CertificateException;
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
import com.hsj.messagingdemo.controller.UserController;
import com.hsj.messagingdemo.dto.AuthenticationRequest;
import com.hsj.messagingdemo.dto.DigitalSignatureAuthenticationToken;
import com.hsj.messagingdemo.dto.RegistrationRequest;
import com.hsj.messagingdemo.dto.UserChangeDTO;
import com.hsj.messagingdemo.dto.Messages.PreKeyBundle;
import com.hsj.messagingdemo.model.ProfileImage;
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


    public void modifyUser(User user, UserChangeDTO userChangeDTO){
        if (userChangeDTO.getProfile() != null)
            user.setProfilePicture(userChangeDTO.getProfile());
        if (userChangeDTO.getUsername()!= null)
            user.setUsername(userChangeDTO.getUsername());

        userRepo.save(user);
    }

    public Authentication loginUser(AuthenticationRequest request) {
        try {
            User user = getUserByUsername(request.getUsername()).orElseThrow();
            if (!CryptoUtils.verifySignature(user.getPreKeyBundle().getIdentityKey().toByteArray(), request.getChallenge(),
                    request.getChallengeSignature())) {
                throw new SignatureException("");
            }
            return getSpingSecurityAuthentication(user);
        } catch (SignatureException e) {
            throw new AuthenticationServiceException("Signature failed.");
        } catch (NoSuchAlgorithmException nsae) {

            throw new AuthenticationServiceException("No such algo.");
        } catch (InvalidKeyException e) {
            throw new AuthenticationServiceException("Invalid public key.");
        } catch (IOException e) {
            throw new AuthenticationServiceException("IOException.");
        } catch (CertificateException e) {
            throw new AuthenticationServiceException("Certificate Exception.");
        }
    }

    public User getUserById(String userId){
        return userRepo.findById(userId).orElseThrow();
    }

    public User saveUser(RegistrationRequest request)
            throws AuthenticationException, InvalidKeySpecException, NoSuchAlgorithmException, IOException {
        // verify inegrity of pubkey
        try {
            byte[] preKeyBundleBytes = Base64.getDecoder().decode(request.getBase64PrekeyBundle());
            PreKeyBundle preKeyBundle = PreKeyBundle.parseFrom(preKeyBundleBytes);

            User user = User.builder().id(UUID.randomUUID().toString()).username(request.getUsername())
                    .preKeyBundle(preKeyBundle).profilePicture(request.getProfileImage()).build();
            userRepo.save(user);
            return user;
        } catch (DuplicateKeyException mwe) {
            throw new AuthenticationServiceException("User %s already exist".formatted(request.getUsername()));
        }

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
