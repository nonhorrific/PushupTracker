
import streamlit as st
import av
import cv2
import mediapipe as mp
import numpy as np
import pyttsx3
from streamlit_webrtc import webrtc_streamer, VideoProcessorBase

st.set_page_config(page_title="Push-Up Tracker", layout="centered")
st.title("💪 Push-Up Tracker with Voice Guidance")

# Voice feedback setup
engine = pyttsx3.init()
engine.setProperty('rate', 160)

def speak(text):
    engine.say(text)
    engine.runAndWait()

# Pose setup
mp_pose = mp.solutions.pose

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle


class PushupProcessor(VideoProcessorBase):
    def __init__(self):
        self.counter = 0
        self.stage = None
        self.last_feedback_time = 0
        self.cooldown = 1.2
        self.pose = mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7)

    def recv(self, frame):
        image = frame.to_ndarray(format="bgr24")
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.pose.process(image_rgb)
        h, w, _ = image.shape

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                        landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
            wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
            hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                   landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
            knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]

            elbow_angle = calculate_angle(shoulder, elbow, wrist)
            body_angle = calculate_angle(shoulder, hip, knee)

            # Feedback & rep logic
            import time
            current_time = time.time()

            if body_angle < 155 and current_time - self.last_feedback_time > self.cooldown:
                speak("Keep your back straight")
                self.last_feedback_time = current_time

            if elbow_angle > 160:
                self.stage = "up"
                if current_time - self.last_feedback_time > self.cooldown:
                    speak("Go down")
                    self.last_feedback_time = current_time

            if elbow_angle < 90 and self.stage == "up":
                self.stage = "down"
                self.counter += 1
                if current_time - self.last_feedback_time > self.cooldown:
                    speak(f"Good rep. Push up. Total {self.counter}")
                    self.last_feedback_time = current_time

            # Draw body
            mp.solutions.drawing_utils.draw_landmarks(
                image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp.solutions.drawing_styles.get_default_pose_landmarks_style()
            )

            cv2.putText(image, f"Reps: {self.counter}", (20, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)

        return av.VideoFrame.from_ndarray(image, format="bgr24")


webrtc_streamer(
    key="pushup-tracker",
    video_processor_factory=PushupProcessor,
    media_stream_constraints={"video": True, "audio": False},
    async_processing=True,
)

st.markdown("Press **Start** and begin your push-ups! 💪")
