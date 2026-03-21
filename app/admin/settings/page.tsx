"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Save, School, Globe, Bell, Shield, Database, CheckCircle, Loader2, BookOpen as BookIcon } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('school_settings')
          .select('*')
          .eq('id', 1)
          .single()
        
        if (error && error.code !== 'PGRST116') throw error
        setSettings(data || {})
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast.error("Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('school_settings')
        .upsert({ ...settings, id: 1, updated_at: new Date().toISOString() })
      
      if (error) throw error
      
      setSaved(true)
      toast.success("Settings updated successfully")
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your school website settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {saved ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Saved!
            </>
          ) : isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="general" className="gap-2">
            <School className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="website" className="gap-2">
            <Globe className="h-4 w-4" />
            Website
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <BookIcon className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Basic details about your school</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="schoolName">School Name</FieldLabel>
                    <Input 
                      id="schoolName" 
                      value={settings?.name || ""} 
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                    <Input 
                      id="fullName" 
                      value={settings?.full_name || ""} 
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="motto">School Motto</FieldLabel>
                  <Input 
                    id="motto" 
                    value={settings?.motto || ""} 
                    onChange={(e) => handleInputChange('motto', e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="address">Address</FieldLabel>
                  <Input 
                    id="address" 
                    value={settings?.address || ""} 
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                    <Input 
                      id="phone" 
                      value={settings?.phone || ""} 
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                    <Input 
                      id="email" 
                      type="email" 
                      value={settings?.email || ""} 
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="principal">Principal Name</FieldLabel>
                  <Input 
                    id="principal" 
                    value={settings?.principal_name || ""} 
                    onChange={(e) => handleInputChange('principal_name', e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>School Statistics</CardTitle>
              <CardDescription>Numbers displayed on the website</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Field>
                    <FieldLabel htmlFor="students">Students</FieldLabel>
                    <Input 
                      id="students" 
                      type="number" 
                      value={settings?.students || 0} 
                      onChange={(e) => handleInputChange('students', parseInt(e.target.value) || 0)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="teachers">Teachers</FieldLabel>
                    <Input 
                      id="teachers" 
                      type="number" 
                      value={settings?.teachers || 0} 
                      onChange={(e) => handleInputChange('teachers', parseInt(e.target.value) || 0)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="achievements">Achievements</FieldLabel>
                    <Input 
                      id="achievements" 
                      type="number" 
                      value={settings?.achievements || 0} 
                      onChange={(e) => handleInputChange('achievements', parseInt(e.target.value) || 0)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="years">Years of Excellence</FieldLabel>
                    <Input 
                      id="years" 
                      type="number" 
                      value={settings?.years_of_excellence || 0} 
                      onChange={(e) => handleInputChange('years_of_excellence', parseInt(e.target.value) || 0)}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Website Settings */}
        <TabsContent value="website">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Search engine optimization settings</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="seoTitle">Meta Title</FieldLabel>
                  <Input 
                    id="seoTitle" 
                    value={settings?.seo_title || ""} 
                    onChange={(e) => handleInputChange('seo_title', e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="seoDescription">Meta Description</FieldLabel>
                  <Textarea 
                    id="seoDescription" 
                    rows={3}
                    value={settings?.seo_description || ""} 
                    onChange={(e) => handleInputChange('seo_description', e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="keywords">Keywords</FieldLabel>
                  <Input 
                    id="keywords" 
                    placeholder="school, education, government school"
                    value={settings?.seo_keywords || ""} 
                    onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>Customize how your website looks</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <div className="flex items-center justify-between">
                    <div>
                      <FieldLabel className="mb-0">Show Statistics on Homepage</FieldLabel>
                      <p className="text-sm text-muted-foreground">Display animated counters</p>
                    </div>
                    <Switch 
                      checked={settings?.show_stats ?? true} 
                      onCheckedChange={(checked) => handleInputChange('show_stats', checked)}
                    />
                  </div>
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <div>
                      <FieldLabel className="mb-0">Enable Animations</FieldLabel>
                      <p className="text-sm text-muted-foreground">Smooth scroll and fade animations</p>
                    </div>
                    <Switch 
                      checked={settings?.enable_animations ?? true} 
                      onCheckedChange={(checked) => handleInputChange('enable_animations', checked)}
                    />
                  </div>
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <div>
                      <FieldLabel className="mb-0">Show Latest News on Homepage</FieldLabel>
                      <p className="text-sm text-muted-foreground">Display recent announcements</p>
                    </div>
                    <Switch 
                      checked={settings?.show_latest_news ?? true} 
                      onCheckedChange={(checked) => handleInputChange('show_latest_news', checked)}
                    />
                  </div>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Settings */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>History & Vision</CardTitle>
              <CardDescription>Manage the school's story and goals</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="history">School History</FieldLabel>
                  <Textarea 
                    id="history" 
                    rows={8}
                    value={settings?.history || ""} 
                    onChange={(e) => handleInputChange('history', e.target.value)}
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="vision">Vision</FieldLabel>
                    <Textarea 
                      id="vision" 
                      rows={4}
                      value={settings?.vision || ""} 
                      onChange={(e) => handleInputChange('vision', e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="mission">Mission</FieldLabel>
                    <Textarea 
                      id="mission" 
                      rows={4}
                      value={settings?.mission || ""} 
                      onChange={(e) => handleInputChange('mission', e.target.value)}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Leadership Message</CardTitle>
              <CardDescription>Message from the Principal</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="principal_message">Principal's Message</FieldLabel>
                  <Textarea 
                    id="principal_message" 
                    rows={10}
                    value={settings?.principal_message || ""} 
                    onChange={(e) => handleInputChange('principal_message', e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure email notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <div className="flex items-center justify-between">
                    <div>
                      <FieldLabel className="mb-0">Contact Form Submissions</FieldLabel>
                      <p className="text-sm text-muted-foreground">Receive email when someone submits the contact form</p>
                    </div>
                    <Switch 
                      checked={settings?.notify_contact ?? true} 
                      onCheckedChange={(checked) => handleInputChange('notify_contact', checked)}
                    />
                  </div>
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <div>
                      <FieldLabel className="mb-0">Weekly Summary</FieldLabel>
                      <p className="text-sm text-muted-foreground">Get a weekly summary of website activity</p>
                    </div>
                    <Switch 
                      checked={settings?.notify_weekly ?? false} 
                      onCheckedChange={(checked) => handleInputChange('notify_weekly', checked)}
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="notifyEmail">Notification Email</FieldLabel>
                  <Input 
                    id="notifyEmail" 
                    type="email" 
                    value={settings?.notify_email || ""} 
                    onChange={(e) => handleInputChange('notify_email', e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Admin Access</CardTitle>
              <CardDescription>Manage admin panel security</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="adminEmail">Admin Email</FieldLabel>
                  <Input id="adminEmail" type="email" defaultValue="admin@dampellamv.lk" disabled />
                </Field>

                <Field>
                  <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
                  <Input id="currentPassword" type="password" placeholder="Enter current password" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                  <Input id="newPassword" type="password" placeholder="Enter new password" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                  <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                </Field>

                <Button variant="outline">Change Password</Button>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Backup and restore your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-muted-foreground">Download all posts, events, and settings</p>
                  </div>
                </div>
                <Button variant="outline">Export</Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Import Data</p>
                    <p className="text-sm text-muted-foreground">Restore from a backup file</p>
                  </div>
                </div>
                <Button variant="outline">Import</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
