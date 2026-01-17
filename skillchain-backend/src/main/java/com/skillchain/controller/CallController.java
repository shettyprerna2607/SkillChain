package com.skillchain.controller;

import com.skillchain.entity.CallSignaling;
import com.skillchain.repository.SignalingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calls")
public class CallController {

    @Autowired
    private SignalingRepository signalingRepository;

    @PostMapping("/{sessionId}/signal")
    public void sendSignal(@PathVariable Long sessionId, @RequestBody CallSignaling signal,
            Authentication authentication) {
        signal.setSessionId(sessionId);
        signal.setSenderUsername(authentication.getName());
        signalingRepository.save(signal);
    }

    @GetMapping("/{sessionId}/signals")
    public List<CallSignaling> getSignals(@PathVariable Long sessionId, Authentication authentication) {
        return signalingRepository.findBySessionIdAndSenderUsernameNotOrderByCreatedAtAsc(sessionId,
                authentication.getName());
    }

    @DeleteMapping("/{sessionId}")
    public void endCall(@PathVariable Long sessionId) {
        signalingRepository.deleteBySessionId(sessionId);
    }
}
