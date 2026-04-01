import { supabase } from "./supabase";

const formatEmail = (name: string) => `${name}@laundry.app`;

// REGISTER
export const signUp = async (name: string, password: string) => {
  const email = formatEmail(name);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (!error) {
    await supabase.from("employees").insert([{ name }]);
  }

  return { data, error };
};

// LOGIN
export const signIn = async (name: string, password: string) => {
  const email = formatEmail(name);

  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

// LOGOUT
export const signOut = async () => {
  return await supabase.auth.signOut();
};