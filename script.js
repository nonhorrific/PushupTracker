
let detector, video, canvas, ctx;
let counter = 0, stage = null, lastSpeak = 0;
const cooldown = 1500; // ms between voice prompts

function speak(text) {
  const now = Date.now();
  if (now - lastSpeak > cooldown) {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.1;
    speechSynthesis.speak(utter);
    lastSpeak = now;
  }
}

function angle(a, b, c) {
  const ab = [a.x - b.x, a.y - b.y];
  const cb = [c.x - b.x, c.y - b.y];
  const dot = ab[0]*cb[0] + ab[1]*cb[1];
  const cross = ab[0]*cb[1] - ab[1]*cb[0];
  let radians = Math.atan2(cross, dot);
  let deg = Math.abs(radians * 180 / Math.PI);
  if (deg > 180) deg = 360 - deg;
  return deg;
}

async function setupCamera() {
  video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  await new Promise(r => video.onloadedmetadata = r);
  return video;
}

async function run() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  video = await setupCamera();
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
  );

  speak("Starting push-up tracker. Please get into position.");

  async function detect() {
    const poses = await detector.estimatePoses(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (poses.length > 0) {
      const kp = poses[0].keypoints;
      const leftShoulder = kp.find(k => k.name === "left_shoulder");
      const leftElbow = kp.find(k => k.name === "left_elbow");
      const leftWrist = kp.find(k => k.name === "left_wrist");
      const leftHip = kp.find(k => k.name === "left_hip");
      const leftKnee = kp.find(k => k.name === "left_knee");

      const elbowAngle = angle(leftShoulder, leftElbow, leftWrist);
      const bodyAngle = angle(leftShoulder, leftHip, leftKnee);

      // Rep logic
      if (bodyAngle < 155) speak("Keep your back straight");
      if (elbowAngle > 160) {
        stage = "up";
        speak("Go down");
      }
      if (elbowAngle < 90 && stage === "up") {
        stage = "down";
        counter++;
        speak(`Good rep. Push up. Total ${counter}`);
      }

      document.getElementById('feedback').textContent =
        `Reps: ${counter} | Elbow: ${elbowAngle.toFixed(0)} | Body: ${bodyAngle.toFixed(0)}`;

      kp.forEach(k => {
        if (k.score > 0.4) {
          ctx.beginPath();
          ctx.arc(k.x, k.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "cyan";
          ctx.fill();
        }
      });
    }

    requestAnimationFrame(detect);
  }

  detect();
}

run();
