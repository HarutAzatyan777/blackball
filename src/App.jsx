import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "@fontsource/inter"; // Sans-serif
import "@fontsource/dm-serif-display"; // Serif
import ReactGA from "react-ga4";
import { animateScroll as scroll } from "react-scroll";
import { getRoutes } from "./routes";
import Footer from "./components/Footer/Footer";
import SecretRedirect from "./components/SecretRedirect";

// ✅ Google Analytics initialization
ReactGA.initialize("G-6PXLPN4NVB", { debug: true });
console.log("✅ Google Analytics initialized with debug mode");

// ✅ Component to handle GA tracking and scroll on route change
function AnalyticsHandler() {
  const location = useLocation();

  useEffect(() => {
    try {
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
      console.log("📊 Pageview tracked:", location.pathname + location.search);

      scroll.scrollToTop();
      console.log("⬆️ Scrolled to top");
    } catch (error) {
      console.error("❌ Analytics tracking failed:", error);
    }
  }, [location]);

  return null;
}

// ✅ Main App
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AnalyticsHandler />
        <SecretRedirect />
        <RoutesWithAuth />
        <Footer />
      </Router>
    </AuthProvider>
  );
}

// ✅ Wrapper for routes based on Auth
function RoutesWithAuth() {
  const { user } = useAuth();
  return <Routes>{getRoutes(user)}</Routes>;
}
