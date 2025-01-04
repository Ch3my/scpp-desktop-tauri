import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { SidebarProvider, } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import Login from "./screens/Login";
import Config from "./screens/Config";
import { useAppState } from "./AppState";
import Dashboard from "./screens/Dashboard";
import { Htas } from "./screens/Htas";
import Assets from "./screens/Assets";
import "./App.css";
import "./Custom.css";

const RootComponent = () => {
  const { isLoggedIn } = useAppState();

  return (
    <SidebarProvider defaultOpen={false}>
      {isLoggedIn && <AppSidebar />}
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/config" element={<Config />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/htas" element={<Htas />} />
          <Route path="/assets" element={<Assets />} />
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);

// ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
//   <React.StrictMode>
//     <SidebarProvider defaultOpen={false}>
//       {isLoggedIn && <AppSidebar />}
//       {isLoggedIn && <SidebarTrigger />}
//       <BrowserRouter>
//         <Toaster />
//         <Routes>
//           <Route path="/" element={<App />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/config" element={<Config />} />
//         </Routes>
//       </BrowserRouter>
//     </SidebarProvider>
//   </React.StrictMode>,
// );
