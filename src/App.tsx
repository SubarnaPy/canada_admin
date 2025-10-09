import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminLayout from "./components/AdminLayout";
import { authHelpers } from "./lib/api";
import Dashboard from "./pages/admin/Dashboard";
import ManageServices from "./pages/admin/ManageServices";
import Payments from "./pages/admin/Payments";
import Refunds from "./pages/admin/Refunds";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Show login page as the root for admin environment */}
          <Route path="/" element={<Auth />} />
          {/* Keep the public index available at /home */}
          {/* <Route path="/home" element={<Index />} /> */}
          <Route
            path="/admin"
            element={authHelpers.isAuthenticated() ? <AdminLayout /> : <Navigate to="/" replace />}
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="payments" element={<Payments />} />
            <Route path="refunds" element={<Refunds />} />
            <Route path="services" element={<ManageServices />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
