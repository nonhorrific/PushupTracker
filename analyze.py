from fastapi import FastAPI, File, UploadFile
import cv2
import numpy as np
import mediapipe as mp

app = FastAPI()

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7)

@app.post("/analyze")
async def analyze_frame(file: UploadFile = File(...)):
    contents = await file.read()
    np_img = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    
    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(image_rgb)

    if not results.pose_landmarks:
        return {"message": "No person detected"}

    # Example: calculate one simple angle
    landmarks = results.pose_landmarks.landmark
    left_elbow = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value]
    left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
    left_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]
    angle = int(np.degrees(np.arctan2(left_wrist.y-left_elbow.y, left_wrist.x-left_elbow.x)
                           - np.arctan2(left_shoulder.y-left_elbow.y, left_shoulder.x-left_elbow.x)))

    return {"elbow_angle": abs(angle), "message": "Pose detected"}
