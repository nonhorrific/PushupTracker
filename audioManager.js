class AudioManager {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.audioCache = new Map();
    this.isGenerating = false;
    this.voiceIds = {
      military: 'pNInz6obpgDQGcFmaJgB',
      popup_girl: 'EXAVITQu4vr4xnSDxMaL',
      gym_bro: 'onwK4e9ZLuTAKqWW03F9'
    };
    this.elevenLabsEnabled = true;
    this.currentAudio = null;
    this.specialAudio = null;
    this.isPlayingSpecial = false;
    this.audioQueue = [];
    this.isProcessingQueue = false;
    this.lastPlayTime = 0;
    this.playDebounceDelay = 200;
  }

  async generateSpeech(text, personality) {
    if (!this.elevenLabsEnabled || !this.apiKey) {
      return null;
    }

    const cacheKey = `${personality}_${text}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey);
    }

    try {
      const voiceId = this.voiceIds[personality] || this.voiceIds.military;
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        console.error('ElevenLabs API error:', response.status);
        this.elevenLabsEnabled = false;
        return null;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      this.audioCache.set(cacheKey, audioUrl);
      return audioUrl;
    } catch (error) {
      console.error('Error generating speech:', error);
      this.elevenLabsEnabled = false;
      return null;
    }
  }

  async playAudio(audioUrl) {
    if (!audioUrl) {
      return false;
    }

    const now = Date.now();
    if (now - this.lastPlayTime < this.playDebounceDelay) {
      return false;
    }
    this.lastPlayTime = now;

    try {
      if (this.currentAudio) {
        try {
          this.currentAudio.pause();
          this.currentAudio.currentTime = 0;
        } catch (e) {
        }
      }

      this.currentAudio = new Audio(audioUrl);

      return new Promise((resolve) => {
        const playPromise = this.currentAudio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => resolve(true))
            .catch((error) => {
              if (error.name !== 'AbortError') {
                console.error('Error playing audio:', error);
              }
              resolve(false);
            });
        } else {
          resolve(true);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      return false;
    }
  }

  async speak(text, personality) {
    if (!text) return false;

    if (this.isPlayingSpecial) {
      return false;
    }

    const audioUrl = await this.generateSpeech(text, personality);

    if (audioUrl) {
      return await this.playAudio(audioUrl);
    } else {
      return this.fallbackToWebSpeech(text);
    }
  }

  async playSpecialAudio(audioFilePath) {
    try {
      if (this.currentAudio) {
        try {
          this.currentAudio.pause();
          this.currentAudio.currentTime = 0;
        } catch (e) {
        }
      }

      speechSynthesis.cancel();

      this.isPlayingSpecial = true;
      this.specialAudio = new Audio(audioFilePath);

      this.specialAudio.onended = () => {
        this.isPlayingSpecial = false;
        this.specialAudio = null;
      };

      this.specialAudio.onerror = () => {
        this.isPlayingSpecial = false;
        this.specialAudio = null;
      };

      const playPromise = this.specialAudio.play();
      if (playPromise !== undefined) {
        await playPromise.catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Error playing special audio:', error);
          }
          this.isPlayingSpecial = false;
          this.specialAudio = null;
        });
      }
      return true;
    } catch (error) {
      console.error('Error playing special audio:', error);
      this.isPlayingSpecial = false;
      this.specialAudio = null;
      return false;
    }
  }

  stopSpecialAudio() {
    if (this.specialAudio) {
      try {
        this.specialAudio.pause();
        this.specialAudio.currentTime = 0;
      } catch (e) {
      }
      this.specialAudio = null;
    }
    this.isPlayingSpecial = false;
  }

  fallbackToWebSpeech(text) {
    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('Error with Web Speech API:', error);
      return false;
    }
  }

  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {
      }
    }
    this.stopSpecialAudio();
    speechSynthesis.cancel();
  }

  clearCache() {
    this.audioCache.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.audioCache.clear();
  }
}
