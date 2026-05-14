import React, { useState, useEffect } from "react";
import { 
  FaStar, 
  FaRegStar, 
  FaDollarSign, 
  FaTimes, 
  FaShoppingCart, 
  FaTrashAlt, 
  FaInfoCircle, 
  FaWallet 
} from "react-icons/fa";
import "./Dashboard.css";
import Swal from "sweetalert2";


function InvestorDashboard() {
    const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };
  const [projects, setProjects] = useState([]);
 const [cart, setCart] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [supportAmounts, setSupportAmounts] = useState({});
  const [TotalSupport, setTotalSupport] = useState({});
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
const userId = user?._id;


// 1. Define the fetch function near the top
const fetchProjects = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    
    setProjects(data); // This updates the progress bar

    const supportData = {};
    data.forEach((p) => {
      supportData[p._id] = p.raised || 0;
    });
    setTotalSupport(supportData);
  } catch (err) {
    console.error("Error fetching projects:", err);
  }
};



const [payments, setPayments] = useState([]);


const [myInvestments, setMyInvestments] = useState([]);
const [totalPaid, setTotalPaid] = useState(0);

const fetchPayments = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/payments", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPayments(data || []);
  } catch (err) {
    console.error("Error fetching payments:", err);
  }
};



const getProjectRaisedFromPayments = (projectId) => {
  return payments.reduce((total, payment) => {
    if (!Array.isArray(payment.projects)) return total;

    payment.projects.forEach((proj) => {
      const pid = String(proj.projectId?._id || proj.projectId);

      if (
        pid === String(projectId) &&
        payment.status === "success"
      ) {
        total += Number(proj.amount || 0);
      }
    });

    return total;
  }, 0);
};



const fetchMyInvestments = async () => {
  if (!token) return;
  try {
    const res = await fetch("http://localhost:5000/api/payments/my-investments", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMyInvestments(data.projects || []);
    setTotalPaid(data.totalPaid || 0);
  } catch (err) {
    console.error("Fetch Investments Error:", err);
  }
};

// Call on load
useEffect(() => {
  if (token) fetchMyInvestments();
}, []);

useEffect(() => {
  const handleFocus = () => {
    fetchMyInvestments();
  };

  window.addEventListener("focus", handleFocus);
  return () => window.removeEventListener("focus", handleFocus);
}, []);




// 2. Load data on first visit
useEffect(() => {
  if (token) fetchProjects();
   fetchPayments(); 
}, [token]);

// 3. Refresh when returning from the Chapa payment page (Tab Focus)
useEffect(() => {
  const handleFocus = () => {
    refreshAllData(); 
     fetchMyInvestments();
  };

  window.addEventListener("focus", handleFocus);
  return () => window.removeEventListener("focus", handleFocus);
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    fetchProjects();
     refreshAllData();
  }, 5000); // refresh every 5 seconds

  return () => clearInterval(interval);
}, []);


// 4. Check if the URL says "success" and refresh
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const txRef = urlParams.get("tx_ref");

  if (!txRef) return;

  const verifyPayment = async () => {
    let success = false;

    for (let i = 0; i < 3; i++) {
      await new Promise(res => setTimeout(res, 2000));

      const res = await fetch(
        `http://localhost:5000/api/payments/verify/${txRef}`
      );
      const data = await res.json();

      console.log("VERIFY:", data);

     if (data.status === "success") {
       success = true; // 🔥 ADD THIS

        await refreshAllData(); // 🔥 THIS FIXES TOTAL PAID
        await fetchMyInvestments();  // 🔥 MUST
        await fetchProjects();

        Swal.fire("Success!", "Payment recorded", "success");

        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

                if (success) {
                    Swal.fire("Success!", "Payment successful", "success");

                    // 🔥 REFRESH BOTH: The project list AND your summary
                   await refreshAllData();
              window.history.replaceState({}, document.title, window.location.pathname);

                    window.history.replaceState({}, document.title, window.location.pathname);
                  }
                };

  verifyPayment();
}, []);


const refreshAllData = async () => {
  await fetchProjects();
  await fetchMyInvestments();
};

  // 3. Refresh when returning from Chapa (Tab Focus)
  useEffect(() => {
    window.addEventListener("focus", refreshAllData);
    return () => window.removeEventListener("focus", refreshAllData);
  }, []);

 

const handleChapaPayment = async (projectId, amount) => {
 if (!amount || amount <= 5000) {
  Swal.fire({
    icon: "warning",
    title: "Invalid Amount",
    text: "Minimum investment amount is 5000 ETB.",
  });
  return;
}

  const token = localStorage.getItem("token"); // make sure token exists
 if (!token) {
  Swal.fire({
    icon: "error",
    title: "Login Required",
    text: "You must log in before making an investment.",
  });
  return;
}
Swal.fire({
  title: "Processing Payment",
  text: "Please wait...",
  allowOutsideClick: false,
  didOpen: () => {
    Swal.showLoading();
  },
});

  try {
    const res = await fetch(`http://localhost:5000/api/payments/${projectId}/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ send JWT token
      },
      body: JSON.stringify({
       amount: Number(amount),
        email: user.email,
        name: user.name,
        projectName: projects.find(p => p._id === projectId)?.title || `Project ${projectId}`,
      }),
    });
Swal.close();


    const data = await res.json();
    console.log("Frontend payment response:", data);

    if (data.payment_url) {
      Swal.fire({
  title: "Redirecting to Payment",
  text: "Please wait...",
  allowOutsideClick: false,
  didOpen: () => {
    Swal.showLoading();
  },
});
      window.location.href = data.payment_url;
    } else {
     Swal.fire({
  icon: "error",
  title: "Payment Failed",
  text: data.message || "Please try again.",
});
    }
  } catch (err) {
    console.error(err);
  Swal.fire({
  icon: "error",
  title: "Payment Error",
  text: "Unable to start payment. Try again later.",
});
  }
};




const handleRequestInvestment = async (projectId) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/projects/${projectId}/request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
  Swal.fire({
    icon: "error",
    title: "Request Failed",
    text: data.message || "Unable to process your request.",
    confirmButtonColor: "#2563eb"
  });
  return;
}

    // ✅ update UI instantly
    setProjects(prev =>
      prev.map(p =>
        p._id === projectId ? data.project : p
      )
    );

   Swal.fire({
  icon: "success",
  title: "Request Sent",
  text: "Your investment request was submitted successfully.",
});

  } catch (err) {
  console.error(err);

  Swal.fire({
    icon: "error",
    title: "Request Failed",
    text: "Unable to send investment request. Please try again.",
  });
}
};








  
  const categories = [
    "All", "Health", "Education", "Agriculture", "Energy", "Finance",
    "Software Solutions", "Manufacturing", "Transport", "Tourism",
    "Social", "Other",
  ];

  const filteredProjects = projects.filter((project) => {
    const matchSearch =
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.tags || []).some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchCategory = filterCategory === "All" || project.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const toggleFavorite = (projectId) => {
    setFavorites((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleSupport = async (projectId, projectTitle, minAmount, fullPrice, status) => {
    if (status !== "Approved") {
      Swal.fire({
  icon: "warning",
  title: "Project Not Available",
  text: "Only approved projects can receive investments.",
});
      return;
    }

   const amount = parseFloat(supportAmounts[projectId]);
if (isNaN(amount) || amount <= 5000) {
  Swal.fire({
  icon: "warning",
  title: "Invalid Amount",
  text: "Please enter a valid investment amount.",
});
  return;
}

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error("Failed to support project");

      const updated = await res.json();

      setTotalSupport((prev) => ({
        ...prev,
        [projectId]: updated.raised,
      }));

      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, raised: updated.raised } : p))
      );

    Swal.fire({
  icon: "success",
  title: "Investment Successful",
  text: `You invested ${amount} ETB in "${projectTitle}".`,
});

      setSupportAmounts((prev) => ({ ...prev, [projectId]: "" }));
    } catch (err) {
      console.error("Error supporting project:", err);
    }
  };


const addToCart = (project) => {
  const amount = parseFloat(supportAmounts[project._id]);
  
  // Calculate how much money is still needed
let totalRaised = getProjectRaisedFromPayments(project._id);
  const goalAmount = project.price; // This is the total price of the project
  
  const remainingNeeded = goalAmount - totalRaised;

  // 1. Basic Validation
  if (!amount || amount < 5000) {
    Swal.fire("Minimum Amount", "Minimum investment is 5,000 ETB", "warning");
    return;
  }

  // 2. Check if project is already finished
  if (remainingNeeded <= 0) {
    Swal.fire("Project Fully Funded", "This project has already reached its goal!", "info");
    return;
  }

  // 3. Check if investor is trying to pay too much
  if (amount > remainingNeeded) {
    Swal.fire({
      icon: "error",
      title: "Amount Exceeds Goal",
      text: `You can only invest up to ${remainingNeeded.toLocaleString()} ETB to complete this project's funding.`,
    });
    return;
  }

  // 4. Check if already in cart
  const exists = cart.find(item => item._id === project._id);
  if (exists) {
    Swal.fire("Already in Cart", "You have already added this project to your list.", "info");
    return;
  }

  // 5. Success - Add to cart
  setCart(prev => [...prev, { ...project, amount }]);
  Swal.fire({ title: "Added to Summary", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
};
  



          const handleCartPayment = async () => {
            const totalAmount = cart.reduce((sum, item) => sum + item.amount, 0);

            if (totalAmount <= 0) return;

            Swal.fire({
              title: "Confirm Payment",
              text: `Total: ${totalAmount} ETB`,
              showCancelButton: true,
            }).then(async (result) => {
              if (!result.isConfirmed) return;

              try {
                const res = await fetch("http://localhost:5000/api/payments/cart-pay", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    projects: cart.map(item => ({
                      projectId: item._id,
                      projectName: item.title,
                      amount: item.amount
                    })),
                    email: user.email,
                    name: user.name,
                  }),
                });

                const data = await res.json();

                if (data.payment_url) {
                  // Redirect to Chapa
                  window.location.href = data.payment_url;
                } else {
                  Swal.fire("Error", data.message || "Payment failed", "error");
                }

              } catch (err) {
                console.error(err);
                Swal.fire("Error", "Server error", "error");
              }
            });
          };




  const handleAskQuestion = async (projectId) => {
   const { value: questionText } = await Swal.fire({
  title: "Ask a Question",
  input: "text",
  inputPlaceholder: "Type your question here...",
  showCancelButton: true,
});

if (!questionText) return;



    if (!questionText) return;

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: questionText }),
      });
      if (!res.ok) throw new Error("Failed to submit question");

      const updated = await res.json();

      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? updated : p))
      );
      if (selectedProject?._id === projectId) setSelectedProject(updated);

      Swal.fire({
  icon: "success",
  title: "Question Submitted",
  text: "Your question was sent to the project owner.",
});

    } catch (err) {
  console.error("Error adding question:", err);

  Swal.fire({
    icon: "error",
    title: "Question Failed",
    text: "Could not submit your question.",
  });
}
  };

  return (
    <div className="investors">
    <div className="/investor">
      <h1 ></h1>
    

 {/* ✅ MY INVESTMENTS SUMMARY */}
<div className="my-investments-box">
  <h2>💰 My Investments</h2>

  {myInvestments.length === 0 ? (
    <div className="empty-investments">
      <span className="empty-icon">📭</span>
      <p>No investments yet.</p>
      <small>Start investing in projects below!</small>
    </div>
  ) : (
    <>
      {/* ===== TABLE HEADER ===== */}
      <div className="investment-table-header">
        <span>Project</span>
        <span>Invested</span>
        
      </div>

      {/* ===== INVESTMENT LIST ===== */}
      <div className="investment-list">
        {myInvestments.map((item, index) => {
         

          

          return (
            <div key={index} className="investment-item">
              <span className="project-name">📁 {item.projectName}</span>
              <span className="amount">{formatCurrency(item.total)}</span>
             
            </div>
          );
        })}
      </div>

      {/* ===== TOTAL PAID ===== */}
      <div className="total-paid">
        <div className="total-paid-left">
          🧾 Total Invested
        </div>
        <div className="total-paid-right">
          <strong>{formatCurrency(totalPaid)}</strong>
        </div>
      </div>
    </>
  )}
</div>
      
          
  </div>



     <div className="cart-box">
  <h2>🛒 Cart ({cart.length})</h2>

  {cart.map(item => (
    <div key={item._id} className="cart-item">
      <div className="cart-info">
        <p className="cart-title">{item.title}</p>
        <p className="cart-price">{item.amount} ETB</p>
      </div>
      <button 
        className="remove-btn"
        onClick={() => setCart(cart.filter(p => p._id !== item._id))}
      >
        Remove
      </button>
    </div>
  ))}

  {cart.length > 0 && (
    <button className="pay-all-btn" onClick={handleCartPayment}>
      Pay All 💳
    </button>
  )}
</div>


      {/* Search & Filter */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Projects List */}
      <div className="project-list">
        {filteredProjects.map((project) => {
  const raised = getProjectRaisedFromPayments(project._id);

  return (
          
          <div key={project._id} className="project-card">
            <h2>{project.title}</h2>
            <p>Category: {project.category}</p>
            <p><strong>Problem Statement:</strong> {project.problemStatement || "N/A"}</p>
            
           <p>Price: <strong>{formatCurrency(project.price)}</strong> | Expected Profit: <strong>{formatCurrency(project.expectedProfit)}</strong></p>


            <p>
              Status:{" "}
              <span
                className={
                  project.status === "Approved"
                    ? "status-approved"
                    : project.status === "Rejected"
                    ? "status-rejected"
                    : project.status === "Sold"
                    ? "status-sold"
                    : "status-pending"
                }
              >
                {project.status}
              </span>
            </p>
                 {project.status === "Sold" && project.soldTo && (
          <p className="sold-to">
            💰 Sold to {project.soldTo.name} 
          </p>
        )}
                      
            <div className="media">
              {(project.images || []).slice(0, 1).map((img, idx) => (
                <img key={idx} src={img.startsWith("http") ? img : `http://localhost:5000${img}`} alt="" width="200" />
              ))}
              {(project.videos || []).slice(0, 1).map((vid, idx) => (
                <video key={idx} src={vid.startsWith("http") ? vid : `http://localhost:5000${vid}`} controls width="200" />
              ))}
            </div>


                <div className="card-buttons">
                  <button onClick={() => toggleFavorite(project._id)}>
                    {favorites.includes(project._id) ? <FaStar /> : <FaRegStar />}
                  </button>



                  {/* ✅ Add this button */}
                  <button className="btn-view-details" onClick={() => setSelectedProject(project)}>
                    <FaInfoCircle /> View Details
                  </button>
                </div>



          <div className="investment-section">
               {/* Progress Info */}
                 <div className="funding-status">
              <div className="status-labels">
                
                <span>Raised: {formatCurrency(raised)}</span>
                <span className="goal-text">Goal: {formatCurrency(project.price)}</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                   width: `${(raised / project.price) * 100}%`,
                  }}
                ></div>
              </div>

              <p className="remaining-needed">
                Remaining: <strong>{project.price - raised} ETB</strong>
              </p>
            </div>
            <div className="amount-input-container">
              <span className="currency-prefix">ETB</span>
              <input
                type="number"
                placeholder="Investment Amount"
                className="professional-input"
                value={supportAmounts[project._id] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                 const remaining = project.price - raised;
                  // Prevent typing more than what's needed
                  if (val > remaining) {
                    setSupportAmounts(prev => ({ ...prev, [project._id]: remaining }));
                  } else {
                    setSupportAmounts(prev => ({ ...prev, [project._id]: val }));
                  }
                }}
              />
             


            </div>
            

          <div className="investment-button-group">
              <button 
                className="btn-pay-now"
               disabled={project.status !== "Approved" || (raised >= project.price)}
                onClick={() => handleChapaPayment(project._id, supportAmounts[project._id])}
              >
                {raised >= project.price ? "Fully Funded" : "Invest Now"}
              </button>

              <button 
                className="btn-add-cart"
                disabled={project.status !== "Approved" || (raised >= project.price)}
                onClick={() => addToCart(project)}
              >
                <FaShoppingCart />
              </button>



              
            </div>
          </div>




            </div>
         
          );
})}
      </div>


      

      {/* Project Modal */}
      {selectedProject && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedProject(null)}>
              <FaTimes />
            </button>
            <h2>{selectedProject.title}</h2>
            <p>{selectedProject.description}</p>
            <p><strong>Problem Statement:</strong> {selectedProject.problemStatement || "N/A"}</p>
            
            <p>Price: <strong>{formatCurrency(selectedProject.price)}</strong> | Expected Profit: <strong>{formatCurrency(selectedProject.expectedProfit)}</strong></p>

            <p>Category: {selectedProject.category}</p>
            <p>
              Status:{" "}
              <span
                className={
                  selectedProject.status === "Approved"
                    ? "status-approved"
                    : selectedProject.status === "Rejected"
                    ? "status-rejected"
                    
                    : "status-pending"
                }
              >
                {selectedProject.status}
              </span>
            </p>
           



            <div className="media">
              {(selectedProject.images || []).map((img, idx) => (
                <img key={idx} src={img.startsWith("http") ? img : `http://localhost:5000${img}`} alt="" width="300" />
              ))}
              {(selectedProject.videos || []).map((vid, idx) => (
                <video
              key={idx}
              src={vid.startsWith("http") ? vid : `http://localhost:5000${vid}`}
              controls
              controlsList="nodownload noplaybackrate noremoteplayback"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              width="200"
            />
              ))}
            </div>

            {/* <div className="questions">
              <h3>Questions</h3>
              {selectedProject.questions?.length === 0 && <p>No questions yet.</p>}
              {selectedProject.questions?.map((q) => (
                <p key={q._id}>Q: {q.text}</p>
              ))}
              <button onClick={() => handleAskQuestion(selectedProject._id)}>Ask Question</button>
            </div> */}

          </div>
        </div>
      )}
    </div>
    
  );
}

export default InvestorDashboard;
