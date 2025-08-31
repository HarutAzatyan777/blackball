// components/SecretRedirect.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SecretRedirect() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [shiftPressed, setShiftPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Shift") {
        setShiftPressed(true);
      }
      if (shiftPressed && e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        setTyped((prev) => (prev + e.key).slice(-10)); // պահում ենք վերջին 10 սիմվոլը
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "Shift") {
        setShiftPressed(false);
        setTyped(""); // Reset when Shift released
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [shiftPressed]);

  useEffect(() => {
    if (typed.toLowerCase() === "admin") {
      navigate("/admin");
    }
  }, [typed, navigate]);

  return null; // Invisible component
}
