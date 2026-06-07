// نستورد أداة التنقل بين الصفحات
import { useNavigate } from "react-router-dom";
// نستورد أداة تحسين SEO
import { Helmet } from "react-helmet-async";

// هذا هو مكون الصفحة الرئيسية
export default function Home() {
  // هذا المتغير يسمح لنا ننتقل لصفحات ثانية
  const navigate = useNavigate();

  // الأشياء اللي داخل return تظهر بالموقع
  return (
    <>
      {/* منطقة تحسين محركات البحث */}
      <Helmet>
        <title>ونسنا - خلّ الجو يونس | ألعاب جماعية ممتعة</title>
        <meta
          name="description"
          content="موقع ونسنا يقدم ألعاباً جماعية ممتعة وتحديات شيقة مثل Bring It Fast، Forbidden Word، Who Said. ابدأ اللعب الآن واستمتع مع أصحابك!"
        />
        <link rel="canonical" href="https://wansna.vercel.app/" />
        {/* تحسين المشاركة على السوشل ميديا */}
        <meta property="og:title" content="ونسنا - خلّ الجو يونس" />
        <meta
          property="og:description"
          content="موقع ونسنا يقدم ألعاباً جماعية ممتعة وتحديات شيقة. ابدأ اللعب الآن واستمتع مع أصحابك!"
        />
        <meta property="og:image" content="https://wansna.vercel.app/logo.png" />
        <meta property="og:url" content="https://wansna.vercel.app/" />
      </Helmet>

      {/* الحاوية الرئيسية للصفحة */}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          background: "#f7f5ff",
          padding: "24px",
          boxSizing: "border-box",
          fontFamily: "Cairo, sans-serif",
        }}
      >
        {/* شعار التطبيق */}
        <img
          src="/logo.png"
          alt="شعار ونسنا - خلّ الجو يونس"
          style={{
            width: "min(70vw, 320px)",
            marginBottom: "32px",
          }}
        />

        {/* النص تحت الشعار */}
        <p
          style={{
            fontSize: "clamp(20px, 4vw, 28px)",
            fontWeight: 700,
            color: "#5f5a72",
            margin: 0,
          }}
        >
          خلّ الجو يُونس
        </p>
        <br></br>

        {/* زر ابدأ اللعب */}
        <button
          onClick={() => navigate("/games")}
          aria-label="ابدأ اللعب والتنقل إلى قائمة الألعاب"
          style={{
            marginTop: "24px",
            padding: "14px 36px",
            fontSize: "clamp(16px, 3vw, 20px)",
            fontWeight: 700,
            background: "#6C4CF1",
            color: "white",
            border: "none",
            borderRadius: "14px",
            cursor: "pointer",
            fontFamily: "Cairo, sans-serif",
            boxShadow: "0 8px 20px rgba(108,76,241,0.3)",
          }}
        >
          ابدأ اللعب 🎮
        </button>
      </div>
    </>
  );
}