import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the user is an admin by checking the admins collection
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      
      if (adminDoc.exists()) {
        console.log("Admin logged in:", user);
        // Redirect to admin dashboard after login
        navigate("/admin/dashboard", { replace: true });
      } else {
        // If user is not an admin, sign them out and show error
        await auth.signOut();
        setError("Access denied. This portal is for administrators only.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      // Handle different error types
      switch (err.code) {
        case 'auth/user-not-found':
          setError("No administrator account found with this email.");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password. Please try again.");
          break;
        case 'auth/invalid-email':
          setError("Please enter a valid email address.");
          break;
        case 'auth/too-many-requests':
          setError("Too many failed login attempts. Please try again later.");
          break;
        default:
          setError("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div className="logo" onClick={handleBackToHome} style={{ cursor: 'pointer' }}>
              <div className="logo-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="18" y="8" width="4" height="24" fill="#2563eb"/>
                  <rect x="8" y="18" width="24" height="4" fill="#2563eb"/>
                  <circle cx="20" cy="20" r="18" stroke="#2563eb" strokeWidth="2"/>
                </svg>
              </div>
              <h1 className="hospital-name">MediCare Hospital</h1>
            </div>
            
            <button onClick={handleBackToHome} className="back-button" style={{ 
              padding: "8px 16px", 
              borderRadius: "4px", 
              backgroundColor: "#2563eb", 
              color: "white", 
              border: "none", 
              cursor: "pointer", 
              fontWeight: "500",
              marginLeft: "auto"
            }}>
              Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="login-container">
          <div className="login-header">
            <h2>Administrator Portal</h2>
            <p>Secure access to hospital management system</p>
          </div>
          
          <form onSubmit={handleAdminLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your admin email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="login-button" disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1L13 4H7L10 1Z" fill="currentColor"/>
                <rect x="2" y="4" width="16" height="14" rx="1" fill="currentColor"/>
              </svg>
              {loading ? "Signing In..." : "Sign In to Admin Portal"}
            </button>
          </form>
          
          <div className="login-footer">
            <p className="admin-note">
              For administrative access only. If you're a patient, please use the{" "}
              <span 
                className="patient-portal-link" 
                onClick={() => navigate("/login")}
                style={{ cursor: 'pointer', color: '#2563eb', textDecoration: 'underline' }}
              >
                Patient Portal
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;