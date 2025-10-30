# AI Interview Avatar Feature

## Overview
The AI Mock Interview now features a 3D animated AI interviewer avatar (girl) that reads questions aloud using text-to-speech technology.

## Features

### 3D Animated Avatar
- **Idle State**: Subtle breathing animation, random eye blinks
- **Speaking State**: Animated mouth movements, glowing aura, floating particles
- **Listening State**: Tilted head pose, attentive expression
- **Design**: Purple/pink gradient theme with professional feminine appearance
  - Styled hair (purple gradient)
  - Expressive eyes with eyelashes and natural blink animation
  - Animated blush on cheeks
  - Mouth animation synced to speaking state

### Text-to-Speech (TTS)
- **Auto-Read Questions**: Questions are automatically read aloud when they appear
- **Female Voice**: Prioritizes natural-sounding female voices from available system voices
- **Voice Settings**: 
  - Rate: 0.9 (slightly slower for clarity)
  - Pitch: 1.1 (slightly higher/feminine)
  - Volume: 1.0 (full volume)
- **Voice Toggle**: Mute/unmute button in the header to disable TTS

### Animation States
The avatar automatically transitions between states:
1. **Idle**: When waiting for user input
2. **Speaking**: When TTS is reading the question (mouth moves, particles float, glow effect)
3. **Listening**: When user activates voice input (head tilt, attentive)

### Visual Effects
- Subtle pulse animation on avatar when speaking
- Rotating glow ring around avatar during speech
- Floating colored particles (purple, pink, blue)
- Eye darting movement when speaking
- Smooth state transitions with CSS animations
- Gradient backgrounds for immersive experience

## Technical Implementation

### Components
- **AIInterviewerAvatar.tsx**: Reusable avatar component with state props
- **MockInterviewPage.tsx**: Enhanced with TTS integration and avatar display

### APIs Used
- **Web Speech Synthesis API**: For text-to-speech voice output
- **Web Speech Recognition API**: For voice input (existing feature)

### CSS Animations
Custom keyframe animations defined in `index.css`:
- `pulse-subtle`: Gentle scaling for speaking state
- `eye-dart`: Natural eye movement
- `mouth-open`: Mouth opening/closing animation
- `float-1/2/3`: Floating particle effects
- `spin-slow`: Rotating glow effect

## User Experience Flow
1. User clicks "Start Interview"
2. Avatar appears with first question displayed
3. TTS automatically reads the question (avatar mouth animates)
4. Visual indicator shows speaking state with sound icon
5. User can answer via text or voice
6. When user clicks mic, avatar enters listening state
7. Process repeats for each question

## Browser Compatibility
- **TTS**: Supported in Chrome, Edge, Safari, Firefox
- **Voice Selection**: Varies by OS and browser
  - Windows: Microsoft voices (Zira, etc.)
  - macOS: Apple voices (Samantha, Victoria, etc.)
  - Chrome: Google voices
- **Fallback**: If no female voice found, uses default system voice

## Controls
- **Voice Toggle**: Click speaker icon to mute/unmute TTS
- **Voice Input**: Click microphone to speak your answer
- **Visual Feedback**: Status indicator shows current avatar state

## Future Enhancements
- Voice speed/pitch controls
- Multiple avatar styles to choose from
- Facial expressions matching question sentiment
- Lip-sync precision improvements
- Voice language selection
- Custom voice recording for questions
