
# 💪 FormAI

AI-powered fitness tracker that runs **entirely in your browser** — no installs, no servers.
Uses **TensorFlow.js** and **ElevenLabs AI Voice** to track your form, count reps, and give **real-time personalized voice feedback** with different coach personalities.

👉 **[Live Demo](https://nonhorrific.github.io/PushupTracker/)**

---

## 🚀 Features

### Core Functionality
- 🧠 **Real-time pose detection** with MoveNet (TensorFlow.js)
- 🗣️ **AI Voice Feedback** powered by ElevenLabs
- 🔢 **Automatic rep counter** with form quality tracking
- 📊 **Personal Best Tracking** with Supabase database
- 🏆 **New Record Celebrations** with visual and audio effects

### Exercise Support
- 🤸 **Jumping Jacks Tracker** - Tracks arm elevation and leg spread
- 🦵 **Squat Tracker** - Monitors knee angle and back posture

### Coach Personalities
Choose your AI coach style:
- 🎖️ **Military Sergeant** - Strict & commanding
- ✨ **Pop-up Girl** - Energetic & bubbly
- 💪 **Gym Bro** - Casual & supportive

### Advanced Features
- 📐 **Real-time angle measurements** (arms, legs, body alignment)
- ⚠️ **Form validation** with instant corrective feedback
- 🎯 **Confidence tracking** for pose detection accuracy
- 🔒 **100% client-side processing** — camera data never leaves your device
- 📱 **Responsive design** for desktop and mobile
- 🎵 **Special audio effects** at milestone reps

---

## ⚙️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- TensorFlow.js with MoveNet (Pose Detection)
- Web Speech API (fallback voice)

**AI & Services:**
- ElevenLabs API (Premium AI voice synthesis)
- Supabase (Database for personal bests)

**Hosting:**
- GitHub Pages / Vite

---

## 🏃‍♂️ How to Use

1. Open the live demo link
2. **Choose your coach personality** (Military, Pop-up Girl, or Gym Bro)
3. **Select an exercise** (Jumping Jacks or Squats)
4. Allow camera access when prompted
5. Get into position and start exercising
6. Hear real-time AI voice guidance and see:
   - Rep count
   - Form metrics (angles)
   - Personal best comparison
   - Instant feedback on your form

---

## 💻 Local Development

### Prerequisites
- Node.js (optional, for local server)
- Modern browser with webcam support

### Setup
```bash
git clone https://github.com/<your-username>/FormAI.git
cd FormAI
python -m http.server 8000
# or use any local web server
```

Visit: `http://localhost:8000`

### Environment Variables
Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

---

## 🧩 Project Structure

```
FormAI/
├── index.html              # Main app layout
├── style.css               # Styling and animations
├── script.js               # Main app logic
├── audioManager.js         # ElevenLabs integration & audio handling
├── exerciseDetectors.js    # Jumping Jacks & Squat detection algorithms
├── formValidators.js       # Real-time form validation
├── stateMachine.js         # Exercise state management
├── poseUtils.js            # Pose detection utilities
├── feedbackManager.js      # Voice feedback coordination
├── personalityMessages.js  # Coach personality dialogue
├── personalBestManager.js  # Personal records tracking
├── supabaseClient.js       # Database connection
└── supabase/
    └── migrations/         # Database schema
```

---

## 🎯 How It Works

### Pose Detection
1. **Camera Feed** → TensorFlow.js captures video frames
2. **MoveNet Model** → Extracts 17 body keypoints
3. **Angle Calculation** → Computes joint angles in real-time
4. **State Machine** → Tracks exercise phases (ready → descending → bottom → ascending → complete)

### Jumping Jacks Detection
- Tracks arm elevation angle (shoulder-to-wrist)
- Measures leg spread distance (ankle separation)
- Rep counted when: arms up + legs spread → arms down + legs together

### Form Validation
- **Real-time checks** for proper form
- **Persistence tracking** prevents false warnings
- **Priority system** for critical vs warning-level feedback

### Voice Feedback
- ElevenLabs generates natural AI voice
- Fallback to Web Speech API if needed
- Context-aware messages based on exercise state
- Debounced playback prevents audio conflicts

---

## 🌟 Key Improvements

### Recent Updates
✅ **Enhanced side profile detection** - Lower confidence thresholds allow tracking when turning sideways
✅ **Audio error handling** - Fixed play/pause conflicts and TensorFlow texture errors
✅ **Jumping Jacks support** - Replaced push-ups with full jumping jacks tracking
✅ **Robust error handling** - Graceful degradation for audio and video issues

### Performance Optimizations
- Angle smoothing with rolling buffers
- Debounced audio playback
- Video dimension validation
- Cached TTS audio responses

---

## 🔐 Privacy & Security

- **No data collection** - All processing happens locally in your browser
- **No video upload** - Camera feed is processed client-side only
- **Optional cloud features** - Personal bests stored in Supabase (can be disabled)
- **Secure API keys** - Environment variables for sensitive credentials

---

## 🎨 UI/UX Features

- **Clean, modern design** with glassmorphism effects
- **Real-time visual feedback** with skeleton overlay
- **Dynamic status indicators** with color-coded states
- **Animated transitions** between screens
- **New record celebrations** with overlay animations
- **Metric displays** showing angles and confidence scores

---

## 🐛 Troubleshooting

**Camera not working?**
- Ensure you've granted camera permissions
- Check if another app is using the camera
- Try refreshing the page

**No voice feedback?**
- Check browser audio permissions
- Verify ElevenLabs API key is configured
- Falls back to Web Speech API automatically

**Pose not detected?**
- Ensure good lighting
- Position yourself fully in frame
- Move away from the camera for full body visibility

---

## 📈 Future Roadmap

- [ ] Add more exercises (planks, burpees, lunges)
- [ ] Workout session tracking & analytics
- [ ] Multi-user support with profiles
- [ ] Mobile app version
- [ ] Social sharing & challenges
- [ ] Custom coaching plans
- [ ] Integration with fitness wearables

---

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - Feel free to use this for your own projects!

---

**Built with ❤️ for fitness enthusiasts** — AI-powered form tracking with no backend required.
