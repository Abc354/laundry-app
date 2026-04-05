import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

export default function UpdatePassword() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");

  const handleUpdate = async () => {
    if (!password) {
      alert("Enter new password");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully");
      navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-80 space-y-4">
        <h2 className="text-xl font-bold text-center">Set New Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded-xl"
        />

        <button
          onClick={handleUpdate}
          className="w-full bg-primary text-white py-2 rounded-xl"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}