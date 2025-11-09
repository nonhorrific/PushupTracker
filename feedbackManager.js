const FeedbackPriority = {
  REP_COUNT: 1,
  CRITICAL_FORM: 2,
  FORM_WARNING: 3,
  ENCOURAGEMENT: 4,
  INSTRUCTION: 5
};

class FeedbackManager {
  constructor(audioManager, personalityManager) {
    this.audioManager = audioManager;
    this.personalityManager = personalityManager;
    this.lastFeedbackByCategory = {};
    this.categoryMinInterval = {
      [FeedbackPriority.REP_COUNT]: 1000,
      [FeedbackPriority.CRITICAL_FORM]: 5000,
      [FeedbackPriority.FORM_WARNING]: 8000,
      [FeedbackPriority.ENCOURAGEMENT]: 10000,
      [FeedbackPriority.INSTRUCTION]: 7000
    };
    this.lastFeedbackMessage = {};
  }

  canSpeak(category, message) {
    const now = Date.now();
    const categoryKey = category.toString();
    const messageKey = `${category}_${message}`;

    if (this.lastFeedbackMessage[messageKey]) {
      const timeSince = now - this.lastFeedbackMessage[messageKey];
      if (timeSince < this.categoryMinInterval[category]) {
        return false;
      }
    }

    if (this.lastFeedbackByCategory[categoryKey]) {
      const timeSince = now - this.lastFeedbackByCategory[categoryKey];
      if (category !== FeedbackPriority.REP_COUNT && timeSince < 2000) {
        return false;
      }
    }

    return true;
  }

  async speak(category, message) {
    if (!this.canSpeak(category, message)) {
      return false;
    }

    const now = Date.now();
    const categoryKey = category.toString();
    const messageKey = `${category}_${message}`;

    this.lastFeedbackByCategory[categoryKey] = now;
    this.lastFeedbackMessage[messageKey] = now;

    if (this.audioManager && this.personalityManager) {
      const personality = this.personalityManager.getPersonality();
      await this.audioManager.speak(message, personality);
    } else {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.1;
      speechSynthesis.speak(utterance);
    }

    return true;
  }

  reset() {
    this.lastFeedbackByCategory = {};
    this.lastFeedbackMessage = {};
  }
}
