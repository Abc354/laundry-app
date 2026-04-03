import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import NewOrder from "@/pages/new-order";
import OrdersList from "@/pages/orders";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Login from "@/pages/login";

// Query client setup with basic defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={NewOrder} />
      <Route path="/orders" component={OrdersList} />
      <Route component={NotFound} />
      <Route path="/manage-items" component={ManageItems} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    // Listen to login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ⏳ Prevent flicker while loading
  if (loading) return null;

  // 🔒 If not logged in → show login page
  if (!user) {
    return <Login />;
  }

  // ✅ If logged in → show your app
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
