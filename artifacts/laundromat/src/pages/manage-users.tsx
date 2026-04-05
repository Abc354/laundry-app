import { useState } from "react";
import { Layout } from "@/components/Layout";
import { resetPassword } from "@/lib/reset-password";
import { useToast } from "@/hooks/use-toast";

export default function ManageUsers() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleReset = async () => {
    if (!name || !password) {
      toast({
        title: "Missing fields",
        description: "Enter name and password",
        variant: "destructive",
      });
      return;
    }

    try {
      await resetPassword(name, password);

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setName("");
      setPassword("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-xl font-bold mb-4">Reset Employee Password</h2>

        <input
          placeholder="Employee name (e.g. purva)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded-xl mb-3"
        />

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded-xl mb-4"
        />

        <button
          onClick={handleReset}
          className="w-full bg-primary text-white py-2 rounded-xl"
        >
          Reset Password
        </button>
      </div>
    </Layout>
  );
}