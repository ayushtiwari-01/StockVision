import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Calendar, Shield, Settings, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth"; // Added this import

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { user, signOut } = useAuth(); // Added this hook
  const { toast } = useToast();

  // Dynamic user data from Supabase instead of hardcoded
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    joinDate: "",
    avatar: "",
  });

  // Load user data from Supabase when component mounts
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
        email: user.email || "",
        joinDate: user.created_at?.split('T')[0] || "2024-01-01",
        avatar: user.user_metadata?.avatar_url || "",
      });
    }
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully",
    });
  };

  // Updated logout function with real Supabase authentication
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      // User will be automatically redirected to landing page by ProtectedRoute
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    }
  };

  // Mock activity data (same as before)
  const recentActivity = [
    { action: "Created prediction for AAPL", date: "2024-01-15", type: "prediction" },
    { action: "Ran Momentum Strategy backtest on TSLA", date: "2024-01-14", type: "backtest" },
    { action: "Updated profile information", date: "2024-01-13", type: "profile" },
    { action: "Downloaded MSFT analysis report", date: "2024-01-12", type: "download" },
  ];

  const stats = {
    totalPredictions: 24,
    totalBacktests: 12,
    avgAccuracy: 78.5,
    bestReturn: 24.7,
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and view your activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </Button>
              </div>
              <CardDescription>Update your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userData.avatar} />
                  <AvatarFallback className="text-lg">
                    {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{userData.name}</h3>
                  <p className="text-muted-foreground">{userData.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.email_confirmed_at ? "Verified Member" : "Unverified"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(userData.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-3 last:pb-0 border-b border-border last:border-b-0">
                    <div className="mt-1">
                      {activity.type === "prediction" && <User className="w-4 h-4 text-primary" />}
                      {activity.type === "backtest" && <Settings className="w-4 h-4 text-success" />}
                      {activity.type === "profile" && <User className="w-4 h-4 text-muted-foreground" />}
                      {activity.type === "download" && <Mail className="w-4 h-4 text-accent" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics & Actions */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Your Statistics</CardTitle>
              <CardDescription>Overview of your StockVision activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Predictions</span>
                <span className="font-semibold">{stats.totalPredictions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Backtests</span>
                <span className="font-semibold">{stats.totalBacktests}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg. Accuracy</span>
                <span className="font-semibold financial-gain">{stats.avgAccuracy}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best Return</span>
                <span className="font-semibold financial-gain">+{stats.bestReturn}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Account Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Privacy & Security
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Notification Settings
              </Button>
              <Separator />
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Info */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <Badge variant="default" className="mb-2">Premium Plan</Badge>
                <p className="text-sm text-muted-foreground">
                  Unlimited predictions and backtests
                </p>
                <p className="text-xs text-muted-foreground">
                  Renews on February 1, 2024
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
