import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Accessibility, 
  Shield,
  Save,
  Volume2,
  Smartphone,
  Moon,
  Sun,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { cn } from '../lib/utils';

const Settings: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { settings, updateSettings, fetchSettings } = useSettingsStore();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [settingsData, setSettingsData] = useState({
    elderlyMode: false,
    darkMode: false,
    notificationsEnabled: true,
    soundEnabled: true,
    voiceReminders: false,
    reminderAdvanceTime: 15,
    timezone: 'America/New_York',
    language: 'en',
    doseMissedThreshold: 30,
    refillReminderDays: 7,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isElderlyMode = settingsData.elderlyMode;

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      await fetchSettings(user.id);
      
      if (settings) {
        setSettingsData({
          elderlyMode: settings.elderlyMode || false,
          darkMode: settings.darkMode || false,
          notificationsEnabled: settings.notificationsEnabled ?? true,
          soundEnabled: settings.soundEnabled ?? true,
          voiceReminders: settings.voiceReminders || false,
          reminderAdvanceTime: settings.reminderAdvanceTime || 15,
          timezone: settings.timezone || 'America/New_York',
          language: settings.language || 'en',
          doseMissedThreshold: settings.doseMissedThreshold || 30,
          refillReminderDays: settings.refillReminderDays || 7,
        });
      }
    };

    loadSettings();
  }, [user, settings, fetchSettings]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettingsData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await updateProfile(profileData.name, profileData.email);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await updateSettings(user.id, settingsData);
      setMessage('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className={cn(
          "font-bold text-gray-900",
          isElderlyMode ? "text-3xl" : "text-2xl"
        )}>
          Settings
        </h1>
        <p className={cn(
          "text-gray-600 mt-1",
          isElderlyMode ? "text-lg" : "text-base"
        )}>
          Customize your MedMinder+ experience
        </p>
      </div>

      {message && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(
            "flex items-center",
            isElderlyMode ? "text-2xl" : "text-xl"
          )}>
            <User className={cn(
              "mr-2",
              isElderlyMode ? "h-7 w-7" : "h-5 w-5"
            )} />
            Profile Information
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className={cn(
                  "mt-1",
                  isElderlyMode && "h-12 text-lg"
                )}
              />
            </div>

            <div>
              <Label htmlFor="email" className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className={cn(
                  "mt-1",
                  isElderlyMode && "h-12 text-lg"
                )}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className={cn(
                isElderlyMode && "h-12 text-lg px-6"
              )}
            >
              <Save className={cn(
                "mr-2",
                isElderlyMode ? "h-6 w-6" : "h-4 w-4"
              )} />
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(
            "flex items-center",
            isElderlyMode ? "text-2xl" : "text-xl"
          )}>
            <Accessibility className={cn(
              "mr-2",
              isElderlyMode ? "h-7 w-7" : "h-5 w-5"
            )} />
            Accessibility
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Elderly-Friendly Mode
              </Label>
              <p className={cn(
                "text-gray-600 mt-1",
                isElderlyMode ? "text-base" : "text-sm"
              )}>
                Larger fonts, simplified interface, and enhanced visibility
              </p>
            </div>
            <Switch
              checked={settingsData.elderlyMode}
              onCheckedChange={(checked) => handleSettingChange('elderlyMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Dark Mode
              </Label>
              <p className={cn(
                "text-gray-600 mt-1",
                isElderlyMode ? "text-base" : "text-sm"
              )}>
                Use dark theme for better visibility in low light
              </p>
            </div>
            <Switch
              checked={settingsData.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Voice Reminders
              </Label>
              <p className={cn(
                "text-gray-600 mt-1",
                isElderlyMode ? "text-base" : "text-sm"
              )}>
                Spoken medication reminders for better accessibility
              </p>
            </div>
            <Switch
              checked={settingsData.voiceReminders}
              onCheckedChange={(checked) => handleSettingChange('voiceReminders', checked)}
            />
          </div>

          <div>
            <Label className={cn(
              "text-base font-medium",
              isElderlyMode && "text-lg"
            )}>
              Language
            </Label>
            <Select
              value={settingsData.language}
              onValueChange={(value) => handleSettingChange('language', value)}
            >
              <SelectTrigger className={cn(
                "mt-1",
                isElderlyMode && "h-12 text-lg"
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(
            "flex items-center",
            isElderlyMode ? "text-2xl" : "text-xl"
          )}>
            <Bell className={cn(
              "mr-2",
              isElderlyMode ? "h-7 w-7" : "h-5 w-5"
            )} />
            Notifications & Reminders
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Enable Notifications
              </Label>
              <p className={cn(
                "text-gray-600 mt-1",
                isElderlyMode ? "text-base" : "text-sm"
              )}>
                Receive medication reminders and alerts
              </p>
            </div>
            <Switch
              checked={settingsData.notificationsEnabled}
              onCheckedChange={(checked) => handleSettingChange('notificationsEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Sound Alerts
              </Label>
              <p className={cn(
                "text-gray-600 mt-1",
                isElderlyMode ? "text-base" : "text-sm"
              )}>
                Play sound when medication reminders appear
              </p>
            </div>
            <Switch
              checked={settingsData.soundEnabled}
              onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
            />
          </div>

          <div>
            <Label className={cn(
              "text-base font-medium",
              isElderlyMode && "text-lg"
            )}>
              Reminder Advance Time (minutes)
            </Label>
            <Select
              value={settingsData.reminderAdvanceTime.toString()}
              onValueChange={(value) => handleSettingChange('reminderAdvanceTime', parseInt(value))}
            >
              <SelectTrigger className={cn(
                "mt-1",
                isElderlyMode && "h-12 text-lg"
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">At scheduled time</SelectItem>
                <SelectItem value="5">5 minutes before</SelectItem>
                <SelectItem value="10">10 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className={cn(
              "text-base font-medium",
              isElderlyMode && "text-lg"
            )}>
              Missed Dose Threshold (minutes)
            </Label>
            <Select
              value={settingsData.doseMissedThreshold.toString()}
              onValueChange={(value) => handleSettingChange('doseMissedThreshold', parseInt(value))}
            >
              <SelectTrigger className={cn(
                "mt-1",
                isElderlyMode && "h-12 text-lg"
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className={cn(
              "text-gray-600 mt-1",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Mark dose as missed after this time
            </p>
          </div>

          <div>
            <Label className={cn(
              "text-base font-medium",
              isElderlyMode && "text-lg"
            )}>
              Refill Reminder (days before running out)
            </Label>
            <Select
              value={settingsData.refillReminderDays.toString()}
              onValueChange={(value) => handleSettingChange('refillReminderDays', parseInt(value))}
            >
              <SelectTrigger className={cn(
                "mt-1",
                isElderlyMode && "h-12 text-lg"
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="7">1 week</SelectItem>
                <SelectItem value="10">10 days</SelectItem>
                <SelectItem value="14">2 weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(
            "flex items-center",
            isElderlyMode ? "text-2xl" : "text-xl"
          )}>
            <SettingsIcon className={cn(
              "mr-2",
              isElderlyMode ? "h-7 w-7" : "h-5 w-5"
            )} />
            System Preferences
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <Label className={cn(
              "text-base font-medium",
              isElderlyMode && "text-lg"
            )}>
              Timezone
            </Label>
            <Select
              value={settingsData.timezone}
              onValueChange={(value) => handleSettingChange('timezone', value)}
            >
              <SelectTrigger className={cn(
                "mt-1",
                isElderlyMode && "h-12 text-lg"
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className={cn(
                isElderlyMode && "h-12 text-lg px-6"
              )}
            >
              <Save className={cn(
                "mr-2",
                isElderlyMode ? "h-6 w-6" : "h-4 w-4"
              )} />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;