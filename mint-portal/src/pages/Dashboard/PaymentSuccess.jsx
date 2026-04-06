import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Invoice from "../Invoice";
import { useReactToPrint } from "react-to-print";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const tx_ref = new URLSearchParams(location.search).get("tx_ref")?.trim();

  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  
  const contentRef = useRef(null);

  // Correct for react-to-print v3
  const handlePrint = useReactToPrint({
    contentRef: contentRef, 
    documentTitle: `Invoice-${tx_ref}`,
  });

  useEffect(() => {
    if (!tx_ref) {
      setLoading(false);
      return;
    };

    const fetchPayment = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/payments/verify/${tx_ref}`);
        const data = await res.json();
        
        setPaymentData(data);
        
        // If the backend says the payment actually failed
        if (data.status !== "success") {
           Swal.fire("Payment Not Confirmed", data.message || "Your payment is still pending.", "warning");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Could not verify payment with server", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [tx_ref]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "100px", fontSize: "20px" }}>Verifying Payment...</div>;
  }

  // If no tx_ref or backend returned a hard failure
  if (!paymentData || paymentData.status === "failed") {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1 style={{ color: "#ef4444" }}>❌ Payment Failed</h1>
        <p>We could not find a successful record for this transaction.</p>
        <button onClick={() => navigate("/investor")} style={{ padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto", padding: "30px", background: "#fff", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", textAlign: "center" }}>
      
      {/* Dynamic Title based on status */}
      {paymentData.status === "success" ? (
        <h1 style={{ color: "#10b981" }}>✅ Payment Successful</h1>
      ) : (
        <h1 style={{ color: "#f59e0b" }}>⏳ Payment Pending</h1>
      )}

      {/* Invoice Section */}
      <div style={{ marginTop: "30px" }} ref={contentRef}>
        <Invoice payment={paymentData} />
      </div>

      <div style={{ marginTop: "25px" }}>
        {/* Only show Print button if payment is successful */}
        {paymentData.status === "success" && (
          <button 
            onClick={() => handlePrint()} 
            style={{ padding: "12px 25px", marginRight: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "15px", cursor: "pointer" }}
          >
            🖨️ Print / Download Invoice
          </button>
        )}

        <button onClick={() => navigate("/investor")} style={{ padding: "12px 25px", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", fontSize: "15px", cursor: "pointer" }}>
          ⬅ Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;