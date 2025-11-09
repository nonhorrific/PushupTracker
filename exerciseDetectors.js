class JumpingJacksDetector {
  constructor(audioManager, personalityManager, personalBestManager) {
    this.stateMachine = new RepStateMachine('jumpingjacks');
    this.formValidator = new JumpingJacksFormValidator();
    this.feedbackManager = new FeedbackManager(audioManager, personalityManager);
    this.personalityManager = personalityManager;
    this.personalBestManager = personalBestManager;
    this.armBuffer = new AngleBuffer(5);
    this.legBuffer = new AngleBuffer(5);
    this.wristDistanceBuffer = new AngleBuffer(5);
    this.ankleDistanceBuffer = new AngleBuffer(5);
  }

  detect(keypoints) {
    const requiredKeypoints = [
      'left_shoulder', 'right_shoulder',
      'left_wrist', 'right_wrist',
      'left_hip', 'right_hip',
      'left_ankle', 'right_ankle'
    ];

    const avgConfidence = this.calculateConfidence(keypoints, requiredKeypoints);

    const missing = checkKeypointsVisibility(keypoints, requiredKeypoints);
    if (missing.length > 0) {
      return {
        repCount: this.stateMachine.repCount,
        angles: { arms: 0, legs: 0 },
        feedback: 'Position yourself so your full body is visible',
        state: this.stateMachine.state,
        confidence: avgConfidence
      };
    }

    const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
    const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
    const leftWrist = getKeypoint(keypoints, 'left_wrist');
    const rightWrist = getKeypoint(keypoints, 'right_wrist');
    const leftHip = getKeypoint(keypoints, 'left_hip');
    const rightHip = getKeypoint(keypoints, 'right_hip');
    const leftAnkle = getKeypoint(keypoints, 'left_ankle');
    const rightAnkle = getKeypoint(keypoints, 'right_ankle');

    const leftArmAngle = calculateAngle(leftHip, leftShoulder, leftWrist);
    const rightArmAngle = calculateAngle(rightHip, rightShoulder, rightWrist);
    const armAngle = (leftArmAngle + rightArmAngle) / 2;

    const wristDistance = calculateDistance(leftWrist, rightWrist);
    const ankleDistance = calculateDistance(leftAnkle, rightAnkle);
    const shoulderDistance = calculateDistance(leftShoulder, rightShoulder);

    const normalizedAnkleSpread = ankleDistance / shoulderDistance;

    this.armBuffer.add(armAngle);
    this.wristDistanceBuffer.add(wristDistance);
    this.ankleDistanceBuffer.add(normalizedAnkleSpread);

    const smoothArmAngle = this.armBuffer.getAverage();
    const smoothWristDistance = this.wristDistanceBuffer.getAverage();
    const smoothAnkleSpread = this.ankleDistanceBuffer.getAverage();

    const formIssues = this.formValidator.validate(
      keypoints,
      smoothArmAngle,
      smoothAnkleSpread,
      leftWrist,
      rightWrist,
      leftShoulder,
      rightShoulder
    );

    for (const issue of formIssues) {
      this.stateMachine.addFormIssue(issue.message, issue.severity);
      this.feedbackManager.speak(issue.priority, issue.message);
    }

    let feedback = 'Good form';
    const state = this.stateMachine.state;

    if (state === ExerciseState.READY || state === ExerciseState.TOP) {
      if (smoothArmAngle < 45 && smoothAnkleSpread < 1.5 && this.stateMachine.canStartNewRep()) {
        this.stateMachine.changeState(ExerciseState.TOP);
        if (formIssues.length === 0) {
          const readyMessage = this.personalityManager.getRandomMessage('ready');
          feedback = readyMessage || 'Ready - Jump!';
        }
      }
    }

    if (state === ExerciseState.TOP || state === ExerciseState.READY) {
      if (smoothArmAngle > 60 || smoothAnkleSpread > 1.8) {
        this.stateMachine.changeState(ExerciseState.DESCENDING);
        const descendMessage = this.personalityManager.getRandomMessage('descending');
        feedback = descendMessage || 'Jump higher!';
      }
    }

    if (state === ExerciseState.DESCENDING) {
      if (smoothArmAngle > 100 && smoothAnkleSpread > 2.0) {
        this.stateMachine.changeState(ExerciseState.BOTTOM);
        const bottomMessage = this.personalityManager.getRandomMessage('bottom');
        feedback = bottomMessage || 'Good spread - Bring it back!';
        this.feedbackManager.speak(FeedbackPriority.INSTRUCTION, bottomMessage || 'Bring it back!');
      }
    }

    if (state === ExerciseState.BOTTOM) {
      if (smoothArmAngle < 80 || smoothAnkleSpread < 1.8) {
        this.stateMachine.changeState(ExerciseState.ASCENDING);
        const ascendMessage = this.personalityManager.getRandomMessage('ascending');
        feedback = ascendMessage || 'Coming down';
      }
    }

    if (state === ExerciseState.ASCENDING) {
      if (smoothArmAngle < 45 && smoothAnkleSpread < 1.5) {
        const repData = this.stateMachine.completeRep();
        if (repData) {
          const repMessage = this.personalityManager.getRandomMessage('repComplete');
          feedback = repMessage || `Excellent! Rep ${repData.count}`;

          const currentBest = this.personalBestManager.getBestScore('jumpingjacks');
          if (repData.count > currentBest) {
            const recordMessage = this.personalityManager.getRandomMessage('newRecord');
            this.feedbackManager.speak(FeedbackPriority.REP_COUNT, recordMessage || 'New record!');
          } else if (repData.count === currentBest - 2) {
            const approachMessage = this.personalityManager.getRandomMessage('approachingRecord');
            this.feedbackManager.speak(FeedbackPriority.ENCOURAGEMENT, approachMessage || 'Two more for a record!');
          } else {
            this.feedbackManager.speak(
              FeedbackPriority.REP_COUNT,
              repMessage || `Rep ${repData.count}`
            );
          }
        }
      }
    }

    if (formIssues.length > 0 && state !== ExerciseState.READY) {
      feedback = formIssues[0].message;
    }

    return {
      repCount: this.stateMachine.repCount,
      angles: {
        arms: Math.round(smoothArmAngle),
        legs: Math.round(smoothAnkleSpread * 100)
      },
      feedback,
      state: this.stateMachine.state,
      quality: this.stateMachine.repQuality,
      confidence: avgConfidence
    };
  }

  calculateConfidence(keypoints, requiredKeypoints) {
    let totalScore = 0;
    let count = 0;
    for (const name of requiredKeypoints) {
      const kp = keypoints.find(k => k.name === name);
      if (kp && kp.score) {
        totalScore += kp.score;
        count++;
      }
    }
    return count > 0 ? Math.round((totalScore / count) * 100) : 0;
  }

  reset() {
    this.stateMachine.reset();
    this.formValidator.reset();
    this.feedbackManager.reset();
    this.armBuffer.clear();
    this.legBuffer.clear();
    this.wristDistanceBuffer.clear();
    this.ankleDistanceBuffer.clear();
  }
}

class SquatDetector {
  constructor(audioManager, personalityManager, personalBestManager) {
    this.stateMachine = new RepStateMachine('squat');
    this.formValidator = new SquatFormValidator();
    this.feedbackManager = new FeedbackManager(audioManager, personalityManager);
    this.personalityManager = personalityManager;
    this.personalBestManager = personalBestManager;
    this.kneeBuffer = new AngleBuffer(5);
    this.backBuffer = new AngleBuffer(5);
    this.hipBuffer = new AngleBuffer(5);
  }

  detect(keypoints) {
    const requiredKeypoints = [
      'left_shoulder', 'right_shoulder',
      'left_hip', 'right_hip',
      'left_knee', 'right_knee',
      'left_ankle', 'right_ankle'
    ];

    const avgConfidence = this.calculateConfidence(keypoints, requiredKeypoints);

    const missing = checkKeypointsVisibility(keypoints, requiredKeypoints);
    if (missing.length > 0) {
      return {
        repCount: this.stateMachine.repCount,
        angles: { knee: 0, back: 0, hip: 0 },
        feedback: 'Position yourself so your full body is visible',
        state: this.stateMachine.state,
        confidence: avgConfidence
      };
    }

    const kneeData = getBilateralAverage(
      keypoints,
      'left_hip', 'right_hip',
      'left_knee', 'right_knee',
      'left_ankle', 'right_ankle'
    );

    const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
    const leftHip = getKeypoint(keypoints, 'left_hip');
    const leftKnee = getKeypoint(keypoints, 'left_knee');
    const backAngle = calculateAngle(leftShoulder, leftHip, leftKnee);

    const leftAnkle = getKeypoint(keypoints, 'left_ankle');
    const hipAngle = calculateAngle(leftKnee, leftHip, leftShoulder);

    this.kneeBuffer.add(kneeData.avg);
    this.backBuffer.add(backAngle);
    this.hipBuffer.add(hipAngle);

    const smoothKnee = this.kneeBuffer.getAverage();
    const smoothBack = this.backBuffer.getAverage();
    const smoothHip = this.hipBuffer.getAverage();

    const formIssues = this.formValidator.validate(
      keypoints,
      smoothKnee,
      smoothBack,
      smoothHip,
      kneeData.asymmetry
    );

    for (const issue of formIssues) {
      this.stateMachine.addFormIssue(issue.message, issue.severity);
      this.feedbackManager.speak(issue.priority, issue.message);
    }

    let feedback = 'Good form';
    const state = this.stateMachine.state;

    if (state === ExerciseState.READY || state === ExerciseState.TOP) {
      if (smoothKnee > 150 && smoothBack >= 120 && this.stateMachine.canStartNewRep()) {
        this.stateMachine.changeState(ExerciseState.TOP);
        if (formIssues.length === 0) {
          const readyMessage = this.personalityManager.getRandomMessage('ready');
          feedback = readyMessage || 'Ready - Squat down slowly';
        }
      }
    }

    if (state === ExerciseState.TOP || state === ExerciseState.READY) {
      if (smoothKnee < 140) {
        this.stateMachine.changeState(ExerciseState.DESCENDING);
        const descendMessage = this.personalityManager.getRandomMessage('descending');
        feedback = descendMessage || 'Descending - Control the movement';
      }
    }

    if (state === ExerciseState.DESCENDING) {
      if (smoothKnee < 110) {
        this.stateMachine.changeState(ExerciseState.BOTTOM);
        const bottomMessage = this.personalityManager.getRandomMessage('bottom');
        feedback = bottomMessage || 'Good depth - Stand up';
        this.feedbackManager.speak(FeedbackPriority.INSTRUCTION, bottomMessage || 'Stand up');
      }
    }

    if (state === ExerciseState.BOTTOM) {
      if (smoothKnee > 120) {
        this.stateMachine.changeState(ExerciseState.ASCENDING);
        const ascendMessage = this.personalityManager.getRandomMessage('ascending');
        feedback = ascendMessage || 'Ascending - Drive through heels';
      }
    }

    if (state === ExerciseState.ASCENDING) {
      if (smoothKnee > 150) {
        const repData = this.stateMachine.completeRep();
        if (repData) {
          const repMessage = this.personalityManager.getRandomMessage('repComplete');
          feedback = repMessage || `Perfect! Rep ${repData.count}`;

          const currentBest = this.personalBestManager.getBestScore('squat');
          if (repData.count > currentBest) {
            const recordMessage = this.personalityManager.getRandomMessage('newRecord');
            this.feedbackManager.speak(FeedbackPriority.REP_COUNT, recordMessage || 'New record!');
          } else if (repData.count === currentBest - 2) {
            const approachMessage = this.personalityManager.getRandomMessage('approachingRecord');
            this.feedbackManager.speak(FeedbackPriority.ENCOURAGEMENT, approachMessage || 'Two more for a record!');
          } else {
            this.feedbackManager.speak(
              FeedbackPriority.REP_COUNT,
              repMessage || `Rep ${repData.count}`
            );
          }
        }
      }
    }

    if (formIssues.length > 0 && state !== ExerciseState.READY) {
      feedback = formIssues[0].message;
    }

    return {
      repCount: this.stateMachine.repCount,
      angles: {
        knee: Math.round(smoothKnee),
        back: Math.round(smoothBack),
        hip: Math.round(smoothHip)
      },
      feedback,
      state: this.stateMachine.state,
      quality: this.stateMachine.repQuality,
      confidence: avgConfidence
    };
  }

  calculateConfidence(keypoints, requiredKeypoints) {
    let totalScore = 0;
    let count = 0;
    for (const name of requiredKeypoints) {
      const kp = keypoints.find(k => k.name === name);
      if (kp && kp.score) {
        totalScore += kp.score;
        count++;
      }
    }
    return count > 0 ? Math.round((totalScore / count) * 100) : 0;
  }

  reset() {
    this.stateMachine.reset();
    this.formValidator.reset();
    this.feedbackManager.reset();
    this.kneeBuffer.clear();
    this.backBuffer.clear();
    this.hipBuffer.clear();
  }
}
