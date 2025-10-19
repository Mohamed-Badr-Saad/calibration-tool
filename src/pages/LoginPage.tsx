import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // ⚡ Mock login logic
    if (username === "admin" && password === "admin") {
      navigate("/admin");
    } else if (username==="user" && password==="user") {
      toast("Event has been created.")
      navigate("/user");
    } else {
      toast("Incorrect username or password.")
      setError("Invalid credentials, try again.");
      navigate("/login");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <Card className="w-[350px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Login
              <Toaster />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
