import { useState } from "react";
import "./Login.css";
import { LoaderPinwheel } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { buildApiUrl } from "../../lib/api";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.448 14.013 17.64 11.803 17.64 9.2z" fill="#4285F4" />
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.183l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
    <path d="M3.964 10.708A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.708V4.96H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.04l3.007-2.332z" fill="#FBBC05" />
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.96L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
  </svg>
);

export function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading,setLoading]=useState(false);

  const navigate = useNavigate();
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const loginwithemail = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      

      const token = await userCred.user.getIdToken();
      
      await fetch(buildApiUrl("/user/auth/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.setItem("token", token);

      navigate('/dashboard'); // optional redirect
    } catch (error) {
      alert(error.message);
    }
    finally
    {
      setLoading(false);
    }
  };

  const loginwithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const token = await result.user.getIdToken();

      await fetch(buildApiUrl("/user/auth/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.setItem("token", token);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    }
    finally{
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-glow" />

      <div className="login-card">
        <div className="login-logo">
          <img src="cornPDF_logo.png" alt="logo" />
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">
          Log in to your account to continue
        </p>

        <button
          className="login-google-btn"
          type="button"
          onClick={loginwithGoogle}
          disabled={loading}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="login-divider">or sign in with email</div>

        <form onSubmit={loginwithemail}>
          <div className="login-field">
            <label className="login-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="login-input"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="login-input"
              type="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="login-meta-row">
            <button type="button" className="login-forgot">
              Forgot password?
            </button>
          </div>

          <button className="login-primary-btn" type="submit" disabled={loading}>
            {loading? <LoaderPinwheel className="loader-spinner"/> : "Log In"}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account?{" "}
          <button
            className="login-footer-link"
            onClick={() => navigate('/signup')}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}