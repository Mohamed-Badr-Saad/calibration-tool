import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Eye, EyeOff, Building2, Lock, Mail, User, Shield } from "lucide-react";
import { useAuth } from "@/CustomHooks/useAuth";

export default function AuthPage() {
  const { login, signup, isLoading } = useAuth();
  const navigate = useNavigate(); // 🔥 ADDED: Navigation hook

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    jobTitle: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      // Handle Login
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success(result.message);

        // 🔥 FIXED: Proper navigation based on user role instead of reload
        setTimeout(() => {
          // Navigate will be handled by the App routing automatically
          // But we can force a navigation to make sure
          navigate("/user", { replace: true });
        }, 1000);
      } else {
        toast.error(result.message);
      }
    } else {
      // Handle Signup
      if (!formData.name.trim()) {
        toast.error("Please enter your full name");
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      const result = await signup(formData);
      if (result.success) {
        toast.success(result.message);
        setIsLogin(true);
        setFormData({ ...formData, password: "" });
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: "", password: "", name: "", jobTitle: "" });
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Company Header */}
        <div className="text-center space-y-2">
          <div className="flex flex-col items-center justify-center space-x-2">
            {/* <Building2 className="h-8 w-8 text-blue-600" /> */}
                   <div>
                <img
                  src={"/Rashid-icon.ico"}
                  alt="Rashid Logo"
                  className="w-[100px]"
                />
              </div>
            <h1 className="text-2xl font-bold text-gray-900">RASHPETCO</h1>
          </div>
          <p className="text-gray-600">Instrument Management System</p>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              {isLogin ? (
                <Shield className="h-12 w-12 text-blue-600" />
              ) : (
                <User className="h-12 w-12 text-green-600" />
              )}
            </div>
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <p className="text-center text-gray-600">
              {isLogin
                ? "Sign in to your account to continue"
                : "Join RASHPETCO's instrument management platform"}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Signup Only) */}
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required={!isLogin}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {/* Job Title Dropdown (Signup Only) */}
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <select
                      id="jobTitle"
                      name="jobTitle"
                      required={!isLogin}
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
                    >
                      <option value="" disabled>
                        Select your job title
                      </option>
                      <option value="engineer">Engineer</option>
                      <option value="technician">Technician</option>
                    </select>
                  </div>
                </>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="pl-10"
                  />
                </div>
                {formData.email === "Mohamed.Ali@RASHPETCO.com" && (
                  <Badge className="bg-amber-100 text-amber-800">
                    Super Admin Account
                  </Badge>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      isLogin
                        ? "Enter your password"
                        : "Create a password (min. 6 chars)"
                    }
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    style={{ backgroundColor: "#eaf1ff" }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-blue-600 hover:text-blue-500"
                style={{ backgroundColor: "#eaf1ff" }}
                disabled={isLoading}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>

            {/* Super Admin Info */}
            {/* {isLogin && (
              <div className="mt-4 text-xs text-center text-gray-500">
                💡 Super Admin: Mohamed.Ali@RASHPETCO.com
              </div>
            )} */}
          </CardContent>
        </Card>

        <Toaster />
      </div>
    </div>
  );
}
