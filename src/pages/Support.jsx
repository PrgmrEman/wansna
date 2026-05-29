import { useNavigate } from "react-router-dom";

export default function Support() {
  const navigate = useNavigate();

  const bankName = "بنك الإنماء";
  const accountName = "ايمان احمد حسن الحجي  ";
  const iban = "SA04 0500 0068 2004 1015 6000";

  function copyIban() {
    navigator.clipboard.writeText(iban);
    alert("تم نسخ رقم الآيبان");
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        
          {/* شعار التطبيق */}
      <img
        src="/logo.png"
        alt="ونسنا"
        style={{
          width: "40%",
          height: "30%",
          objectFit: "contain",
          marginBottom: 0
        }}
      />


        <h1 style={titleStyle}>ادعم ونسنّا</h1>

        <p style={textStyle}>
          إذا استمتعت بالألعاب، دعمك يساعدنا على تطوير التطبيق
          وإضافة ألعاب جماعية جديدة وممتعة
          </p>

        <div style={supportBoxStyle}>
          <p style={labelStyle}>بيانات التحويل</p>

          <div style={infoItemStyle}>
            <span style={infoLabelStyle}>البنك</span>
            <strong>{bankName}</strong>
          </div>

          <div style={infoItemStyle}>
            <span style={infoLabelStyle}>اسم الحساب</span>
            <strong>{accountName}</strong>
          </div>

          <div style={ibanBoxStyle}>
            <span style={infoLabelStyle}>IBAN</span>
            <strong dir="ltr" style={ibanStyle}>{iban}</strong>
          </div>

          <button style={copyButtonStyle} onClick={copyIban}>
            نسخ رقم الآيبان
          </button>
        </div>

        <div style={qrBoxStyle}>
        <img
          src="/qr.jpeg"
          alt="QR Code"
          style={{
            width: "180px",
            height: "180px",
            borderRadius: "16px",
            background: "white",
            padding: "10px"
          }}
        />



        <button
          style={copyButtonStyle}
          onClick={() => {
            const link = document.createElement("a");
            link.href = "/qr.jpeg";
            link.download = "Wansna-QR.jpeg";
            link.click();
          }}
        >
          حفظ الباركود
        </button>
      </div>

        <p style={noteStyle}>
          الدعم اختياري بالكامل، ووجودك معنا هو الأهم ❤️
        </p>

        <button style={backButtonStyle} onClick={() => navigate("/games")}>
          رجوع للألعاب
        </button>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100dvh",
  background: "linear-gradient(180deg, #f7f5ff 0%, #fff7fb 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  boxSizing: "border-box",
  fontFamily: "Cairo, sans-serif"
};

const cardStyle = {
  width: "100%",
  maxWidth: "520px",
  background: "white",
  borderRadius: "28px",
  padding: "28px",
  textAlign: "center",
  boxShadow: "0 12px 35px rgba(108, 76, 241, 0.14)"
};



const titleStyle = {
  color: "#6C4CF1",
  fontSize: "32px",
  margin: "0 0 12px",
  fontWeight: 800,
  fontFamily: "Cairo, sans-serif",
};

const textStyle = {
  color: "#666",
  fontSize: "16px",
  lineHeight: 1.9,
  marginBottom: "22px"
};

const supportBoxStyle = {
  background: "#f7f5ff",
  borderRadius: "22px",
  padding: "18px",
  marginTop: "16px",
  border: "1px solid #e8e1ff"
};

const labelStyle = {
  color: "#6C4CF1",
  fontWeight: 800,
  fontSize: "18px",
  marginTop: 0,
  paddingBottom: "12px",
};

const infoItemStyle = {
  background: "white",
  padding: "14px",
  borderRadius: "14px",
  marginBottom: "10px",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center"
};

const infoLabelStyle = {
  color: "#888",
  fontSize: "14px"
};

const ibanBoxStyle = {
  background: "white",
  padding: "14px",
  borderRadius: "14px",
  marginBottom: "12px"
};

const ibanStyle = {
  display: "block",
  marginTop: "8px",
  fontSize: "17px",
  letterSpacing: "1px",
  color: "#222",
  wordBreak: "break-word"
};

const copyButtonStyle = {
  width: "100%",
  minHeight: "58px",
  border: "none",
  borderRadius: "14px",
  background: "#6C4CF1",
  color: "white",
  fontSize: "17px",
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif"
};

const qrBoxStyle = {
  marginTop: "18px",

  padding: "18px",
  borderRadius: "22px"
};



const noteStyle = {
  color: "#888",
  fontSize: "14px",
  marginTop: "18px",
  lineHeight: 1.8
};

const backButtonStyle = {
  width: "100%",
  minHeight: "58px",
  marginTop: "14px",
  border: "none",
  borderRadius: "14px",
  background: "#eeeafc",
  color: "#6C4CF1",
  fontSize: "16px",
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif"
};