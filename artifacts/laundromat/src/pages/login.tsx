import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

export default function Login() {
  const [, navigate] = useLocation();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);

  // 🔐 LOGIN / REGISTER
  const handleSubmit = async () => {
    if (!name || !password) {
      alert("Please fill all fields");
      return;
    }

    const email = `${name.toLowerCase()}@laundry.app`;

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
    } else {
      navigate("/");
    }
  };

  // 🔁 RESET PASSWORD
  const handleResetPassword = async () => {
    if (!name) {
      alert("Enter your username");
      return;
    }

    const email = `${name.toLowerCase()}@laundry.app`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
     redirectTo: "https://swlaundry.vercel.app/update-password",
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password reset link sent");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-80 space-y-4">

        {isForgot ? (
          <>
            <h2 className="text-xl font-bold text-center">Reset Password</h2>

            <input
              type="text"
              placeholder="Enter username (e.g. purva)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded-xl"
            />

            <button
              onClick={handleResetPassword}
              className="w-full bg-primary text-white py-2 rounded-xl"
            >
              Send Reset Link
            </button>

            <p
              onClick={() => setIsForgot(false)}
              className="text-sm text-primary text-center cursor-pointer"
            >
              Back to Login
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-center">
              {isLogin ? "Login" : "Register"}
            </h2>

            <input
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded-xl"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded-xl"
            />

            <button
              onClick={handleSubmit}
              className="w-full bg-primary text-white py-2 rounded-xl"
            >
              {isLogin ? "Login" : "Register"}
            </button>

            <p
              onClick={() => setIsForgot(true)}
              className="text-sm text-primary text-right cursor-pointer"
            >
              Forgot Password?
            </p>

            <p
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-center text-muted-foreground cursor-pointer"
            >
              {isLogin ? "Create account" : "Already have account?"}
            </p>
          </>
        )}

      </div>
    </div>
  );
}