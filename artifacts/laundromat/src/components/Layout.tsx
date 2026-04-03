import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Droplets, PlusCircle, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [role, setRole] = useState("");

 const navItems = [
  { href: "/", label: "New Order", icon: PlusCircle },
  { href: "/orders", label: "All Orders", icon: ListOrdered },
  ...(role === "admin"
    ? [{ href: "/manage-items", label: "Manage Items", icon: ListOrdered }]
    : []),
];

  useEffect(() => {
  const getRole = async () => {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;

    if (!userId) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    setRole(profile?.role || "");
  };

  getRole();
}, []);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Desktop & Top Nav - Mobile */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-border md:h-screen sticky top-0 z-40 flex flex-col shadow-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <Droplets className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">SW Laundry</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">and Dry Cleaners</p>
          </div>
        </div>

        <nav className="flex-1 px-4 pb-4 md:py-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex-shrink-0">
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer font-medium whitespace-nowrap md:whitespace-normal",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 pb-4 mt-auto">
  <button
    onClick={async () => {
      await signOut();
    }}
    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
  >
    Logout
  </button>
</div>    
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
