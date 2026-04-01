import { useState } from "react";
import { signIn, signUp } from "@/lib/auth";
import { useLocation } from "wouter";
import { User, Lock } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async () => {
    if (!name || !password) {
      alert("Please fill all fields");
      return;
    }

    const { error } = isLogin
      ? await signIn(name, password)
      : await signUp(name, password);

    if (!error) navigate("/");
    else alert(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-border p-6">
        <h2 className="text-2xl font-display font-bold text-center mb-6">
          {isLogin ? "Employee Login" : "Register Employee"}
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Employee Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl focus:ring-4 focus:ring-primary/10"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold"
          >
            {isLogin ? "Login" : "Register"}
          </button>

          <p
            className="text-sm text-center text-muted-foreground cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "New employee? Register" : "Already have account? Login"}
          </p>
        </div>
      </div>
    </div>
  );
}