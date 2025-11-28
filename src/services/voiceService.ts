// Voice Service for Text-to-Speech functionality
export class VoiceService {
  private static instance: VoiceService;
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isEnabled: boolean = true;

  private constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    
    // Load voices when they become available
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isVoiceEnabled(): boolean {
    return this.isEnabled && 'speechSynthesis' in window;
  }

  public speak(text: string, options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: string;
    lang?: string;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isVoiceEnabled()) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice properties
      utterance.rate = options.rate || 0.9; // Slightly slower for elderly users
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      utterance.lang = options.lang || 'en-US';

      // Select voice
      if (options.voice) {
        const selectedVoice = this.voices.find(voice => 
          voice.name.toLowerCase().includes(options.voice!.toLowerCase())
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        // Prefer female voices for medication reminders (often perceived as more caring)
        const femaleVoice = this.voices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('karen')
        );
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      this.synthesis.speak(utterance);
    });
  }

  public speakMedicationReminder(medicineName: string, dosage: string, time: string): Promise<void> {
    const message = `It's time to take your ${medicineName}. Please take ${dosage} now. The scheduled time is ${time}.`;
    return this.speak(message, { rate: 0.8 }); // Slower rate for clarity
  }

  public speakMissedDoseAlert(medicineName: string, scheduledTime: string): Promise<void> {
    const message = `You missed your ${medicineName} dose that was scheduled for ${scheduledTime}. Please take it now if it's safe to do so, or consult your healthcare provider.`;
    return this.speak(message, { rate: 0.8 });
  }

  public speakRefillReminder(medicineName: string, remainingCount: number): Promise<void> {
    const message = `Your ${medicineName} is running low. You have ${remainingCount} doses remaining. Please contact your pharmacy or doctor for a refill.`;
    return this.speak(message, { rate: 0.8 });
  }

  public speakWelcomeMessage(userName: string): Promise<void> {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 18) greeting = 'Good afternoon';
    else if (hour >= 18) greeting = 'Good evening';

    const message = `${greeting}, ${userName}. Welcome to MedMinder Plus. I'm here to help you manage your medications.`;
    return this.speak(message);
  }

  public speakDoseConfirmation(medicineName: string, action: 'taken' | 'skipped'): Promise<void> {
    const message = action === 'taken' 
      ? `Thank you for confirming that you've taken your ${medicineName}.`
      : `I've noted that you've skipped your ${medicineName} dose.`;
    return this.speak(message);
  }

  public stop(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public pause(): void {
    if (this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  public resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }
}

// Export singleton instance
export const voiceService = VoiceService.getInstance();