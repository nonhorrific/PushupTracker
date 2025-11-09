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
      'Drop and give me twenty!',
      'Front and center recruit!',
      'On the ground! Double time!',
      'Battle stations! Let\'s go!',
      'Formation! Now!',
      'Get ready to work soldier!'
    ],
    ready: [
      'Ready position! Stand by!',
      'Lock out those arms!',
      'Good form soldier!',
      'Position locked!',
      'Proper posture recruit!',
      'Arms extended! Perfect!',
      'Ready for action!',
      'Standing strong soldier!',
      'Hold that position!',
      'Textbook form!'
    ],
    descending: [
      'Down! Controlled descent!',
      'Keep that body straight!',
      'No sagging recruit!',
      'Lower with control!',
      'Chest to deck soldier!',
      'Maintain that form!',
      'Steady descent!',
      'Keep it tight!',
      'Control the drop!',
      'Straight as a board!'
    ],
    bottom: [
      'Push up! Move move move!',
      'Drive through! No quitting!',
      'Full power! Let\'s go!',
      'Explode up soldier!',
      'Give me everything!',
      'Push! Push! Push!',
      'All your strength!',
      'Drive it up recruit!',
      'Maximum effort!',
      'Power through!'
    ],
    ascending: [
      'Keep pushing!',
      'Almost there soldier!',
      'Don\'t stop now!',
      'Drive through!',
      'Finish strong!',
      'All the way up!',
      'Keep grinding!',
      'You got this!',
      'Push recruit!',
      'Complete the rep!'
    ],
    repComplete: [
      'Outstanding!',
      'Excellent form!',
      'That\'s what I\'m talking about!',
      'Solid rep soldier!',
      'Textbook execution!',
      'Perfect form!',
      'Well done recruit!',
      'Exceptional!',
      'Good work!',
      'Strong rep!',
      'Exactly right!',
      'You nailed it!',
      'Superior form soldier!',
      'Right on target!'
    ],
    newRecord: [
      'New record! Outstanding performance soldier!',
      'You\'ve exceeded expectations! Excellent work!',
      'Personal best achieved! You\'re a machine!',
      'Record broken! Exceptional work recruit!',
      'New personal best! Outstanding!',
      'You just crushed your old record soldier!'
    ],
    approachingRecord: [
      'Two more to beat your record!',
      'You\'re close to your best! Keep going!',
      'Push through! Record in sight!',
      'Almost there! Two more soldier!',
      'Your record is within reach!',
      'Keep pushing! Almost got it!'
    ],
    formWarning: [
      'Straighten that back!',
      'Lock those elbows!',
      'Keep your core tight!',
      'Fix your form soldier!',
      'Tighten up recruit!',
      'Adjust that posture!',
      'Core engaged!',
      'Fix that alignment!'
    ]
  },

  popup_girl: {
    name: 'Pop-up Girl',
    starting: [
      'OMG let\'s do this super sigma!',
      'Yasss! Ready to crush it!',
      'You got this bestie!',
      'Eee! So excited! Let\'s gooo!',
      'Okay okay! Time to shine!',
      'This is gonna be amazing!',
      'Let\'s get it super sigma!',
      'Ready set let\'s do this!'
    ],
    ready: [
      'Looking good super sigma!',
      'Perfect form! Love it!',
      'You\'re literally glowing!',
      'Omg yes! So good!',
      'Gorgeous position!',
      'You look amazing!',
      'That\'s it! Perfect!',
      'Slay that stance!',
      'Absolutely stunning form!',
      'You\'re doing great!'
    ],
    descending: [
      'Going down! So smooth!',
      'Omg yes! Keep that control!',
      'Slay that form!',
      'Down we go! Nice!',
      'Smooth like butter!',
      'Yess! So controlled!',
      'Looking so good!',
      'Perfect descent bestie!',
      'Keep it smooth!',
      'Beautiful control!'
    ],
    bottom: [
      'Push it up! You\'re amazing!',
      'Come on! I know you can!',
      'Beast mode! Let\'s go!',
      'Up up up! You got it!',
      'Push bestie! Strong!',
      'Let\'s go super sigma!',
      'Drive it! Yesss!',
      'Power up! Come on!',
      'You can do it!',
      'All the way up!'
    ],
    ascending: [
      'Yes yes yes! Keep going!',
      'You\'re doing so good!',
      'Almost there! Push!',
      'Keep pushing bestie!',
      'So close! Let\'s go!',
      'Yass! Keep it up!',
      'Almost there super sigma!',
      'Don\'t stop! You got this!',
      'Push push push!',
      'Finish strong!'
    ],
    repComplete: [
      'Yasss queen energy!',
      'That was fire!',
      'Literally unstoppable!',
      'You ate that up!',
      'So proud of you!',
      'Absolutely killed it!',
      'That was perfect!',
      'Amazing job bestie!',
      'You\'re a star!',
      'Slay! That was so good!',
      'Incredible super sigma!',
      'Love that for you!',
      'You crushed it!',
      'On fire!'
    ],
    newRecord: [
      'OMG NEW RECORD! You\'re literally the best super sigma!',
      'NO WAY! That\'s insane! New personal best!',
      'You just crushed your record! I\'m screaming!',
      'Wait WHAT! New record! I can\'t believe it!',
      'THIS IS HUGE! New best! So proud!',
      'You did NOT just break your record! Yesss!'
    ],
    approachingRecord: [
      'Wait wait! Can you make it to your best? Maybe even beat it?',
      'Omg you\'re so close! Two more!',
      'Your record is right there! Get it!',
      'So close to your best! You can do it!',
      'Two more for a new record! Come on!',
      'Almost there! Beat that record!'
    ],
    formWarning: [
      'Oops! Watch that back bestie!',
      'Keep it straight! You got this!',
      'Fix that form super sigma!',
      'Almost perfect! Just adjust a bit!',
      'Little fix needed! You got it!',
      'Adjust that posture bestie!',
      'Straighten up! Almost there!',
      'Tiny adjustment! So close!'
    ]
  },

  gym_bro: {
    name: 'Gym Bro',
    starting: [
      'Let\'s crush this bro!',
      'Time to get those gains!',
      'Let\'s go! Beast mode activated!',
      'Yo! Let\'s work!',
      'Time to grind bro!',
      'Let\'s get it man!',
      'Ready to destroy this!',
      'Gains time! Let\'s go!'
    ],
    ready: [
      'Solid position bro!',
      'Looking strong!',
      'That\'s what I\'m talking about!',
      'Perfect setup man!',
      'Nice form bro!',
      'You\'re locked in!',
      'Strong position!',
      'Looking good!',
      'Dialed in!',
      'Ready to work!'
    ],
    descending: [
      'Control it bro!',
      'Nice and smooth!',
      'Feel that burn!',
      'Slow and controlled!',
      'That\'s it man!',
      'Keep it tight!',
      'Good tempo!',
      'Feel those muscles!',
      'Controlled descent!',
      'Smooth rep bro!'
    ],
    bottom: [
      'Explode up! Let\'s go!',
      'Push through bro!',
      'All you! Drive it!',
      'Power up man!',
      'Let\'s go!',
      'Drive it bro!',
      'Push hard!',
      'Give it everything!',
      'Up! Up! Up!',
      'Explode through!'
    ],
    ascending: [
      'Keep grinding!',
      'You got this!',
      'Push it bro!',
      'Almost there!',
      'Drive it home!',
      'Keep pushing man!',
      'Finish strong!',
      'Lock it out!',
      'All the way!',
      'Complete it bro!'
    ],
    repComplete: [
      'Clean rep bro!',
      'That\'s it! Gains incoming!',
      'Crushing it!',
      'Respect!',
      'Nice work man!',
      'Solid rep!',
      'Beautiful!',
      'That\'s how it\'s done!',
      'Strong rep bro!',
      'Killed it!',
      'Perfect execution!',
      'You\'re a machine!',
      'Beast mode!',
      'Gains!'
    ],
    newRecord: [
      'Bro! New PR! That\'s massive!',
      'New personal record! You\'re a beast!',
      'You just smashed your best! Let\'s go!',
      'No way! New record man!',
      'That\'s a new best! Huge!',
      'Personal best! You\'re killing it bro!'
    ],
    approachingRecord: [
      'Yo! Two more for a new PR!',
      'Your record is right there bro!',
      'Push through! New best coming!',
      'Two more man! Get that record!',
      'So close to your best!',
      'New PR within reach bro!'
    ],
    formWarning: [
      'Check that form bro!',
      'Keep it tight!',
      'Straighten up!',
      'Lock it in!',
      'Fix that form man!',
      'Tighten up!',
      'Adjust bro!',
      'Form check!'
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
