import cv2
import mediapipe as mp
import numpy as np
import pyttsx3
import time

# Initialize text-to-speech
engine = pyttsx3.init()
engine.setProperty('rate', 165)

def speak(text):
    engine.say(text)
    engine.runAndWait()

# Mediapipe pose setup
mp_drawing = mp.solutions.drawing_utils
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

cap = cv2.VideoCapture(0)
counter = 0
stage = None
last_feedback_time = 0
cooldown = 1.2  # seconds between voice messages

# Define non-face connections (exclude head, face, and neck)
BODY_CONNECTIONS = [
    (mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.LEFT_ELBOW),
    (mp_pose.PoseLandmark.LEFT_ELBOW, mp_pose.PoseLandmark.LEFT_WRIST),
    (mp_pose.PoseLandmark.RIGHT_SHOULDER, mp_pose.PoseLandmark.RIGHT_ELBOW),
    (mp_pose.PoseLandmark.RIGHT_ELBOW, mp_pose.PoseLandmark.RIGHT_WRIST),
    (mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.RIGHT_SHOULDER),
    (mp_pose.PoseLandmark.LEFT_HIP, mp_pose.PoseLandmark.RIGHT_HIP),
    (mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.LEFT_HIP),
    (mp_pose.PoseLandmark.RIGHT_SHOULDER, mp_pose.PoseLandmark.RIGHT_HIP),
    (mp_pose.PoseLandmark.LEFT_HIP, mp_pose.PoseLandmark.LEFT_KNEE),
    (mp_pose.PoseLandmark.LEFT_KNEE, mp_pose.PoseLandmark.LEFT_ANKLE),
    (mp_pose.PoseLandmark.RIGHT_HIP, mp_pose.PoseLandmark.RIGHT_KNEE),
    (mp_pose.PoseLandmark.RIGHT_KNEE, mp_pose.PoseLandmark.RIGHT_ANKLE)
]

with mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7) as pose:
    speak("Starting push-up tracker. Please get into position.")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Convert to RGB for Mediapipe
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = pose.process(image)

        # Convert back to BGR for OpenCV
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        try:
            landmarks = results.pose_landmarks.landmark

            # Key points (left side)
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

            # Angles
            elbow_angle = calculate_angle(shoulder, elbow, wrist)
            body_angle = calculate_angle(shoulder, hip, knee)

            # Timing for voice feedback
            current_time = time.time()

            # Check if body alignment is straight
            if body_angle < 155:
                if current_time - last_feedback_time > cooldown:
                    speak("Keep your back straight")
                    last_feedback_time = current_time

            # Push-up motion detection
            if elbow_angle > 160:
                stage = "up"
                if current_time - last_feedback_time > cooldown:
                    speak("Go down")
                    last_feedback_time = current_time

            if elbow_angle < 90 and stage == "up":
                stage = "down"
                counter += 1
                if current_time - last_feedback_time > cooldown:
                    speak(f"Good rep. Push up. Total {counter}")
                    last_feedback_time = current_time

            # Draw key body joints (no face)
            h, w, _ = image.shape
            for connection in BODY_CONNECTIONS:
                start_idx, end_idx = connection
                start = landmarks[start_idx.value]
                end = landmarks[end_idx.value]
                start_point = (int(start.x * w), int(start.y * h))
                end_point = (int(end.x * w), int(end.y * h))
                cv2.line(image, start_point, end_point, (0, 255, 0), 3)

            # Draw selected landmarks (no face)
            body_points = [
                mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.RIGHT_SHOULDER,
                mp_pose.PoseLandmark.LEFT_ELBOW, mp_pose.PoseLandmark.RIGHT_ELBOW,
                mp_pose.PoseLandmark.LEFT_WRIST, mp_pose.PoseLandmark.RIGHT_WRIST,
                mp_pose.PoseLandmark.LEFT_HIP, mp_pose.PoseLandmark.RIGHT_HIP,
                mp_pose.PoseLandmark.LEFT_KNEE, mp_pose.PoseLandmark.RIGHT_KNEE,
                mp_pose.PoseLandmark.LEFT_ANKLE, mp_pose.PoseLandmark.RIGHT_ANKLE
            ]
            for point in body_points:
                landmark = landmarks[point.value]
                cx, cy = int(landmark.x * w), int(landmark.y * h)
                cv2.circle(image, (cx, cy), 6, (255, 0, 0), -1)



            # HUD text
            cv2.putText(image, f'Reps: {counter}', (20, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 3)
            cv2.putText(image, f'Elbow Angle: {int(elbow_angle)}', (20, 120),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,255), 2)
            cv2.putText(image, f'Body Angle: {int(body_angle)}', (20, 160),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)

        except:
            pass

        cv2.imshow('Push-Up Tracker (No Face, Voice Mode)', image)

        if cv2.waitKey(10) & 0xFF == ord('q'):
            speak(f"Workout ended. You completed {counter} push-ups.")
            break

cap.release()
cv2.destroyAllWindows()



