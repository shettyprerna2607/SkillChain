package com.skillchain.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class VideoWSController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/video/{sessionId}/signal")
    public void handleSignal(@DestinationVariable Long sessionId, @Payload Map<String, Object> signal) {
        // Broadcast the signal to the other participant in the session
        // In a real app, you'd target the specific user, but for simplicity we
        // broadcast to the session topic
        messagingTemplate.convertAndSend("/topic/video/" + sessionId, signal);
    }
}
