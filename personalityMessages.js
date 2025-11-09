const PersonalityType = {
  MILITARY: 'military',
  POPUP_GIRL: 'popup_girl',
  GYM_BRO: 'gym_bro'
};

const PersonalityMessages = {
  military: {
    name: 'Military Sergeant',
    starting: [
      'Attention! Get in position soldier!',
      'Lock and load! Time to move!',
      'Drop and give me twenty!'
    ],
    ready: [
      'Ready position! Stand by!',
      'Lock out those arms!',
      'Good form soldier!'
    ],
    descending: [
      'Down! Controlled descent!',
      'Keep that body straight!',
      'No sagging recruit!'
    ],
    bottom: [
      'Push up! Move move move!',
      'Drive through! No quitting!',
      'Full power! Let\'s go!'
    ],
    ascending: [
      'Keep pushing!',
      'Almost there soldier!',
      'Don\'t stop now!'
    ],
    repComplete: [
      'Outstanding!',
      'Excellent form!',
      'That\'s what I\'m talking about!',
      'Solid rep soldier!'
    ],
    newRecord: [
      'New record! Outstanding performance soldier!',
      'You\'ve exceeded expectations! Excellent work!',
      'Personal best achieved! You\'re a machine!'
    ],
    approachingRecord: [
      'Two more to beat your record!',
      'You\'re close to your best! Keep going!',
      'Push through! Record in sight!'
    ],
    formWarning: [
      'Straighten that back!',
      'Lock those elbows!',
      'Keep your core tight!',
      'Fix your form soldier!'
    ]
  },

  popup_girl: {
    name: 'Pop-up Girl',
    starting: [
      'OMG let\'s do this super sigma!',
      'Yasss! Ready to crush it!',
      'You got this bestie!'
    ],
    ready: [
      'Looking good super sigma!',
      'Perfect form! Love it!',
      'You\'re literally glowing!'
    ],
    descending: [
      'Going down! So smooth!',
      'Omg yes! Keep that control!',
      'Slay that form!'
    ],
    bottom: [
      'Push it up! You\'re amazing!',
      'Come on! I know you can!',
      'Beast mode! Let\'s go!'
    ],
    ascending: [
      'Yes yes yes! Keep going!',
      'You\'re doing so good!',
      'Almost there! Push!'
    ],
    repComplete: [
      'Yasss queen energy!',
      'That was fire!',
      'Literally unstoppable!',
      'You ate that up!'
    ],
    newRecord: [
      'OMG NEW RECORD! You\'re literally the best super sigma!',
      'NO WAY! That\'s insane! New personal best!',
      'You just crushed your record! I\'m screaming!'
    ],
    approachingRecord: [
      'Wait wait! Can you make it to your best? Maybe even beat it?',
      'Omg you\'re so close! Two more!',
      'Your record is right there! Get it!'
    ],
    formWarning: [
      'Oops! Watch that back bestie!',
      'Keep it straight! You got this!',
      'Fix that form super sigma!',
      'Almost perfect! Just adjust a bit!'
    ]
  },

  gym_bro: {
    name: 'Gym Bro',
    starting: [
      'Let\'s crush this bro!',
      'Time to get those gains!',
      'Let\'s go! Beast mode activated!'
    ],
    ready: [
      'Solid position bro!',
      'Looking strong!',
      'That\'s what I\'m talking about!'
    ],
    descending: [
      'Control it bro!',
      'Nice and smooth!',
      'Feel that burn!'
    ],
    bottom: [
      'Explode up! Let\'s go!',
      'Push through bro!',
      'All you! Drive it!'
    ],
    ascending: [
      'Keep grinding!',
      'You got this!',
      'Push it bro!'
    ],
    repComplete: [
      'Clean rep bro!',
      'That\'s it! Gains incoming!',
      'Crushing it!',
      'Respect!'
    ],
    newRecord: [
      'Bro! New PR! That\'s massive!',
      'New personal record! You\'re a beast!',
      'You just smashed your best! Let\'s go!'
    ],
    approachingRecord: [
      'Yo! Two more for a new PR!',
      'Your record is right there bro!',
      'Push through! New best coming!'
    ],
    formWarning: [
      'Check that form bro!',
      'Keep it tight!',
      'Straighten up!',
      'Lock it in!'
    ]
  }
};

class PersonalityManager {
  constructor() {
    this.storageKey = 'fitness_selected_personality';
    this.currentPersonality = this.loadPersonality();
  }

  loadPersonality() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved || PersonalityType.MILITARY;
    } catch (error) {
      console.error('Error loading personality:', error);
      return PersonalityType.MILITARY;
    }
  }

  savePersonality(personality) {
    try {
      localStorage.setItem(this.storageKey, personality);
      this.currentPersonality = personality;
    } catch (error) {
      console.error('Error saving personality:', error);
    }
  }

  getPersonality() {
    return this.currentPersonality;
  }

  getMessages() {
    return PersonalityMessages[this.currentPersonality];
  }

  getRandomMessage(category) {
    const messages = this.getMessages();
    const categoryMessages = messages[category];
    if (!categoryMessages || categoryMessages.length === 0) {
      return '';
    }
    return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
  }

  getPersonalityName() {
    return PersonalityMessages[this.currentPersonality].name;
  }

  getAllPersonalities() {
    return [
      { id: PersonalityType.MILITARY, name: PersonalityMessages.military.name },
      { id: PersonalityType.POPUP_GIRL, name: PersonalityMessages.popup_girl.name },
      { id: PersonalityType.GYM_BRO, name: PersonalityMessages.gym_bro.name }
    ];
  }
}
