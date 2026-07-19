import { useState } from "react";
import {LoaderPinwheel} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.448 14.013 17.64 11.803 17.64 9.2z" fill="#4285F4" />
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.183l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
    <path d="M3.964 10.708A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.708V4.96H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.04l3.007-2.332z" fill="#FBBC05" />
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.96L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
  </svg>
);

export function Signup() {
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [loading,setLoading]=useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const registerwithemail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const token = await userCred.user.getIdToken();

      await fetch("http://127.0.0.1:8000/user/auth/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.setItem("token", token);
      navigate('/dashboard');

    } catch (error) {
      alert(error.message);
    }
    finally{
      setLoading(false);
    }
  };

  const signupwithGoogle = async () => {
     setLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const token = await result.user.getIdToken();

      await fetch("http://127.0.0.1:8000/user/auth/", {
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
    <div className="signup-page">
      <div className="signup-glow" />

      <div className="signup-card">
        <div className="signup-logo">
          <img src="cornPDF_logo.png" alt="logo" />
        </div>

        <h1 className="signup-title">Create your account</h1>
        <p className="signup-subtitle">
          Start exploring your documents with AI
        </p>

        <button
          className="signup-google-btn"
          type="button"
          onClick={signupwithGoogle}
        >
         <GoogleIcon/> Sign up with Google
        </button>

        <div className="signup-divider">or sign up with email</div>

        <form onSubmit={registerwithemail}>
          <div className="signup-row-2">
            <div className="signup-field">
              <label className="signup-label">First Name</label>
              <input
                className="signup-input"
                type="text"
                name="fname"
                value={form.fname}
                onChange={handleChange}
              />
            </div>

            <div className="signup-field">
              <label className="signup-label">Last Name</label>
              <input
                className="signup-input"
                type="text"
                name="lname"
                value={form.lname}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="signup-field">
            <label className="signup-label">Email</label>
            <input
              className="signup-input"
              type="email"
              name="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="signup-field">
            <label className="signup-label">Password</label>
            <input
              className="signup-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="signup-terms">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label>
              I agree to Terms & Privacy Policy
            </label>
          </div>

          <button className="signup-primary-btn" type="submit" >
            {loading ? <LoaderPinwheel className="loader-spinner"/> : "Create Account" }
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <button
            className="signup-footer-link"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}