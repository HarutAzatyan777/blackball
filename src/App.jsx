import { BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "@fontsource/inter"; // Sans-serif
import "@fontsource/dm-serif-display"; // Serif

import { getRoutes } from "./routes";
import Footer from "./components/Footer/Footer";
import SecretRedirect from "./components/SecretRedirect"; // <-- import

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <SecretRedirect /> {/* <-- add here */}
        <RoutesWithAuth />
      </Router>
      <Footer />
    </AuthProvider>
  );
}

// Wrapper to access context
function RoutesWithAuth() {
  const { user } = useAuth();
  return <Routes>{getRoutes(user)}</Routes>;
}
