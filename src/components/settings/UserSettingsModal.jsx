
import React, { useState, useEffect, useCallback } from "react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, Save, User as UserIcon } from "lucide-react";
import { User as UserEntity } from "@/entities/User";

export default function UserSettingsModal() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    notifications: {
      email_updates: true,
      story_completion: true,
      weekly_digest: false,
    },
    preferences: {
      default_age_group: "6-8",
      default_focus_topic: "morals",
      default_illustration_style: "cartoon",
      default_page_length: 6,
      auto_save: true,
    },
    profile: {
      bio: "",
      preferred_name: "",
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const loadUserData = useCallback(async () => {
    try {
      const currentUser = await UserEntity.me();
      setUser(currentUser);
      if (currentUser.settings) {
        setSettings(prevSettings => ({ ...prevSettings, ...currentUser.settings }));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []); // Empty dependency array because UserEntity.me and setSettings are stable.

  useEffect(() => {
    loadUserData();
  }, [loadUserData]); // Depend on loadUserData to satisfy exhaustive-deps lint rule

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await UserEntity.updateMyUserData({
        settings: settings,
        preferred_name: settings.profile.preferred_name,
        bio: settings.profile.bio,
      });
      // Show success message
    } catch (error) {
      console.error("Error saving settings:", error);
    }
    setIsSaving(false);
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  if (!user) return null;

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Account Settings
        </DialogTitle>
        <DialogDescription>
          Manage your account preferences and settings
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={user.full_name}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="preferred_name">Preferred Name</Label>
                  <Input
                    id="preferred_name"
                    placeholder="How would you like to be addressed?"
                    value={settings.profile.preferred_name}
                    onChange={(e) => updateSetting('profile', 'preferred_name', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself..."
                    value={settings.profile.bio}
                    onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
                    className="h-20"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">Account Status</p>
                    <p className="text-sm text-blue-700">Member since {new Date(user.created_date).toLocaleDateString()}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Default Story Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Default Age Group</Label>
                    <Select 
                      value={settings.preferences.default_age_group}
                      onValueChange={(value) => updateSetting('preferences', 'default_age_group', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="6-8">6-8 years</SelectItem>
                        <SelectItem value="9-12">9-12 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Default Focus Topic</Label>
                    <Select 
                      value={settings.preferences.default_focus_topic}
                      onValueChange={(value) => updateSetting('preferences', 'default_focus_topic', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morals">Morals & Values</SelectItem>
                        <SelectItem value="finance">Financial Literacy</SelectItem>
                        <SelectItem value="mental_health">Mental Health</SelectItem>
                        <SelectItem value="career_awareness">Career Awareness</SelectItem>
                        <SelectItem value="communication_skills">Communication</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Default Illustration Style</Label>
                    <Select 
                      value={settings.preferences.default_illustration_style}
                      onValueChange={(value) => updateSetting('preferences', 'default_illustration_style', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cartoon">Cartoon</SelectItem>
                        <SelectItem value="watercolor">Watercolor</SelectItem>
                        <SelectItem value="vector">Vector</SelectItem>
                        <SelectItem value="realistic">Realistic</SelectItem>
                        <SelectItem value="storybook">Storybook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Default Page Length</Label>
                    <Select 
                      value={settings.preferences.default_page_length.toString()}
                      onValueChange={(value) => updateSetting('preferences', 'default_page_length', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 pages</SelectItem>
                        <SelectItem value="8">8 pages</SelectItem>
                        <SelectItem value="10">10 pages</SelectItem>
                        <SelectItem value="12">12 pages</SelectItem>
                        <SelectItem value="16">16 pages</SelectItem>
                        <SelectItem value="20">20 pages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Auto-save</p>
                    <p className="text-sm text-gray-600">Automatically save changes as you work</p>
                  </div>
                  <Switch
                    checked={settings.preferences.auto_save}
                    onCheckedChange={(value) => updateSetting('preferences', 'auto_save', value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Updates</p>
                      <p className="text-sm text-gray-600">Get notified about new features and updates</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email_updates}
                      onCheckedChange={(value) => updateSetting('notifications', 'email_updates', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Story Completion</p>
                      <p className="text-sm text-gray-600">Notifications when your stories are ready</p>
                    </div>
                    <Switch
                      checked={settings.notifications.story_completion}
                      onCheckedChange={(value) => updateSetting('notifications', 'story_completion', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Weekly Digest</p>
                      <p className="text-sm text-gray-600">Weekly summary of your creative activity</p>
                    </div>
                    <Switch
                      checked={settings.notifications.weekly_digest}
                      onCheckedChange={(value) => updateSetting('notifications', 'weekly_digest', value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
            {isSaving ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
