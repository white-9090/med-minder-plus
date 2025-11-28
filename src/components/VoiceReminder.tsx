import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw,
  Settings
} from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { useSettingsStore } from '../stores/settingsStore';
import { cn } from '../lib/utils';

interface VoiceReminderProps {
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  isElderlyMode?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const VoiceReminder: React.FC<VoiceReminderProps> = ({
  medicineName,
  dosage,
  scheduledTime,
  isElderlyMode = false,
  onDismiss,
  className,
}) => {
  const { settings } = useSettingsStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const isVoiceEnabled = settings?.voiceReminders && voiceService.isVoiceEnabled();

  useEffect(() => {
    // Auto-play voice reminder when component mounts (if enabled)
    if (isVoiceEnabled && !hasPlayed) {
      playReminder();
    }
  }, [isVoiceEnabled, hasPlayed]);

  const playReminder = async () => {
    if (!isVoiceEnabled) return;

    try {
      setIsPlaying(true);
      await voiceService.speakMedicationReminder(medicineName, dosage, scheduledTime);
      setHasPlayed(true);
    } catch (error) {
      console.error('Voice reminder failed:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const stopReminder = () => {
    voiceService.stop();
    setIsPlaying(false);
  };

  const repeatReminder = async () => {
    await playReminder();
  };

  if (!isVoiceEnabled) {
    return null;
  }

  return (
    <Card className={cn(
      "border-blue-200 bg-blue-50 shadow-lg",
      className
    )}>
      <CardContent className={cn(
        "p-4",
        isElderlyMode && "p-6"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 bg-blue-100 rounded-full",
              isElderlyMode && "p-3"
            )}>
              <Volume2 className={cn(
                "text-blue-600",
                isElderlyMode ? "h-6 w-6" : "h-5 w-5"
              )} />
            </div>
            
            <div>
              <h3 className={cn(
                "font-semibold text-blue-900",
                isElderlyMode ? "text-xl" : "text-lg"
              )}>
                Voice Reminder Active
              </h3>
              <p className={cn(
                "text-blue-700",
                isElderlyMode ? "text-base" : "text-sm"
              )}>
                {medicineName} - {dosage}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={isPlaying ? "default" : "secondary"}
              className={cn(
                isElderlyMode && "text-base px-3 py-1"
              )}
            >
              {isPlaying ? 'Speaking...' : hasPlayed ? 'Played' : 'Ready'}
            </Badge>
            
            <div className="flex space-x-1">
              {!isPlaying ? (
                <Button
                  variant="outline"
                  size={isElderlyMode ? "default" : "sm"}
                  onClick={playReminder}
                  title="Play voice reminder"
                >
                  <Play className={cn(
                    isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                  )} />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size={isElderlyMode ? "default" : "sm"}
                  onClick={stopReminder}
                  title="Stop voice reminder"
                >
                  <Pause className={cn(
                    isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                  )} />
                </Button>
              )}
              
              <Button
                variant="outline"
                size={isElderlyMode ? "default" : "sm"}
                onClick={repeatReminder}
                disabled={isPlaying}
                title="Repeat reminder"
              >
                <RotateCcw className={cn(
                  isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                )} />
              </Button>
              
              {onDismiss && (
                <Button
                  variant="outline"
                  size={isElderlyMode ? "default" : "sm"}
                  onClick={onDismiss}
                  title="Dismiss reminder"
                >
                  <VolumeX className={cn(
                    isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                  )} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceReminder;