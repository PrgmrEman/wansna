import { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

/**
 * صفحة الدعم - تتيح للمستخدمين دعم التطبيق مالياً ومشاركة الاقتراحات.
 * تستخدم EmailJS لإرسال الاقتراحات مباشرة إلى بريد المطور دون حاجة لخادم خلفي.
 * المتغيرات مخزنة في ملف .env بنمط VITE_ لتعمل مع Vite.
 */
export default function Support() {
  const navigate = useNavigate();

  // ========================
  // بيانات الحساب البنكي
  // ========================
  const bankName = "بنك الإنماء";
  const accountName = "ايمان احمد حسن الحجي";
  const iban = "SA04 0500 0068 2004 1015 6000";

  // ========================
  // حالات النموذج
  // ========================
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(""); // "success" أو "error"

  /**
   * تنسخ رقم الآيبان إلى الحافظة مع تغيير نص الزر مؤقتًا.
   */
  function copyIban(e) {
    navigator.clipboard.writeText(iban).then(() => {
      const btn = e.target;
      const originalText = btn.innerText;
      btn.innerText = "تم النسخ ✅";
      btn.disabled = true;
      setTimeout(() => {
        btn.innerText = originalText;
        btn.disabled = false;
      }, 2000);
    });
  }

  /**
   * تحمّل صورة الباركود QR للمستخدم.
   */
  async function downloadQR() {
    try {
      const response = await fetch("/qr.jpeg");
      if (!response.ok) throw new Error("لم يتم العثور على الصورة");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Wansna-QR.jpeg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("فشل التحميل:", error);
      alert("تعذر تحميل الباركود");
    }
  }

  /**
   * ترسل الاقتراح (الاسم والرسالة والوقت) إلى بريد المطور عبر EmailJS.
   * تستخدم متغيرات البيئة من Vite (import.meta.env).
   */
  async function handleSubmit(e) {
    e.preventDefault();

    // منع إرسال فارغ
    if (!name.trim() || !message.trim()) return;

    setSending(true);
    setStatus("");

    // تنسيق الوقت الحالي بالعربية
    const now = new Date();
    const currentTime = now.toLocaleString("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: true,
    });

    try {
      // الإرسال عبر EmailJS باستخدام مفاتيح Vite
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          name: name,
          time: currentTime,
          message: message,
          email: "hello@wansna.com",                // بريد المطور الثابت
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setStatus("success");
      setName("");
      setMessage("");
    } catch (error) {
      console.error("خطأ في إرسال الاقتراح:", error);
      setStatus("error");
    } finally {
      setSending(false);
      // إخفاء رسالة الحالة بعد 5 ثوانٍ
      setTimeout(() => setStatus(""), 5000);
    }
  }

  // ========================
  // واجهة المستخدم
  // ========================
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* شعار التطبيق */}
        <img src="/logo.png" alt="شعار ونسنا" style={logoStyle} />

        <h1 style={titleStyle}>ادعم ونسنّا</h1>
        <p style={textStyle}>
          إذا استمتعت بالألعاب، دعمك يساعدنا على تطوير التطبيق
          وإضافة ألعاب جماعية جديدة وممتعة
        </p>

        {/* ========== قسم التحويل البنكي ========== */}
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
          <div style={infoItemStyle}>
            <span style={infoLabelStyle}>IBAN</span>
            <strong dir="ltr" style={ibanStyle}>{iban}</strong>
          </div>
          <button style={copyButtonStyle} onClick={copyIban}>
            نسخ رقم الآيبان
          </button>
        </div>

        {/* ========== الباركود ========== */}
        <div style={qrBoxStyle}>
          <img src="/qr.jpeg" alt="QR Code للتحويل" style={qrImageStyle} />
          <button style={copyButtonStyle} onClick={downloadQR}>
            حفظ الباركود
          </button>
        </div>

        {/* ========== نموذج التواصل ========== */}
        <div style={contactBoxStyle}>
          <p style={contactTitleStyle}>📬 شاركنا رأيك ومقترحاتك</p>
          <p style={contactSubStyle}>
            أكتب اسمك وفكرتك، وبتوصلنا مباشرة
          </p>

          <form onSubmit={handleSubmit} style={formStyle}>
            <input
              type="text"
              placeholder="اسمك"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              required
            />
            <textarea
              placeholder="اكتب اقتراحك أو فكرتك هنا..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={textareaStyle}
              rows="4"
              required
            />
            <button
              type="submit"
              disabled={sending}
              style={{
                ...copyButtonStyle,
                opacity: sending ? 0.7 : 1,
                cursor: sending ? "not-allowed" : "pointer",
              }}
            >
              {sending ? "جاري الإرسال..." : "إرسال ✨"}
            </button>

            {/* رسائل الحالة */}
            {status === "success" && (
              <p style={successMsgStyle}>✅ تم الإرسال بنجاح! شكراً لمشاركتك.</p>
            )}
            {status === "error" && (
              <p style={errorMsgStyle}>❌ حدث خطأ، حاول مرة أخرى.</p>
            )}
          </form>
        </div>

        <p style={noteStyle}>❤️ الدعم اختياري بالكامل، ووجودك معنا هو الأهم</p>

        <button style={backButtonStyle} onClick={() => navigate("/games")}>
          رجوع للألعاب
        </button>
      </div>
    </div>
  );
}

// ========================
// أنماط التنسيق (Styles)
// ========================
const pageStyle = {
  minHeight: "100dvh",
  background: "linear-gradient(180deg, #f7f5ff 0%, #fff7fb 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  boxSizing: "border-box",
  fontFamily: "Cairo, sans-serif",
};

const cardStyle = {
  width: "100%",
  maxWidth: "520px",
  background: "white",
  borderRadius: "28px",
  padding: "28px",
  textAlign: "center",
  boxShadow: "0 12px 35px rgba(108, 76, 241, 0.14)",
};

const logoStyle = {
  width: "40%",
  height: "auto",
  maxHeight: "120px",
  objectFit: "contain",
  marginBottom: 0,
};

const titleStyle = {
  color: "#6C4CF1",
  fontSize: "32px",
  margin: "0 0 12px",
  fontWeight: 800,
};

const textStyle = {
  color: "#666",
  fontSize: "16px",
  lineHeight: 1.9,
  marginBottom: "22px",
};

const supportBoxStyle = {
  background: "#f7f5ff",
  borderRadius: "22px",
  padding: "18px",
  marginTop: "16px",
  border: "1px solid #e8e1ff",
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
  alignItems: "center",
};

const infoLabelStyle = {
  color: "#888",
  fontSize: "14px",
};


const ibanStyle = {
  display: "block",
  marginTop: "8px",
  fontSize: "17px",
  letterSpacing: "1px",
  color: "#222",
  wordBreak: "break-word",
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
  fontFamily: "Cairo, sans-serif",
  marginTop: "6px",
  transition: "0.2s",
};

const qrBoxStyle = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "22px",
};

const qrImageStyle = {
  width: "180px",
  height: "180px",
  borderRadius: "16px",
  background: "white",
  padding: "10px",
  marginBottom: "12px",
};

const contactBoxStyle = {
  marginTop: "24px",
  background: "#f5f0ff",
  borderRadius: "22px",
  padding: "20px",
  border: "1px solid #e0d4ff",
};

const contactTitleStyle = {
  color: "#6C4CF1",
  fontWeight: 800,
  fontSize: "18px",
  margin: "0 0 6px",
};

const contactSubStyle = {
  color: "#666",
  fontSize: "14px",
  marginBottom: "16px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  fontSize: "16px",
  fontFamily: "Cairo, sans-serif",
  boxSizing: "border-box",
  outline: "none",
};

const textareaStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  fontSize: "16px",
  fontFamily: "Cairo, sans-serif",
  boxSizing: "border-box",
  outline: "none",
  resize: "vertical",
};

const successMsgStyle = {
  color: "#2e7d32",
  fontWeight: "bold",
  margin: "8px 0 0",
};

const errorMsgStyle = {
  color: "#c62828",
  fontWeight: "bold",
  margin: "8px 0 0",
};

const noteStyle = {
  color: "#888",
  fontSize: "14px",
  marginTop: "18px",
  lineHeight: 1.8,
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
  fontFamily: "Cairo, sans-serif",
};