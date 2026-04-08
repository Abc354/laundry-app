import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { resetPassword } from "@/lib/reset-password";

export default function ManageUsers() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Create Employee
const [createName, setCreateName] = useState("");
const [createPassword, setCreatePassword] = useState("");

// Reset Password
const [resetName, setResetName] = useState("");
const [resetPasswordValue, setResetPasswordValue] = useState("");

  // 🔐 ADMIN PROTECTION
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;


      if (!userId) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profile?.role !== "admin") {
        alert("Access denied");
        navigate("/");
      }
    };

    checkAdmin();
  }, []);

  // 🟢 CREATE EMPLOYEE
  const createEmployee = async () => {
    if (!createName || !createPassword) {
      toast({
        title: "Missing fields",
        description: "Enter name and password",
        variant: "destructive",
      });
      return;
    }

   // const email = `${createName.toLowerCase().replace(/\s/g, "")}@laundry.app`;

    try {
      // 1. Create auth user
    //  const { data, error } = await supabase.auth.signUp({
    //    email,
      //  password: createPassword,
    //  });

      //if (error) throw error;

    //  const userId = data.user?.id;
    const userId = crypto.randomUUID();
//if (!userId) throw new Error("User creation failed");

      // 2. Insert into profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([
          {
            id: userId,
            role: "employee",
          },
        ]);

      if (profileError) throw profileError;

      // 3. Insert into employees table
      const { error: empError } = await supabase
        .from("employees")
        .upsert([
          {
            id: userId,
            name: createName,
          },
        ]);

      if (empError) throw empError;

      toast({
        title: "Success",
        description: "Employee created successfully",
      });

      setCreateName("");
      setCreatePassword("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // 🔁 RESET PASSWORD
  const handleReset = async () => {
    if (!resetName || !resetPasswordValue) {
      toast({
        title: "Missing fields",
        description: "Enter name and password",
        variant: "destructive",
      });
      return;
    }

    try {
      await resetPassword(resetName, resetPasswordValue);

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setResetName("");
      setResetPasswordValue("");
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
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border shadow-sm space-y-6">

        {/* CREATE EMPLOYEE */}
        <div>
          <h2 className="text-xl font-bold mb-4">Create Employee</h2>

          <input
            placeholder="Employee name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            className="w-full border p-2 rounded-xl mb-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            className="w-full border p-2 rounded-xl mb-4"
          />

          <button
            onClick={createEmployee}
            className="w-full bg-primary text-white py-2 rounded-xl hover:bg-primary/90"
          >
            Create Employee
          </button>
        </div>

        {/* RESET PASSWORD */}
        <div>
          <h2 className="text-xl font-bold mb-4">Reset Employee Password</h2>

          <input
            placeholder="Employee name"
            value={resetName}
            onChange={(e) => setResetName(e.target.value)}
            className="w-full border p-2 rounded-xl mb-3"
          />

          <input
            type="password"
            placeholder="New password"
            value={resetPasswordValue}
            onChange={(e) => setResetPasswordValue(e.target.value)}
            className="w-full border p-2 rounded-xl mb-4"
          />

          <button
            onClick={handleReset}
            className="w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600"
          >
            Reset Password
          </button>
        </div>

      </div>
    </Layout>
  );
}