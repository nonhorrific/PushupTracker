
# 💪 Push-Up Tracker (Web Voice Edition)

AI-powered push-up tracker that runs **entirely in your browser** — no installs, no servers.  
Uses **TensorFlow.js** and **Web Speech API** to track your form, count reps, and give **real-time voice feedback**.

👉 **[Live Demo](https://nonhorrific.github.io/PushupTracker/)**  

---

### 🚀 Features
- 🧠 Real-time pose detection with **MoveNet (TensorFlow.js)**
- 🗣️ Voice feedback: “Go down”, “Push up”, “Keep your back straight”
- 🔢 Automatic rep counter
- 🔒 100% client-side — camera data stays on your device

---

### ⚙️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript  
- **AI Model:** TensorFlow.js MoveNet  
- **Speech:** Web Speech API  
- **Hosting:** GitHub Pages

---

### 🏃‍♂️ How to Use
1. Open the live demo link  
2. Allow camera access  
3. Get into push-up position  
4. Hear real-time guidance and see rep counts on screen  

---

### 💻 Local Run (Optional)
```bash
git clone https://github.com/<your-username>/pushup-tracker.git
cd pushup-tracker
python -m http.server 8000
```
Visit: `http://localhost:8000`

---

### 🧩 Files
- `index.html` → app layout  
- `script.js` → pose logic + voice feedback  
- `style.css` → styling  

---

### 🌟 Future Ideas
- Add squat/plank tracking  
- Integrate voice personality via ElevenLabs  
- Add workout history tracking  

---

**Made for Hackathons 🏆** — AI fitness demo powered by browser tech, no backend required.
