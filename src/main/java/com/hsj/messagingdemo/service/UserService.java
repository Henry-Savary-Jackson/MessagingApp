package com.hsj.messagingdemo.service;

import java.lang.foreign.Linker.Option;
import java.util.Base64;
import java.util.Optional;
import java.util.Base64.Decoder;

import org.springframework.beans.factory.annotation.Autowired;
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
import com.hsj.messagingdemo.model.AuthenticationRequest;
import com.hsj.messagingdemo.model.ProfileImage;
import com.hsj.messagingdemo.model.RegistrationRequest;
import com.hsj.messagingdemo.model.User;
import com.hsj.messagingdemo.repo.UserRepo;

@Service
public class UserService {

    @Autowired
    UserRepo userRepo;

    public Authentication loginUser(AuthenticationRequest request) {
        try {
            KeyFactory kf = KeyFactory.getInstance("RSA");
            Decoder decoderb64 = Base64.getDecoder();
            User user = getUserByUsername(request.getUsername()).orElseThrow();
            PublicKey pubKey = kf.generatePublic(new X509EncodedKeySpec(decoderb64.decode(user.getBase64PublicKey())));
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initVerify(pubKey);
            signature.update(decoderb64.decode(request.getChallenge()));
            boolean result = signature.verify(decoderb64.decode(request.getChallengeSignature()));
            if (!result) {
                throw new SignatureException();

            }
            return new RememberMeAuthenticationToken(user.getId(), user, user.getAuthorities());
        } catch (SignatureException e) {
            throw new AuthenticationServiceException("Signature failed.");
        } catch (NoSuchAlgorithmException nsae) {

            throw new AuthenticationServiceException("No such algo.");
        } catch (InvalidKeySpecException invse) {

            throw new AuthenticationServiceException("Invalid key spec.");
        } catch (InvalidKeyException e) {
            throw new AuthenticationServiceException("Invalid public key.");
        }
    }

    public void saveUser(RegistrationRequest request) {

        userRepo.save(
                User.builder().username(request.getUsername()).base64PublicKey(request.getBase64PubKey()).build());

    }

    public Optional<User> getUserByUsername(String username) {
        return Optional.of(userRepo.findUserByUsername(username));
    }

    public void setProfile(String id, ProfileImage image) {
        User user = userRepo.findById(id).orElseThrow();
        user.setProfilePicture(image);
        userRepo.save(user);
    }
}
