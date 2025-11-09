class PushupDetector {
  constructor() {
    this.stateMachine = new RepStateMachine('pushup');
    this.formValidator = new PushupFormValidator();
    this.feedbackManager = new FeedbackManager();
    this.elbowBuffer = new AngleBuffer(5);
    this.bodyBuffer = new AngleBuffer(5);
    this.hipKneeBuffer = new AngleBuffer(5);
  }

  detect(keypoints) {
    const requiredKeypoints = [
      'left_shoulder', 'right_shoulder',
      'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist',
      'left_hip', 'right_hip',
      'left_knee', 'right_knee'
    ];

    const missing = checkKeypointsVisibility(keypoints, requiredKeypoints);
    if (missing.length > 0) {
      return {
        repCount: this.stateMachine.repCount,
        angles: { elbow: 0, body: 0, hipKnee: 0 },
        feedback: 'Position yourself so your full body is visible',
        state: this.stateMachine.state
      };
    }

    const elbowData = getBilateralAverage(
      keypoints,
      'left_shoulder', 'right_shoulder',
      'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist'
    );

    const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
    const leftHip = getKeypoint(keypoints, 'left_hip');
    const leftKnee = getKeypoint(keypoints, 'left_knee');
    const bodyAngle = calculateAngle(leftShoulder, leftHip, leftKnee);

    const hipKneeAngle = calculateAngle(leftHip, leftKnee, getKeypoint(keypoints, 'left_ankle'));

    this.elbowBuffer.add(elbowData.avg);
    this.bodyBuffer.add(bodyAngle);
    this.hipKneeBuffer.add(hipKneeAngle);

    const smoothElbow = this.elbowBuffer.getAverage();
    const smoothBody = this.bodyBuffer.getAverage();
    const smoothHipKnee = this.hipKneeBuffer.getAverage();

    const formIssues = this.formValidator.validate(
      keypoints,
      smoothElbow,
      smoothBody,
      smoothHipKnee,
      elbowData.asymmetry
    );

    for (const issue of formIssues) {
      this.stateMachine.addFormIssue(issue.message, issue.severity);
      this.feedbackManager.speak(issue.priority, issue.message);
    }

    let feedback = 'Good form';
    const state = this.stateMachine.state;

    if (state === ExerciseState.READY || state === ExerciseState.TOP) {
      if (smoothElbow > 160 && smoothBody >= 150 && this.stateMachine.canTransition()) {
        this.stateMachine.changeState(ExerciseState.TOP);
        if (formIssues.length === 0) {
          feedback = 'Ready - Go down slowly';
        }
      }
    }

    if (state === ExerciseState.TOP || state === ExerciseState.READY) {
      if (smoothElbow < 150 && this.stateMachine.canTransition()) {
        this.stateMachine.changeState(ExerciseState.DESCENDING);
        feedback = 'Descending - Keep control';
      }
    }

    if (state === ExerciseState.DESCENDING) {
      if (smoothElbow < 90 && this.stateMachine.canTransition()) {
        this.stateMachine.changeState(ExerciseState.BOTTOM);
        feedback = 'Good depth - Push up';
        this.feedbackManager.speak(FeedbackPriority.INSTRUCTION, 'Push up');
      }
    }

    if (state === ExerciseState.BOTTOM) {
      if (smoothElbow > 100 && this.stateMachine.canTransition()) {
        this.stateMachine.changeState(ExerciseState.ASCENDING);
        feedback = 'Ascending - Keep pushing';
      }
    }

    if (state === ExerciseState.ASCENDING) {
      if (smoothElbow > 160 && this.stateMachine.canTransition()) {
        const repData = this.stateMachine.completeRep();
        if (repData) {
          feedback = `Excellent! Rep ${repData.count} - Quality: ${repData.quality}%`;
          this.feedbackManager.speak(
            FeedbackPriority.REP_COUNT,
            `Good rep. Total ${repData.count}`
          );
        }
      }
    }

    if (formIssues.length > 0 && state !== ExerciseState.READY) {
      feedback = formIssues[0].message;
    }

    return {
      repCount: this.stateMachine.repCount,
      angles: {
        elbow: Math.round(smoothElbow),
        body: Math.round(smoothBody),
        hipKnee: Math.round(smoothHipKnee)
      },
      feedback,
      state: this.stateMachine.state,
      quality: this.stateMachine.repQuality
    };
  }

  reset() {
    this.stateMachine.reset();
    this.formValidator.reset();
    this.feedbackManager.reset();
    this.elbowBuffer.clear();
    this.bodyBuffer.clear();
    this.hipKneeBuffer.clear();
  }
}

class SquatDetector {
  constructor() {
    this.stateMachine = new RepStateMachine('squat');
    this.formValidator = new SquatFormValidator();
    this.feedbackManager = new FeedbackManager();
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

    const missing = checkKeypointsVisibility(keypoints, requiredKeypoints);
    if (missing.length > 0) {
      return {
        repCount: this.stateMachine.repCount,
        angles: { knee: 0, back: 0, hip: 0 },
        feedback: 'Position yourself so your full body is visible',
        state: this.stateMachine.state
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
      if (smoothKnee > 160 && smoothBack >= 130 && this.stateMachine.canTransition()) {
        this.stateMachine.changeState(ExerciseState.TOP);
        if (formIssues.length === 0) {
          feedback = 'Ready - Squat down slowly';
        }
      }
    }

    if (state === ExerciseState.TOP || state === ExerciseState.READY) {
      if (smoothKnee < 150 && this.stateMachine.canTransition()) {
        this.stateMachine.changeState(ExerciseState.DESCENDING);
        feedback = 'Descending - Control the movement';
      }
    }

    if (state === ExerciseState.DESCENDING) {
      if (smoothKnee < 100 && this.stateMachine.canTransition()) {
        this.stateMachine.changeState(ExerciseState.BOTTOM);
        feedback = 'Good depth - Stand up';
        this.feedbackManager.speak(FeedbackPriority.INSTRUCTION, 'Stand up');
      }
    }

    if (state === ExerciseState.BOTTOM) {
      if (smoothKnee > 110 && this.stateMachine.canTransition()) {
        this.stateMachine.changeState(ExerciseState.ASCENDING);
        feedback = 'Ascending - Drive through heels';
      }
    }

    if (state === ExerciseState.ASCENDING) {
      if (smoothKnee > 160 && this.stateMachine.canTransition()) {
        const repData = this.stateMachine.completeRep();
        if (repData) {
          feedback = `Perfect! Rep ${repData.count} - Quality: ${repData.quality}%`;
          this.feedbackManager.speak(
            FeedbackPriority.REP_COUNT,
            `Good rep. Total ${repData.count}`
          );
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
      quality: this.stateMachine.repQuality
    };
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
