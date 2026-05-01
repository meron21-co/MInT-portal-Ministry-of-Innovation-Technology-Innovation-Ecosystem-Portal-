import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../pages/AuthContext";
import "./Auth.css";

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [showTerms, setShowTerms] = useState(false);
const [acceptedTerms, setAcceptedTerms] = useState(false);

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

  nationalId: "",     
  passportNumber: ""
    
  });
  const [errors, setErrors] = useState({});



          // Input change handler
        const handleChange = (e) => {
          const { name, value } = e.target;

          // National ID (numbers only)
          if (name === "nationalId") {
            if (!/^\d*$/.test(value)) return;
          }

          // Passport (letters + numbers)
          if (name === "passportNumber") {
            if (!/^[a-zA-Z0-9]*$/.test(value)) return;
          }

          setFormData((prev) => ({
            ...prev,
            [name]: value,
          }));

          if (name === "role") {
            setRole(value);
          }

          setErrors((prev) => ({ ...prev, [name]: "" }));
        };


          // Step validation
        const validateStep = () => {
  const newErrors = {};
const hasInvalidChars = (value) => /[`"']/g.test(value);

  if (step === 1) {
  // NAME
  if (!formData.name.trim()) {
    newErrors.name = "Full name is required";
  } else if (hasInvalidChars(formData.name)) {
    newErrors.name = "Cannot contain ` \" ' characters";
  }

  // EMAIL
  if (!formData.email.trim()) {
    newErrors.email = "Email is required";
  } else if (hasInvalidChars(formData.email)) {
    newErrors.email = "Cannot contain ` \" ' characters";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = "Invalid email format";
  }

  // PASSWORD
  if (!formData.password) {
    newErrors.password = "Password is required";
  } else if (hasInvalidChars(formData.password)) {
    newErrors.password = "Cannot contain ` \" ' characters";
  } else {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

    if (!strongPasswordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
    }
  }

  // CONFIRM PASSWORD
  if (hasInvalidChars(formData.confirmPassword)) {
    newErrors.confirmPassword = "Cannot contain ` \" ' characters";
  } else if (formData.confirmPassword !== formData.password) {
    newErrors.confirmPassword = "Passwords must match";
  }

  if (!role) newErrors.role = "Please select a role";
}

  else if (step === 2) {

    if (role === "inventor") {
      if (!formData.project.trim())
        newErrors.project = "Project summary is required";

      if (!formData.skills.trim())
        newErrors.skills = "Skills are required";

      if (!formData.experience)
        newErrors.experience = "Experience level required";
    }

    else if (role === "investor") {
      if (!formData.company.trim())
        newErrors.company = "Company name is required";

      if (
        !formData.budget ||
        isNaN(formData.budget) ||
        Number(formData.budget) <= 0
      )
        newErrors.budget = "Budget must be a positive number";
    }

    if (!formData.nationalId.trim() && !formData.passportNumber.trim()) {
      newErrors.nationalId = "Provide National ID or Passport Number";
    }

    if (formData.nationalId && formData.nationalId.length !== 16) {
      newErrors.nationalId = "National ID must be 16 digits";
    }

    if (
      formData.passportNumber &&
      (formData.passportNumber.length < 6 ||
        formData.passportNumber.length > 9)
    ) {
      newErrors.passportNumber = "Passport must be 6–9 characters";
    }
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
}; // ✅ ONLY ONE closing brace here





const nextStep = () => {
  if (validateStep()) {
    if (step === 3) {
      setShowTerms(true); // show popup instead of going next
    } else {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  }
};

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Submit registration
// ------------------- handleSubmit -------------------
const handleSubmit = async (e) => {
  e.preventDefault();

if (!acceptedTerms) {
  alert("You must accept Mint Portal Terms before registering.");
  return;
}
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
           <label>National ID (FAN)</label>
            <input
              name="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
              placeholder="Enter National ID"
              maxLength={16}
              inputMode="numeric"
            />
          {errors.nationalId && <p className="error">{errors.nationalId}</p>}

            <label>Passport Number</label>
              <input
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                placeholder="Enter Passport Number"
                maxLength={9}
              />
           {errors.passportNumber && <p className="error">{errors.passportNumber}</p>}

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


        <div className="terms-final-box">

  <h3>Mint Portal Terms of Use & Intellectual Property Agreement</h3>

  <p>
    By completing your registration on Mint Portal, you acknowledge and agree to the following terms:
  </p>

  <ul>
    <li>
      All projects, ideas, documents, designs, and source materials submitted by inventors remain the sole intellectual property of the original creator.
    </li>

    <li>
      Investors and users are granted access strictly for viewing and evaluation purposes only. Any form of copying, reproduction, modification, distribution, or commercial use without explicit written permission is strictly prohibited.
    </li>

    <li>
      Mint Portal actively protects inventor rights and reserves the right to restrict or permanently terminate accounts found violating these terms.
    </li>

    <li>
      Unauthorized use of any content may result in account suspension, permanent ban, and potential legal action under applicable intellectual property laws.
    </li>

    <li>
      By continuing, you confirm that you understand and agree to respect all intellectual property rights within the Mint Portal ecosystem.
    </li>
  </ul>

  <label>
    <input
      type="checkbox"
      checked={acceptedTerms}
      onChange={(e) => setAcceptedTerms(e.target.checked)}
    />
    I have read and agree to the Mint Portal Terms of Use
  </label>

  {errors.terms && <p className="error">{errors.terms}</p>}

</div>


            <div className="form-nav">
              <button type="button" onClick={prevStep}>Back</button>
         <button type="submit" disabled={!acceptedTerms}>
            Register
          </button>
            </div>
          </>
        )}
      </form>

    
    </div>
  );
}
