class FormValidator {
  constructor() {
    this.issueHistory = {};
    this.persistenceThreshold = 5;
  }

  trackIssue(issueKey) {
    if (!this.issueHistory[issueKey]) {
      this.issueHistory[issueKey] = { count: 0, lastSeen: Date.now() };
    }

    const now = Date.now();
    if (now - this.issueHistory[issueKey].lastSeen > 3000) {
      this.issueHistory[issueKey].count = 0;
    }

    this.issueHistory[issueKey].count++;
    this.issueHistory[issueKey].lastSeen = now;

    return this.issueHistory[issueKey].count >= this.persistenceThreshold;
  }

  clearIssue(issueKey) {
    if (this.issueHistory[issueKey]) {
      this.issueHistory[issueKey].count = 0;
    }
  }

  reset() {
    this.issueHistory = {};
  }
}

class PushupFormValidator extends FormValidator {
  validate(keypoints, elbowAngle, bodyAngle, hipKneeAngle, asymmetry) {
    const issues = [];

    if (bodyAngle < 140) {
      if (this.trackIssue('back_sag')) {
        issues.push({
          message: 'Engage your core and keep your body straight',
          severity: 'CRITICAL',
          priority: FeedbackPriority.CRITICAL_FORM
        });
      }
    } else {
      this.clearIssue('back_sag');
    }

    if (hipKneeAngle < 150) {
      if (this.trackIssue('hips_low')) {
        issues.push({
          message: 'Try to keep your hips aligned with your body',
          severity: 'WARNING',
          priority: FeedbackPriority.FORM_WARNING
        });
      }
    } else {
      this.clearIssue('hips_low');
    }

    if (asymmetry > 30) {
      if (this.trackIssue('asymmetry')) {
        issues.push({
          message: 'Try to keep both arms moving evenly',
          severity: 'WARNING',
          priority: FeedbackPriority.FORM_WARNING
        });
      }
    } else {
      this.clearIssue('asymmetry');
    }

    const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
    const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
    const leftWrist = getKeypoint(keypoints, 'left_wrist');
    const rightWrist = getKeypoint(keypoints, 'right_wrist');

    if (leftShoulder && leftWrist && rightShoulder && rightWrist) {
      const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);
      const handWidth = calculateDistance(leftWrist, rightWrist);

      if (handWidth > shoulderWidth * 2.0) {
        if (this.trackIssue('hands_wide')) {
          issues.push({
            message: 'Consider bringing your hands a bit closer',
            severity: 'WARNING',
            priority: FeedbackPriority.FORM_WARNING
          });
        }
      } else {
        this.clearIssue('hands_wide');
      }
    }

    return issues;
  }
}

class SquatFormValidator extends FormValidator {
  validate(keypoints, kneeAngle, backAngle, hipAngle, asymmetry) {
    const issues = [];

    if (backAngle < 120) {
      if (this.trackIssue('back_lean')) {
        issues.push({
          message: 'Try to keep your chest up and back straight',
          severity: 'CRITICAL',
          priority: FeedbackPriority.CRITICAL_FORM
        });
      }
    } else {
      this.clearIssue('back_lean');
    }

    const leftKnee = getKeypoint(keypoints, 'left_knee');
    const leftAnkle = getKeypoint(keypoints, 'left_ankle');
    const rightKnee = getKeypoint(keypoints, 'right_knee');
    const rightAnkle = getKeypoint(keypoints, 'right_ankle');

    if (leftKnee && leftAnkle && rightKnee && rightAnkle) {
      const kneeAnkleDistance = calculateDistance(leftKnee, leftAnkle);
      const proportionalThreshold = kneeAnkleDistance * 0.3;

      const leftKneeOverToe = leftKnee.x > leftAnkle.x + proportionalThreshold;
      const rightKneeOverToe = rightKnee.x < rightAnkle.x - proportionalThreshold;

      if ((leftKneeOverToe || rightKneeOverToe) && kneeAngle < 120) {
        if (this.trackIssue('knee_over_toe')) {
          issues.push({
            message: 'Try to keep your weight on your heels',
            severity: 'WARNING',
            priority: FeedbackPriority.FORM_WARNING
          });
        }
      } else {
        this.clearIssue('knee_over_toe');
      }
    }

    if (asymmetry > 35) {
      if (this.trackIssue('asymmetry')) {
        issues.push({
          message: 'Try to keep your weight balanced between both legs',
          severity: 'WARNING',
          priority: FeedbackPriority.FORM_WARNING
        });
      }
    } else {
      this.clearIssue('asymmetry');
    }

    return issues;
  }
}
