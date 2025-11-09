const MIN_CONFIDENCE = 0.6;

class AngleBuffer {
  constructor(size = 5) {
    this.buffer = [];
    this.size = size;
  }

  add(value) {
    this.buffer.push(value);
    if (this.buffer.length > this.size) {
      this.buffer.shift();
    }
  }

  getAverage() {
    if (this.buffer.length === 0) return 0;
    return this.buffer.reduce((a, b) => a + b, 0) / this.buffer.length;
  }

  clear() {
    this.buffer = [];
  }
}

function getKeypoint(keypoints, name) {
  const kp = keypoints.find(k => k.name === name);
  if (!kp || kp.score < MIN_CONFIDENCE) return null;
  return kp;
}

function calculateAngle(a, b, c) {
  if (!a || !b || !c) return 0;

  const ab = [a.x - b.x, a.y - b.y];
  const cb = [c.x - b.x, c.y - b.y];
  const dot = ab[0] * cb[0] + ab[1] * cb[1];
  const cross = ab[0] * cb[1] - ab[1] * cb[0];
  let radians = Math.atan2(cross, dot);
  let deg = Math.abs(radians * 180 / Math.PI);
  if (deg > 180) deg = 360 - deg;
  return deg;
}

function getBilateralAverage(keypoints, leftName, rightName, leftJoint, rightJoint, leftEnd, rightEnd) {
  const left = getKeypoint(keypoints, leftName);
  const leftJ = getKeypoint(keypoints, leftJoint);
  const leftE = getKeypoint(keypoints, leftEnd);

  const right = getKeypoint(keypoints, rightName);
  const rightJ = getKeypoint(keypoints, rightJoint);
  const rightE = getKeypoint(keypoints, rightEnd);

  const leftAngle = calculateAngle(left, leftJ, leftE);
  const rightAngle = calculateAngle(right, rightJ, rightE);

  if (leftAngle === 0 && rightAngle === 0) return { avg: 0, left: 0, right: 0, asymmetry: 0 };
  if (leftAngle === 0) return { avg: rightAngle, left: 0, right: rightAngle, asymmetry: 0 };
  if (rightAngle === 0) return { avg: leftAngle, left: leftAngle, right: 0, asymmetry: 0 };

  const avg = (leftAngle + rightAngle) / 2;
  const asymmetry = Math.abs(leftAngle - rightAngle);

  return { avg, left: leftAngle, right: rightAngle, asymmetry };
}

function checkKeypointsVisibility(keypoints, requiredKeypoints) {
  const missing = [];
  for (const name of requiredKeypoints) {
    const kp = getKeypoint(keypoints, name);
    if (!kp) missing.push(name);
  }
  return missing;
}

function calculateDistance(a, b) {
  if (!a || !b) return 0;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
