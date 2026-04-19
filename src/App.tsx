import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import { DashboardLayout } from "./components/layout/DashboardLayout";

// Public pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterSociety from "./pages/RegisterSociety";
import VisitorEntry from "./pages/VisitorEntry";
import Join from "./pages/Join";
import DeleteAccount from "./pages/DeleteAccount";
import NotFound from "./pages/NotFound";

// Dashboard pages
import Home from "./pages/dashboard/Home";
import Maintenance from "./pages/dashboard/maintenance/Maintenance";
import MaintenanceCategory from "./pages/dashboard/maintenance/MaintenanceCategory";
import Announcements from "./pages/dashboard/Announcements";
import Visitors from "./pages/dashboard/Visitors";
import Parking from "./pages/dashboard/Parking";
import Chat from "./pages/dashboard/Chat";
import Complaints from "./pages/dashboard/Complaints";
import Members from "./pages/dashboard/Members";
import Expenses from "./pages/dashboard/Expenses";
import Helpline from "./pages/dashboard/Helpline";
import Newspaper from "./pages/dashboard/Newspaper";
import SocietyRules from "./pages/dashboard/SocietyRules";
import Subscribe from "./pages/dashboard/Subscribe";
import Profile from "./pages/dashboard/Profile";
import Refer from "./pages/dashboard/Refer";
import JoinRequests from "./pages/dashboard/JoinRequests";

// Admin pages
import AdminPanel from "./pages/dashboard/admin/AdminPanel";
import AdminBuildings from "./pages/dashboard/admin/AdminBuildings";
import AdminUsers from "./pages/dashboard/admin/AdminUsers";
import AdminSubscriptions from "./pages/dashboard/admin/AdminSubscriptions";
import ActivityLogs from "./pages/dashboard/admin/ActivityLogs";
import Promos from "./pages/dashboard/admin/Promos";
import Inquiries from "./pages/dashboard/admin/Inquiries";
import BankDetails from "./pages/dashboard/admin/BankDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-society" element={<RegisterSociety />} />
            <Route path="/entry/:building_id" element={<VisitorEntry />} />
            <Route path="/join" element={<Join />} />
            <Route path="/delete-account" element={<DeleteAccount />} />

            {/* Protected dashboard routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Home />} />
                <Route path="/dashboard/maintenance" element={<Maintenance />} />
                <Route path="/dashboard/maintenance/:category" element={<MaintenanceCategory />} />
                <Route path="/dashboard/announcements" element={<Announcements />} />
                <Route path="/dashboard/visitors" element={<Visitors />} />
                <Route path="/dashboard/parking" element={<Parking />} />
                <Route path="/dashboard/complaints" element={<Complaints />} />
                <Route path="/dashboard/members" element={<Members />} />
                <Route path="/dashboard/expenses" element={<Expenses />} />
                <Route path="/dashboard/helpline" element={<Helpline />} />
                <Route path="/dashboard/newspaper" element={<Newspaper />} />
                <Route path="/dashboard/society-rules" element={<SocietyRules />} />
                <Route path="/dashboard/profile" element={<Profile />} />
                <Route path="/dashboard/refer" element={<Refer />} />
                <Route path="/dashboard/join-requests" element={<JoinRequests />} />

                {/* Not for admin */}
                <Route element={<RoleGuard allowedRoles={['user', 'pramukh', 'watchman']} />}>
                  <Route path="/dashboard/chat" element={<Chat />} />
                  <Route path="/dashboard/subscribe" element={<Subscribe />} />
                </Route>

                {/* Pramukh only */}
                <Route element={<RoleGuard allowedRoles={['pramukh']} />}>
                  <Route path="/dashboard/join-requests" element={<JoinRequests />} />
                </Route>

                {/* Admin only */}
                <Route element={<RoleGuard allowedRoles={['admin']} />}>
                  <Route path="/dashboard/admin" element={<AdminPanel />} />
                  <Route path="/dashboard/admin/buildings" element={<AdminBuildings />} />
                  <Route path="/dashboard/admin/users" element={<AdminUsers />} />
                  <Route path="/dashboard/admin/subscriptions" element={<AdminSubscriptions />} />
                  <Route path="/dashboard/admin/activity-logs" element={<ActivityLogs />} />
                  <Route path="/dashboard/admin/promos" element={<Promos />} />
                  <Route path="/dashboard/admin/inquiries" element={<Inquiries />} />
                  <Route path="/dashboard/admin/bank-details" element={<BankDetails />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
