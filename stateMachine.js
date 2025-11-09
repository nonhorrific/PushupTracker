const ExerciseState = {
  READY: 'READY',
  DESCENDING: 'DESCENDING',
  BOTTOM: 'BOTTOM',
  ASCENDING: 'ASCENDING',
  TOP: 'TOP',
  COMPLETED: 'COMPLETED'
};

class RepStateMachine {
  constructor(exerciseType) {
    this.exerciseType = exerciseType;
    this.state = ExerciseState.READY;
    this.stateStartTime = Date.now();
    this.repStartTime = null;
    this.repCount = 0;
    this.repQuality = 100;
    this.formIssuesDuringRep = [];
    this.minStateTime = 200;
    this.angleHistory = [];
  }

  getTimeInState() {
    return Date.now() - this.stateStartTime;
  }

  canTransition() {
    return this.getTimeInState() >= this.minStateTime;
  }

  changeState(newState) {
    if (this.state === newState) return false;

    this.state = newState;
    this.stateStartTime = Date.now();

    if (newState === ExerciseState.DESCENDING) {
      this.repStartTime = Date.now();
      this.formIssuesDuringRep = [];
      this.repQuality = 100;
    }

    return true;
  }

  addFormIssue(issue, severity) {
    this.formIssuesDuringRep.push({ issue, severity, time: Date.now() });
    if (severity === 'CRITICAL') {
      this.repQuality -= 20;
    } else if (severity === 'WARNING') {
      this.repQuality -= 10;
    }
    this.repQuality = Math.max(0, this.repQuality);
  }

  completeRep() {
    if (this.state !== ExerciseState.ASCENDING && this.state !== ExerciseState.TOP) {
      return null;
    }

    this.repCount++;
    const repData = {
      count: this.repCount,
      quality: Math.round(this.repQuality),
      duration: Date.now() - this.repStartTime,
      formIssues: this.formIssuesDuringRep.length,
      timestamp: Date.now()
    };

    this.changeState(ExerciseState.COMPLETED);
    setTimeout(() => this.changeState(ExerciseState.READY), 500);

    return repData;
  }

  reset() {
    this.state = ExerciseState.READY;
    this.stateStartTime = Date.now();
    this.repStartTime = null;
    this.repCount = 0;
    this.repQuality = 100;
    this.formIssuesDuringRep = [];
    this.angleHistory = [];
  }
}
