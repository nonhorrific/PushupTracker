let detector, video, canvas, ctx;
let selectedExercise = null;
let exerciseDetector = null;

function switchScreen(from, to) {
  document.getElementById(from).classList.remove('active');
  setTimeout(() => {
    document.getElementById(to).classList.add('active');
  }, 300);
}

async function setupCamera() {
  video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  });
  video.srcObject = stream;
  await new Promise(r => video.onloadedmetadata = r);
  return video;
}

async function initializeTracker() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  document.getElementById('status-text').textContent = 'Setting up camera...';
  document.getElementById('feedback').textContent = 'Please allow camera access';

  try {
    video = await setupCamera();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    document.getElementById('status-text').textContent = 'Loading AI model...';
    document.getElementById('feedback').textContent = 'Please wait while we load the pose detection model';

    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER }
    );

    if (selectedExercise === 'pushup') {
      exerciseDetector = new PushupDetector();
    } else if (selectedExercise === 'squat') {
      exerciseDetector = new SquatDetector();
    }

    document.getElementById('status-text').textContent = 'Ready';
    document.getElementById('feedback').textContent = 'Get into position and start your exercise';

    const exerciseName = selectedExercise === 'pushup' ? 'push-ups' : 'squats';
    const utterance = new SpeechSynthesisUtterance(`Starting ${exerciseName} tracker. Get into position.`);
    utterance.rate = 1.1;
    speechSynthesis.speak(utterance);

    detect();
  } catch (error) {
    console.error('Error initializing tracker:', error);
    document.getElementById('status-text').textContent = 'Error';
    document.getElementById('feedback').textContent = 'Failed to initialize camera or model';
  }
}

async function detect() {
  const poses = await detector.estimatePoses(video);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (poses.length > 0) {
    const kp = poses[0].keypoints;
    const result = exerciseDetector.detect(kp);

    updateUI(result);
    drawKeypoints(kp);
    drawSkeleton(kp);
  }

  requestAnimationFrame(detect);
}

function updateUI(result) {
  document.querySelector('.rep-number').textContent = result.repCount;
  document.getElementById('feedback').textContent = result.feedback;

  if (selectedExercise === 'pushup') {
    document.getElementById('elbow-angle').textContent = `${result.angles.elbow}°`;
    document.getElementById('body-angle').textContent = `${result.angles.body}°`;
  } else if (selectedExercise === 'squat') {
    document.getElementById('elbow-angle').textContent = `${result.angles.knee}°`;
    document.getElementById('body-angle').textContent = `${result.angles.back}°`;
  }

  document.getElementById('confidence-value').textContent = `${result.confidence}%`;

  const statusDot = document.querySelector('.status-dot');
  const statusText = document.getElementById('status-text');

  switch (result.state) {
    case 'READY':
      statusDot.style.background = '#4ade80';
      statusText.textContent = 'Ready';
      break;
    case 'DESCENDING':
      statusDot.style.background = '#fbbf24';
      statusText.textContent = 'Going Down';
      break;
    case 'BOTTOM':
      statusDot.style.background = '#f87171';
      statusText.textContent = 'At Bottom';
      break;
    case 'ASCENDING':
      statusDot.style.background = '#60a5fa';
      statusText.textContent = 'Going Up';
      break;
    case 'TOP':
      statusDot.style.background = '#4ade80';
      statusText.textContent = 'At Top';
      break;
    case 'COMPLETED':
      statusDot.style.background = '#a78bfa';
      statusText.textContent = 'Rep Complete';
      break;
  }
}

function drawKeypoints(keypoints) {
  keypoints.forEach(kp => {
    if (kp.score > 0.6) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "#00d4ff";
      ctx.fill();
      ctx.strokeStyle = "#0066ff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

function drawSkeleton(keypoints) {
  const connections = [
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle']
  ];

  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 3;

  connections.forEach(([start, end]) => {
    const kpStart = keypoints.find(kp => kp.name === start);
    const kpEnd = keypoints.find(kp => kp.name === end);

    if (kpStart && kpEnd && kpStart.score > 0.6 && kpEnd.score > 0.6) {
      ctx.beginPath();
      ctx.moveTo(kpStart.x, kpStart.y);
      ctx.lineTo(kpEnd.x, kpEnd.y);
      ctx.stroke();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const exerciseCards = document.querySelectorAll('.exercise-card');
  const backBtn = document.getElementById('back-btn');

  exerciseCards.forEach(card => {
    card.addEventListener('click', () => {
      selectedExercise = card.dataset.exercise;
      const exerciseTitle = selectedExercise === 'pushup' ? 'Push-Up Tracker' : 'Squat Tracker';
      document.getElementById('exercise-title').textContent = exerciseTitle;

      const metricLabels = document.querySelectorAll('.metric-label');
      if (selectedExercise === 'pushup') {
        metricLabels[0].textContent = 'Elbow';
        metricLabels[1].textContent = 'Body';
      } else {
        metricLabels[0].textContent = 'Knee';
        metricLabels[1].textContent = 'Back';
      }

      switchScreen('selection-screen', 'tracker-screen');

      setTimeout(() => {
        initializeTracker();
      }, 400);
    });
  });

  backBtn.addEventListener('click', () => {
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }

    speechSynthesis.cancel();

    if (exerciseDetector) {
      exerciseDetector.reset();
      exerciseDetector = null;
    }

    switchScreen('tracker-screen', 'selection-screen');
    selectedExercise = null;
  });
});
