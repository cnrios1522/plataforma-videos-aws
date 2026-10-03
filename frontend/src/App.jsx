import { Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import PlayerPage from "./pages/PlayerPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Routes>

      <Route
        path="/login"
        element={<AuthPage />}
      />

      <Route
        path="/"
        element={
          user
            ? <HomePage />
            : <Navigate to="/login" />
        }
      />

      <Route
        path="/video/:id"
        element={
          user
            ? <PlayerPage />
            : <Navigate to="/login" />
        }
      />

      <Route
        path="/profile"
        element={
          user
            ? <ProfilePage />
            : <Navigate to="/login" />
        }
      />

    </Routes>
  );
}

export default App;