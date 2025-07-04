import { useState } from "react";
import { User, Mail, Edit, Save, X, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { updateProfile } from "@/services/api";

const Profile = () => {
  const { user, logout, token } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to update your profile.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);

      // Validate passwords if changing
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast({
            title: "Password Mismatch",
            description: "New passwords do not match.",
            variant: "destructive"
          });
          return;
        }
        if (formData.newPassword.length < 6) {
          toast({
            title: "Password Too Short",
            description: "Password must be at least 6 characters long.",
            variant: "destructive"
          });
          return;
        }
      }

      // Prepare update data
      const updateData: any = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      // Call API to update profile
      await updateProfile(token, updateData);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Refresh the page to get updated user data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400 mt-1">Manage your account information</p>
          </div>
          {!isEditing && (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-white">{user?.name}</CardTitle>
                <CardDescription className="text-gray-300">{user?.email}</CardDescription>
                <Badge className="w-fit mx-auto bg-purple-600">
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Type:</span>
                    <span className="text-white">{user?.role === 'admin' ? 'Premium' : 'Standard'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member Since:</span>
                    <span className="text-white">January 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Personal Information</CardTitle>
                <CardDescription className="text-gray-300">
                  Update your profile information and password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10 bg-slate-800 border-slate-600 text-white disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10 bg-slate-800 border-slate-600 text-white disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password Change Section */}
                {isEditing && (
                  <div className="space-y-4 pt-4 border-t border-slate-600">
                    <h3 className="text-lg font-semibold text-white">Change Password</h3>
                    
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="pl-10 bg-slate-800 border-slate-600 text-white"
                          placeholder="Enter current password"
                        />
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-white">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="pl-10 bg-slate-800 border-slate-600 text-white"
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pl-10 bg-slate-800 border-slate-600 text-white"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="border-slate-600 text-gray-300 hover:bg-slate-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="bg-slate-800/50 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Account Actions</CardTitle>
                <CardDescription className="text-gray-300">
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-medium">Delete Account</h4>
                    <p className="text-gray-400 text-sm">Permanently delete your account and all data</p>
                  </div>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Account deletion will be available soon.",
                      });
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-medium">Sign Out</h4>
                    <p className="text-gray-400 text-sm">Sign out of your account</p>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="border-slate-600 text-gray-300 hover:bg-slate-700"
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile; 