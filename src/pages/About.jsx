import { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { Helmet } from "react-helmet-async";

/**
 * صفحة "عن ونسنّا"
 * تعرض:
 * - نبذة عن ونسنّا
 * - بطاقة "من أنا؟"
 * - قصة بداية ونسنّا
 * - دعم معنوي
 * - دعم ونسنّا
 */
export default function About() {
  const navigate = useNavigate();

  // ========================
  // بيانات المبرمجة
  // ========================
  const developer = {
    name: "إيمان الحجي",
    interests: "البرمجة، تصميم الألعاب، خلق لحظات ممتعة",
    story:`بدأت فكرة ونسنّا من جلساتنا العائلية الجميلة، حين كنا نبحث دائمًا عن ألعاب بسيطة تضيف إلى لَمّتنا مزيدًا من الضحك والحماس.

ومع الوقت خطرت لي فكرة إنشاء موقع يجمع الألعاب التي نستمتع بها مع العائلة والأصدقاء، حيث يتولى الموقع دور المنظم بطريقة سهلة وممتعة و من جهاز واحد، لتبدأ المتعة مباشرة دون أي تعقيد.

أطمح أن تكون ونسنّا جزءً من أجمل اللحظات، ومساحة تصنع الضحكات، وتشعل روح التحدي، وتترك ذكريات جميلة في كل جمعة  .
`,
  };

  // ========================
  // بيانات الحساب البنكي
  // ========================
  const bankName = "بنك الإنماء";
  const accountName = "ايمان احمد حسن الحجي";
  const iban = "SA04 0500 0068 2004 1015 6000";

  // ========================
  // حالات إظهار صناديق الدعم
  // ========================
  const [showFinancial, setShowFinancial] = useState(false);
  const [showMoral, setShowMoral] = useState(false);

  // ========================
  // حالات نموذج الدعم المعنوي
  // ========================
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  // ========================
  // دالة نسخ رقم الآيبان
  // ========================
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

  // ========================
  // دالة تحميل صورة الباركود
  // يجب وضع qr.jpeg داخل مجلد public
  // ========================
  async function downloadQR() {
    try {
      const response = await fetch("/qr.jpeg");

      if (!response.ok) {
        throw new Error("لم يتم العثور على الصورة");
      }

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
      console.error(error);
      alert("تعذر تحميل الباركود");
    }
  }

  // ========================
  // دالة إرسال رسالة الدعم المعنوي عبر EmailJS
  // تأكدي من إعداد متغيرات EmailJS داخل ملف .env
  // ========================
  async function handleMoralSubmit(e) {
    e.preventDefault();

    // منع الإرسال إذا كانت الحقول فارغة
    if (!name.trim() || !message.trim()) return;

    setSending(true);
    setStatus("");

    // تسجيل وقت إرسال الرسالة
    const now = new Date();
    const currentTime = now.toLocaleString("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: true,
    });

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          name,
          time: currentTime,
          message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setStatus("success");
      setName("");
      setMessage("");
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setSending(false);

      // إخفاء رسالة الحالة بعد 5 ثواني
      setTimeout(() => setStatus(""), 5000);
    }
  }

  return (
    <>
      {/* ========================
          بيانات SEO للصفحة
      ======================== */}
      <Helmet>
        <title>عن ونسنّا | ونسنّا</title>

        <meta
          name="description"
          content="تعرّف على ونسنّا، قصة المشروع، والمبرمج، وطرق الدعم  والمساهمة في تطوير الألعاب الجماعية."
        />

        <link rel="canonical" href="https://wansna.vercel.app/about" />

        <meta property="og:title" content="عن ونسنّا | ونسنّا" />
        <meta
          property="og:description"
          content="قصة ونسنّا وخيارات الدعم المعنوي والمساهمة في تطوير الألعاب."
        />
        <meta property="og:image" content="https://wansna.vercel.app/logo.png" />
        <meta property="og:url" content="https://wansna.vercel.app/about" />
      </Helmet>

      {/* ========================
          خلفية الصفحة
      ======================== */}
      <div style={pageStyle}>
        {/* ========================
            البطاقة الرئيسية
        ======================== */}
        <div style={cardStyle}>
          {/* شعار ونسنّا */}
          <img src="/logo.png" alt="شعار ونسنّا" style={logoStyle} />

          {/* جملة صغيرة تحت الشعار لتعزيز هوية ونسنّا */}
          <p style={taglineStyle}>💜خلّ الجو يُونس </p>
          <br />

          {/* عنوان الصفحة */}
          <h1 style={mainTitleStyle}>عن ونسنّا</h1>

          {/* نبذة عن ونسنّا */}
          <p style={introTextStyle}>
            ونسنّا منصة ألعاب جماعية عربية صُممت لتُضيف المتعة والتفاعل إلى
            الجلسات العائليةأو جلسات الأصدقاء، من جهاز واحد وبدون الحاجة إلى
            تحميل أي تطبيق.
          </p>

          {/* ========================
              بطاقة من أنا؟
              العنوان داخل البطاقة
          ======================== */}
          <div style={developerBoxStyle}>
            <p style={developerTitleStyle}>من أنا؟</p>

            <div style={infoItemStyle}>
              <span style={infoLabelStyle}>👩‍💻 المبرمجة</span>
              <strong>{developer.name}</strong>
            </div>

            <div style={infoItemStyle}>
              <span style={infoLabelStyle}>✨ اهتماماتي</span>
              <strong>{developer.interests}</strong>
            </div>
          </div>

          {/* ========================
              قصة ونسنّا
          ======================== */}
          <div style={storyBoxStyle}>
            <p style={storyTitleStyle}>قصة ونسنّا ✨</p>
            <p style={storyTextStyle}>{developer.story}</p>
          </div>

          {/* ========================
              أزرار الدعم
              الدعم المعنوي أولًا
          ======================== */}
          <div style={buttonsWrapperStyle}>
            <button
              style={{ ...mainButton, background: "#05541E" }}
              onClick={() => {
                setShowMoral(!showMoral);
                setShowFinancial(false);
              }}
            >
              شاركنا رأيكـ
            </button>

            <button
              style={{ ...mainButton, background: "#8368EF" }}
              onClick={() => {
                setShowFinancial(!showFinancial);
                setShowMoral(false);
              }}
            >
               ادعم ونسنّا
            </button>
          </div>

          {/* ========================
              صندوق الدعم المعنوي
          ======================== */}
          {showMoral && (
            <div style={supportBoxStyle}>
              <p style={labelStyle}>رأي أو اقتراح </p>

              <p style={supportTextStyle}>
                رسالتك تفرق كثير، سواء كانت كلمة تشجيع، ملاحظة، أو فكرة لعبة
                جديدة تضيف جوًا أحلى للجمعات.
              </p>

              <form onSubmit={handleMoralSubmit} style={formStyle}>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="اسمك"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  required
                />

                <textarea
                  placeholder="اكتب رسالتك..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  dir="rtl"
                  style={textareaStyle}
                  rows="3"
                  required
                />

                <button type="submit" disabled={sending} style={copyButtonStyle}>
                  {sending ? "جاري الإرسال..." : "إرسال ✨"}
                </button>

                {status === "success" && (
                  <p style={successTextStyle}>✅ وصلت رسالتك، شكرًا لك!</p>
                )}

                {status === "error" && (
                  <p style={errorTextStyle}>❌ حدث خطأ، حاولي مرة أخرى</p>
                )}
              </form>
            </div>
          )}

          {/* ========================
              صندوق دعم ونسنّا
          ======================== */}
          {showFinancial && (
            <div style={supportBoxStyle}>
              <p style={labelStyle}>المساهمة في تطوير ونسنّا</p>

              <p style={supportTextStyle}>
                دعمك يساعد في تطوير ألعاب جديدة، تحسين التجربة، واستمرار ونسنّا
                كمساحة ممتعة للجمعات              </p>

              <div style={infoItemStyle}>
                <span style={infoLabelStyle}>البنك</span>
                <strong>{bankName}</strong>
              </div>

              <div style={infoItemStyle}>
                <span style={infoLabelStyle}>اسم الحساب</span>
                <strong>{accountName}</strong>
              </div>

              {/* الآيبان أصبح بنفس تنسيق باقي البيانات وليس عموديًا */}
              <div style={infoItemStyle}>
                <span style={infoLabelStyle}>IBAN</span>
                <strong dir="ltr" style={ibanStyle}>
                  {iban}
                </strong>
              </div>

              <button style={copyButtonStyle} onClick={copyIban}>
                نسخ رقم الآيبان
              </button>

              <div style={qrWrapperStyle}>
                <img src="/qr.jpeg" alt="باركود الدعم" style={qrStyle} />

                <button style={copyButtonStyle} onClick={downloadQR}>
                  حفظ الباركود
                </button>
              </div>
            </div>
          )}

          {/* زر الرجوع */}
          <button style={backButtonStyle} onClick={() => navigate("/games")}>
            رجوع للألعاب
          </button>
        </div>
      </div>
    </>
  );
}

// ==================================================
// التنسيقات
// ==================================================

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
  width: "70%",
  height: "auto",
  maxHeight: "220px",
  objectFit: "contain",
  marginBottom: "0",
};

const taglineStyle = {
  color: "#8A73F8",
  fontSize: "14px",
  fontWeight: 800,
  margin: "-6px 0 8px",
  fontFamily: "Cairo, sans-serif",
};

const mainTitleStyle = {
  color: "#6C4CF1",
  fontSize: "30px",
  margin: "0 0 14px",
  fontWeight: 900,
  fontFamily: "Cairo, sans-serif",
};

const introTextStyle = {
  color: "#666",
  fontSize: "16px",
  lineHeight: 2,
  margin: "0 auto 12px",
  maxWidth: "440px",
};

/* بطاقة من أنا */
const developerBoxStyle = {
  background: "#f7f5ff",
  borderRadius: "22px",
  padding: "16px",
  margin: "18px 0 14px",
  border: "1px solid #FFE1E7",
  textAlign: "right",
};


const developerTitleStyle = {
  color: "#6C4CF1",
  fontSize: "20px",
  fontWeight: 900,
  margin: "0 0 14px",
  textAlign: "center",
};

/* بطاقة قصة ونسنّا */
const storyBoxStyle = {
  background: "#ffffff",
  borderRadius: "22px",
  padding: "18px",
  margin: "14px 0",
  textAlign: "right",
  direction: "rtl",
  border: "2px solid #e8e1ff",
};

const storyTitleStyle = {
  color: "#6C4CF1",
  fontWeight: 900,
  fontSize: "18px",
  marginBottom: "8px",
  textAlign: "center",
};

const storyTextStyle = {
  color: "#555",
  lineHeight: 1.9,
  whiteSpace: "pre-line",
  margin: 0,
};

const buttonsWrapperStyle = {
  marginTop: "28px",
};

const mainButton = {
  width: "100%",
  minHeight: "58px",
  marginTop: "10px",
  border: "none",
  borderRadius: "16px",
  color: "white",
  fontSize: "17px",
  fontWeight: 900,
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif",
  boxShadow: "0 8px 18px rgba(108, 76, 241, 0.16)",
};

const supportBoxStyle = {
  background: "#f7f5ff",
  borderRadius: "22px",
  padding: "18px",
  marginTop: "20px",
  border: "1px solid #e8e1ff",
};

const labelStyle = {
  color: "#6C4CF1",
  fontWeight: 900,
  fontSize: "18px",
  marginBottom: "10px",
};

const supportTextStyle = {
  color: "#666",
  fontSize: "15px",
  lineHeight: 1.8,
  marginBottom: "14px",
};

/* السطر الأبيض المستخدم لبيانات المبرمجة والبنك */
const infoItemStyle = {
  background: "white",
  padding: "14px",
  borderRadius: "14px",
  /*المسافة بين المدخل الاول و لاثاني */ 
  marginBottom: "20px",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center",
  textAlign: "right",
};

/* تسمية الحقول مثل: المبرمجة، اهتماماتي */
const infoLabelStyle = {
  color: "#888",
  fontSize: "14px",
  flexShrink: 0,
};


const ibanStyle = {
  display: "block",
  fontSize: "15px",
  letterSpacing: "0.5px",
  color: "#222",
  wordBreak: "break-word",
  textAlign: "left",
};

const copyButtonStyle = {
  width: "100%",
  minHeight: "52px",
  border: "none",
  borderRadius: "14px",
  background: "#6C4CF1",
  color: "white",
  fontSize: "16px",
  fontWeight: 900,
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif",
  marginTop: "8px",
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

const successTextStyle = {
  color: "#2e7d32",
  fontWeight: "bold",
  margin: 0,
};

const errorTextStyle = {
  color: "#c62828",
  fontWeight: "bold",
  margin: 0,
};

const qrWrapperStyle = {
  marginTop: "12px",
};

const qrStyle = {
  width: "160px",
  borderRadius: "12px",
  marginBottom: "6px",
};

const backButtonStyle = {
  width: "100%",
  minHeight: "58px",
  marginTop: "14px",
  border: "1px solid #DDD0FF",
  borderRadius: "14px",
  background: "#F4F0FF",
  color: "#6C4CF1",
  fontSize: "16px",
  fontWeight: 900,
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif",
};