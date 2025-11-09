class PersonalBestManager {
  constructor() {
    this.storageKey = 'fitness_personal_bests';
    this.cache = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading personal bests:', error);
      return {};
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Error saving personal bests:', error);
    }
  }

  getBestScore(exerciseType) {
    return this.cache[exerciseType] || 0;
  }

  checkIfNewRecord(exerciseType, currentReps) {
    const currentBest = this.getBestScore(exerciseType);
    return currentReps > currentBest;
  }

  updateBestScore(exerciseType, newScore) {
    const currentBest = this.getBestScore(exerciseType);
    if (newScore > currentBest) {
      this.cache[exerciseType] = newScore;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getProgressTowardsBest(exerciseType, currentReps) {
    const best = this.getBestScore(exerciseType);
    if (best === 0) return null;

    const remaining = best - currentReps;
    if (remaining <= 0) {
      return { isNewRecord: true, difference: Math.abs(remaining) };
    } else {
      return { isNewRecord: false, remaining };
    }
  }

  getAllBests() {
    return { ...this.cache };
  }

  resetBest(exerciseType) {
    delete this.cache[exerciseType];
    this.saveToStorage();
  }

  resetAll() {
    this.cache = {};
    this.saveToStorage();
  }
}
