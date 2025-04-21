import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Toaster } from "@/components/ui/toaster";

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import Home from "@/pages/Home";
import Booking from "@/pages/Booking";
import Chat from "@/pages/Chat";
import FengShui from "@/pages/FengShui";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/booking" component={Booking} />
      <Route path="/chat" component={Chat} />
      <Route path="/fengshui" component={FengShui} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto pb-16">
            <Router />
          </main>
          <BottomNav />
        </div>
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
