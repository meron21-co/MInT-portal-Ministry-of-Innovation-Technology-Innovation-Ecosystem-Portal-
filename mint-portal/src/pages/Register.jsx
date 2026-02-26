import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../pages/AuthContext";
import "./Auth.css";

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    project: "",
    skills: "",
    experience: "",
    company: "",
    budget: "",
    industryFocus: "",
    investmentType: "",
    portfolio: "",
    patentStatus: "",
    teamSize: "",
  });
  const [errors, setErrors] = useState({});

  // Input change handler
 // ------------------- handleChange -------------------
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
  setErrors((prev) => ({ ...prev, [name]: "" }));

  // Keep role in sync with formData
  if (name === "role") {
    setRole(value);
    setFormData((prev) => ({ ...prev, role: value }));
  }
};


  // Step validation
  const validateStep = () => {
    const newErrors = {};
   if (step === 1) {
  if (!formData.name.trim()) newErrors.name = "Full name is required";
  if (!formData.email.trim()) newErrors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

  if (!formData.password) {
    newErrors.password = "Password is required";
  } else {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    if (!strongPasswordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
    }
  }

  if (formData.confirmPassword !== formData.password)
    newErrors.confirmPassword = "Passwords must match";

  if (!role) newErrors.role = "Please select a role";
}
    
    else if (step === 2) {
      if (role === "inventor") {
        if (!formData.project.trim()) newErrors.project = "Project summary is required";
        if (!formData.skills.trim()) newErrors.skills = "Skills are required";
        if (!formData.experience) newErrors.experience = "Experience level required";
      } else if (role === "investor") {
        if (!formData.company.trim()) newErrors.company = "Company name is required";
        if (!formData.budget || isNaN(formData.budget) || Number(formData.budget) <= 0)
          newErrors.budget = "Budget must be a positive number";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Submit registration
// ------------------- handleSubmit -------------------
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateStep()) return;

  try {
    // Prepare data
    const submitData = { ...formData, role };
    delete submitData.confirmPassword;

    // Convert numbers properly
    if (submitData.budget) submitData.budget = Number(submitData.budget);
    if (submitData.teamSize) submitData.teamSize = Number(submitData.teamSize);

    // Remove empty optional fields
    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === "" || submitData[key] === null) {
        delete submitData[key];
      }
    });

    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    });

    const result = await res.json();

    if (res.ok && result.user && result.token) {
      login(result.user, result.token);

      if (result.user.role === "inventor") navigate("/inventor");
      else if (result.user.role === "investor") navigate("/investor");
      else if (result.user.role === "admin") navigate("/admin");
      else navigate("/");
    } else {
      alert(result.message || "Registration failed.");
    }
  } catch (error) {
    console.error("Registration error:", error);
    alert(error.message || "Something went wrong. Please try again.");
  }
};



  return (
    <div className="register-container">
      <div className="progress-bar">
        <div style={{ width: `${(step / 3) * 100}%` }}></div>
      </div>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        {/* Step 1 */}
        {step === 1 && (
          <>
            <label>Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" />
            {errors.name && <p className="error">{errors.name}</p>}

            <label>Email</label>
            <input name="email" value={formData.email} onChange={handleChange} placeholder="Enter email" />
            {errors.email && <p className="error">{errors.email}</p>}

            <label>Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter password" />
            {errors.password && <p className="error">{errors.password}</p>}

            <label>Confirm Password</label>
            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

            <label>Select Role</label>
            <select name="role" value={role} onChange={handleChange}>
              <option value="">Select role</option>
              <option value="inventor">Inventor</option>
              <option value="investor">Investor</option>
            </select>
            {errors.role && <p className="error">{errors.role}</p>}

            <button type="button" onClick={nextStep}>Next</button>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            {role === "inventor" && (
              <>
                <label>Project Summary</label>
                <textarea name="project" value={formData.project} onChange={handleChange} placeholder="Describe your project"></textarea>
                {errors.project && <p className="error">{errors.project}</p>}

                <label>Main Skills</label>
                <input name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g., React, Python" />
                {errors.skills && <p className="error">{errors.skills}</p>}

                <label>Experience Level</label>
                <select name="experience" value={formData.experience} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
                {errors.experience && <p className="error">{errors.experience}</p>}
              </>
            )}

            {role === "investor" && (
              <>
                <label>Company Name</label>
                <input name="company" value={formData.company} onChange={handleChange} placeholder="Enter company name" />
                {errors.company && <p className="error">{errors.company}</p>}

                <label>Investment Budget</label>
                <input name="budget" type="number" value={formData.budget} onChange={handleChange} placeholder="Enter budget in $" />
                {errors.budget && <p className="error">{errors.budget}</p>}
              </>
            )}

            <div className="form-nav">
              <button type="button" onClick={prevStep}>Back</button>
              <button type="button" onClick={nextStep}>Next</button>
            </div>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            {role === "inventor" && (
              <>
                <label>Portfolio / Website</label>
                <input name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="Portfolio link (optional)" />

                <label>Patent Status</label>
                <select name="patentStatus" value={formData.patentStatus} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="not-applied">Not Applied</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>

                <label>Team Size</label>
                <input name="teamSize" type="number" value={formData.teamSize} onChange={handleChange} placeholder="Number of team members" />
              </>
            )}

            {role === "investor" && (
              <>
                <label>Industry Focus</label>
                <input name="industryFocus" value={formData.industryFocus} onChange={handleChange} placeholder="e.g., Tech, Healthcare" />

                <label>Preferred Investment Type</label>
                <select name="investmentType" value={formData.investmentType} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="equity">Equity</option>
                  <option value="loan">Loan</option>
                  <option value="grant">Grant</option>
                </select>
              </>
            )}

            <div className="form-nav">
              <button type="button" onClick={prevStep}>Back</button>
              <button type="submit">Register</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
