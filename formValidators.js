class FormValidator {
  constructor() {
    this.issueHistory = {};
    this.persistenceThreshold = 3;
  }

  trackIssue(issueKey) {
    if (!this.issueHistory[issueKey]) {
      this.issueHistory[issueKey] = { count: 0, lastSeen: Date.now() };
    }

    const now = Date.now();
    if (now - this.issueHistory[issueKey].lastSeen > 2000) {
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
          message: 'Keep your back straight and core tight',
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
          message: 'Keep your hips up in line with your body',
          severity: 'WARNING',
          priority: FeedbackPriority.FORM_WARNING
        });
      }
    } else {
      this.clearIssue('hips_low');
    }

    if (asymmetry > 20) {
      if (this.trackIssue('asymmetry')) {
        issues.push({
          message: 'Keep both arms at the same level',
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

class SquatFormValidator extends FormValidator {
  validate(keypoints, kneeAngle, backAngle, hipAngle, asymmetry) {
    const issues = [];

    if (backAngle < 120) {
      if (this.trackIssue('back_lean')) {
        issues.push({
          message: 'Keep your chest up and back straighter',
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
      const leftKneeOverToe = leftKnee.x > leftAnkle.x + 50;
      const rightKneeOverToe = rightKnee.x < rightAnkle.x - 50;

      if (leftKneeOverToe || rightKneeOverToe) {
        if (this.trackIssue('knee_over_toe')) {
          issues.push({
            message: 'Keep your knees behind your toes',
            severity: 'CRITICAL',
            priority: FeedbackPriority.CRITICAL_FORM
          });
        }
      } else {
        this.clearIssue('knee_over_toe');
      }
    }

    if (asymmetry > 25) {
      if (this.trackIssue('asymmetry')) {
        issues.push({
          message: 'Keep your weight balanced on both legs',
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
