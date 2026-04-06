import React from "react";
import logo from "./image/image1.jpg";

function Invoice({ payment }) {
  if (!payment) return null;

  const tx_ref = payment.tx_ref;
  const invoiceNumber = `INV-${tx_ref?.slice(-6).toUpperCase()}`; 
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalAmount = parseFloat(payment.amount) || 0;
  const taxRate = 0.15; 
  const subtotal = totalAmount / (1 + taxRate);
  const vatAmount = totalAmount - subtotal;

  return (
    <>
      {/* RESPONSIVE CSS INJECTOR */}
      <style>
        {`
          .invoice-card {
            padding: 50px;
            margin: 20px auto;
          }
          .flex-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .text-right { text-align: right; }
          .totals-box { width: 280px; }

          /* MOBILE STYLES */
          @media (max-width: 600px) {
            .invoice-card {
              padding: 20px !important;
              margin: 10px !important;
              border: none !important;
            }
            .flex-row {
              flex-direction: column !important;
              gap: 20px;
            }
            .text-right {
              text-align: left !important;
            }
            .totals-box {
              width: 100% !important;
            }
            .watermark {
              font-size: 80px !important;
            }
            h1 { font-size: 24px !important; }
            h2 { font-size: 18px !important; }
          }

          /* PRINT STYLES */
          @media print {
            .invoice-card {
              margin: 0 !important;
              border: none !important;
              padding: 40px !important;
            }
          }
        `}
      </style>

      <div
        className="invoice-card"
        style={{
          maxWidth: "850px",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          background: "#fff",
          color: "#1f2937",
          position: "relative",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          WebkitPrintColorAdjust: "exact",
          textAlign: "left"
        }}
      >
        {/* PAID WATERMARK */}
        <div className="watermark" style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-45deg)",
          fontSize: "150px",
          fontWeight: "900",
          color: "rgba(16, 185, 129, 0.08)",
          zIndex: 0,
          pointerEvents: "none",
        }}>
          PAID
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* HEADER */}
          <div className="flex-row" style={{ marginBottom: "40px" }}>
            <div>
              <img src={logo} alt="logo" style={{ height: "60px", marginBottom: "15px" }} />
              <h2 style={{ margin: 0, color: "#1e40af", fontWeight: "800" }}>
                MINT INNOVATION PORTAL
              </h2>
              <p style={{ margin: "5px 0", fontSize: "12px", color: "#6b7280" }}>
                Ministry of Innovation and Technology<br />
                Addis Ababa, Ethiopia
              </p>
            </div>
            <div className="text-right">
              <h1 style={{ margin: 0, fontWeight: "300", color: "#9ca3af" }}>RECEIPT</h1>
              <p style={{ margin: "5px 0", fontSize: "14px", fontWeight: "600" }}>#{invoiceNumber}</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>{date}</p>
            </div>
          </div>

          <div style={{ height: "2px", background: "#f3f4f6", marginBottom: "30px" }} />

          {/* DETAILS */}
          <div className="flex-row" style={{ marginBottom: "40px" }}>
            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "11px", textTransform: "uppercase", color: "#9ca3af" }}>Customer</h4>
              <p style={{ margin: 0, fontWeight: "700" }}>{payment.customerName || "Valued User"}</p>
              <p style={{ margin: "2px 0", fontSize: "13px", color: "#4b5563" }}>{payment.email}</p>
            </div>
            <div className="text-right">
              <h4 style={{ margin: "0 0 8px 0", fontSize: "11px", textTransform: "uppercase", color: "#9ca3af" }}>Payment Info</h4>
              <p style={{ margin: 0, fontWeight: "600", fontSize: "13px" }}>Gateway: Chapa</p>
              <p style={{ margin: "2px 0", fontSize: "13px", color: "#059669", fontWeight: "700" }}>SUCCESSFUL</p>
            </div>
          </div>

          {/* TABLE */}
          <div style={{ overflowX: "auto" }}> {/* Enables swiping on very small phones */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #1e40af" }}>
                  <th style={{ padding: "12px 0", textAlign: "left", fontSize: "12px", color: "#1e40af" }}>DESCRIPTION</th>
                  <th style={{ padding: "12px 0", textAlign: "right", fontSize: "12px", color: "#1e40af" }}>TOTAL (ETB)</th>
                </tr>
              </thead>
              <tbody>
                {payment.projects?.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "15px 0", fontSize: "14px" }}>
                      <strong>{p.projectName || "Project Investment"}</strong>
                    </td>
                    <td style={{ padding: "15px 0", textAlign: "right", fontSize: "14px", fontWeight: "600" }}>
                      {parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALS */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div className="totals-box">
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#4b5563" }}>
                <span>Subtotal:</span>
                <span>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#4b5563" }}>
                <span>VAT (15%):</span>
                <span>{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                padding: "15px 0", 
                borderTop: "2px solid #1e40af", 
                marginTop: "10px",
                fontSize: "18px",
                fontWeight: "800",
                color: "#1e40af"
              }}>
                <span>Total:</span>
                <span>{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ marginTop: "40px", textAlign: "center", borderTop: "1px solid #f3f4f6", paddingTop: "20px" }}>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: "700" }}>Ministry of Innovation and Technology</p>
            <p style={{ margin: "5px 0", fontSize: "10px", color: "#9ca3af" }}>
              Computer generated receipt. Valid for tax purposes.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Invoice;