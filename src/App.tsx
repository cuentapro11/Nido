import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SupabaseProvider } from "./contexts/SupabaseContext";
import { ToastProvider } from "./components/Toast";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Presence from "./pages/Presence";
import ChildrenList from "./pages/ChildrenList";
import ChatList from "./pages/ChatList";
import Chat from "./pages/Chat";
import ParentChat from "./pages/ParentChat";
import CalendarPage from "./pages/CalendarPage";
import Configuracion from "./pages/Configuracion";
import Solicitudes from "./pages/Solicitudes";
import ChildProfile from "./pages/ChildProfile";
import ParentSelect from "./pages/ParentSelect";
import ParentHome from "./pages/ParentHome";
import ParentGallery from "./pages/ParentGallery";
import ParentProfile from "./pages/ParentProfile";
import NotFound from "./pages/NotFound";
import RegisterDaycare from "./pages/RegisterDaycare";
import RegisterParent from "./pages/RegisterParent";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import Caregivers from "./pages/Caregivers";
import ParentOnboarding from "./pages/ParentOnboarding";
import Aulas from "./pages/Aulas";
import ReporteDiario from "./pages/ReporteDiario";
import ConfiguracionGeneral from "./pages/ConfiguracionGeneral";

const App = () => (
  <AuthProvider>
    <SupabaseProvider>
      <AppProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth & registration */}
              <Route path="/" element={<Login />} />
              <Route path="/register-daycare" element={<RegisterDaycare />} />
              <Route path="/register-parent" element={<RegisterParent />} />
              <Route path="/parent-onboarding" element={<ParentOnboarding />} />
              {/* Admin / cuido */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/presence" element={<Presence />} />
              <Route path="/children" element={<ChildrenList />} />
              <Route path="/chat" element={<ChatList />} />
              <Route path="/chat/:parentId" element={<Chat />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="/solicitudes" element={<Solicitudes />} />
              <Route path="/child/:childId" element={<ChildProfile />} />
              <Route path="/caregivers" element={<Caregivers />} />
              <Route path="/aulas" element={<Aulas />} />
              <Route path="/reporte-diario" element={<ReporteDiario />} />
              <Route path="/configuracion-general" element={<ConfiguracionGeneral />} />
              {/* Caregiver */}
              <Route path="/caregiver" element={<CaregiverDashboard />} />
              {/* Parent */}
              <Route path="/parent-select" element={<ParentSelect />} />
              <Route path="/parent-home" element={<ParentHome />} />
              <Route path="/parent-chat" element={<ParentChat />} />
              <Route path="/parent-gallery" element={<ParentGallery />} />
              <Route path="/parent-profile" element={<ParentProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </SupabaseProvider>
  </AuthProvider>
);

export default App;
