export const resetPassword = async (name: string, newPassword: string) => {
  const res = await fetch(
    "https://egwomdsbolseyjjwogeh.supabase.co/functions/v1/reset-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, newPassword }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to reset password");
  }

  return data;
};