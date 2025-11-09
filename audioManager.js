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

    try {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }

      this.currentAudio = new Audio(audioUrl);
      await this.currentAudio.play();
      return true;
    } catch (error) {
      console.error('Error playing audio:', error);
      return false;
    }
  }

  async speak(text, personality) {
    if (!text) return false;

    const audioUrl = await this.generateSpeech(text, personality);

    if (audioUrl) {
      return await this.playAudio(audioUrl);
    } else {
      return this.fallbackToWebSpeech(text);
    }
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
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
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
