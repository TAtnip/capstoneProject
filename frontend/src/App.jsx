import react from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import BuildMeso from "./pages/BuildMeso";
import SessionBuilder from "./pages/SessionBuilder";
import Visuals from "./pages/Visuals";
import "./styles/App.css";

function Logout() {
  localStorage.clear()
  return (<Navigate to="/login" />)
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (

    <BrowserRouter>
    {/* Navbar added to all pages */}
      <Navbar/>

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} /> 
        <Route path="/register" element={<RegisterAndLogout />} /> 
        <Route path="/buildmeso" element={<ProtectedRoute><BuildMeso /></ProtectedRoute>}/>
        <Route path="/sessionbuilder/:id" element={<ProtectedRoute><SessionBuilder /></ProtectedRoute>}/>
        <Route path="/visuals/" element={<ProtectedRoute><Visuals /></ProtectedRoute>}/>
        <Route path="*" element={<NotFound />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
