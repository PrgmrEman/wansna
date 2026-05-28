// نستورد أداة التنقل بين الصفحات
import { useNavigate } from "react-router-dom";


// هذا هو مكون الصفحة الرئيسية
export default function Home() {

  // هذا المتغير يسمح لنا ننتقل لصفحات ثانية
  const navigate = useNavigate();


  // الأشياء اللي داخل return تظهر بالموقع
  return (

    // الحاوية الرئيسية للصفحة
    <div style={{

      // يجعل الصفحة بطول كامل الشاشة
      minHeight: "100vh",

      // تفعيل flexbox
      display: "flex",

      // توسيط العناصر أفقياً
      justifyContent: "center",

      // توسيط العناصر عمودياً
      alignItems: "center",

      // ترتيب العناصر فوق بعض (عمودي)
      flexDirection: "column",

      // لون الخلفية
      background: "#f7f5ff",

      // مسافة داخلية
      padding: "24px",

      // يمنع مشاكل الحجم
      boxSizing: "border-box",

      // تطبيق خط Cairo
      fontFamily: "Cairo, sans-serif"
    }}>


      {/* شعار التطبيق */}
      <img

        // رابط الصورة من مجلد public
        src="/logo.png"

        // وصف للصورة
        alt="ونسنا"

        // تنسيق الصورة
        style={{

          // حجم متجاوب مع جميع الشاشات
          width: "min(70vw, 320px)",

          // مسافة تحت الشعار
          marginBottom: "32px"
        }}
      />


      {/* النص تحت الشعار */}
      <p style={{

        // حجم خط متجاوب
        fontSize: "clamp(20px, 4vw, 28px)",

        // سماكة الخط
        fontWeight: 700,

        // لون النص
        color: "#5f5a72",

        // إزالة الهوامش الافتراضية
        margin: 0
      }}>

        {/* النص الظاهر */}
        خلّ الجو يونس

      </p>


      {/* زر ابدأ اللعب */}
      <button

        // عند الضغط ينتقل لصفحة الألعاب
        onClick={() => navigate("/games")}


        // تنسيق الزر
        style={{

          // مسافة فوق الزر
          marginTop: "24px",

          // مساحة داخلية
          padding: "14px 36px",

          // حجم الخط
          fontSize: "clamp(16px, 3vw, 20px)",

          // سماكة الخط
          fontWeight: 700,

          // لون الخلفية
          background: "#6C4CF1",

          // لون النص
          color: "white",

          // إزالة الحدود
          border: "none",

          // تدوير الأطراف
          borderRadius: "14px",

          // تغيير شكل الماوس
          cursor: "pointer",

          // خط Cairo
          fontFamily: "Cairo, sans-serif",

          // ظل خفيف
          boxShadow: "0 8px 20px rgba(108,76,241,0.3)"
        }}
      >

        {/* النص داخل الزر */}
        ابدأ اللعب 🎮

      </button>

    </div>
  );
}