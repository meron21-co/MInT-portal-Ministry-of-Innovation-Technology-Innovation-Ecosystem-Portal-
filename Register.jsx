import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    company: "",
    budget: "",
    project: "",
    skills: "",
    experience: "",
    portfolio: "",
    patentStatus: "",
    teamSize: "",
    industryFocus: "",
    investmentType: "",
  });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "role") setRole(value);
  };

  // Validate current step
  const validateStep = () => {
    let newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Email is invalid";
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (formData.confirmPassword !== formData.password)
        newErrors.confirmPassword = "Passwords must match";
      if (!formData.role) newErrors.role = "Please select a role";
    } else if (step === 2) {
      if (role === "inventor") {
        if (!formData.project.trim())
          newErrors.project = "Project summary is required";
        if (!formData.skills.trim()) newErrors.skills = "Skills are required";
        if (!formData.experience) newErrors.experience = "Experience level required";
      } else if (role === "investor") {
        if (!formData.company.trim()) newErrors.company = "Company name required";
        if (!formData.budget) newErrors.budget = "Investment budget required";
        else if (isNaN(formData.budget) || Number(formData.budget) <= 0)
          newErrors.budget = "Budget must be a positive number";
      }
    }
    // You can add step 3 validations if needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Final validation before submit, optionally validate step 3 here

    try {
      const submitData = { ...formData };

      // Remove fields based on role before submit if you want
      if (role === "inventor") {
        delete submitData.company;
        delete submitData.budget;
        delete submitData.industryFocus;
        delete submitData.investmentType;
      } else if (role === "investor") {
        delete submitData.project;
        delete submitData.skills;
        delete submitData.experience;
        delete submitData.portfolio;
        delete submitData.patentStatus;
        delete submitData.teamSize;
      }

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      const result = await res.json();
      if (res.ok) {
        localStorage.setItem("role", role);
        navigate(role === "inventor" ? "/inventor" : "/investor");
      } else {
        alert(result.msg || "Registration failed");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
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
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
            />
            {errors.name && <p className="error">{errors.name}</p>}

            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
            {errors.email && <p className="error">{errors.email}</p>}

            <label>Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
            {errors.password && <p className="error">{errors.password}</p>}

            <label>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
            />
            {errors.confirmPassword && (
              <p className="error">{errors.confirmPassword}</p>
            )}

            <label>Select Role</label>
            <select name="role" value={role} onChange={handleChange}>
              <option value="">Select role</option>
              <option value="inventor">Inventor</option>
              <option value="investor">Investor</option>
            </select>
            {errors.role && <p className="error">{errors.role}</p>}

            <button type="button" onClick={nextStep}>
              Next
            </button>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            {role === "inventor" && (
              <>
                <label>Project Summary</label>
                <textarea
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  placeholder="Describe your project"
                />
                {errors.project && <p className="error">{errors.project}</p>}

                <label>Main Skills</label>
                <input
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., React, Python"
                />
                {errors.skills && <p className="error">{errors.skills}</p>}

                <label>Experience Level</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                >
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
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter company name"
                />
                {errors.company && <p className="error">{errors.company}</p>}

                <label>Investment Budget ($)</label>
                <input
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="Enter budget"
                />
                {errors.budget && <p className="error">{errors.budget}</p>}
              </>
            )}

            <div className="form-nav">
              <button type="button" onClick={prevStep}>
                Back
              </button>
              <button type="button" onClick={nextStep}>
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            {role === "inventor" && (
              <>
                <label>Portfolio / Website</label>
                <input
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="Portfolio link (optional)"
                />

                <label>Patent Status</label>
                <select
                  name="patentStatus"
                  value={formData.patentStatus}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="not-applied">Not Applied</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>

                <label>Team Size</label>
                <input
                  name="teamSize"
                  type="number"
                  value={formData.teamSize}
                  onChange={handleChange}
                  placeholder="Number of team members"
                />
              </>
            )}

            {role === "investor" && (
              <>
                <label>Industry Focus</label>
                <input
                  name="industryFocus"
                  value={formData.industryFocus}
                  onChange={handleChange}
                  placeholder="e.g., Tech, Healthcare"
                />

                <label>Preferred Investment Type</label>
                <select
                  name="investmentType"
                  value={formData.investmentType}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="equity">Equity</option>
                  <option value="loan">Loan</option>
                  <option value="grant">Grant</option>
                </select>
              </>
            )}

            <div className="form-nav">
              <button type="button" onClick={prevStep}>
                Back
              </button>
              <button type="submit">Register</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
