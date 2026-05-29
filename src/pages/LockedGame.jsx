// نستورد useState لتخزين القيم المتغيرة
import { useState } from "react";

// نستورد أدوات التنقل وقراءة الرابط
import { useNavigate, useParams } from "react-router-dom";


// صفحة قفل اللعبة
export default function LockedGame() {

  // نقرأ معرف اللعبة من الرابط
  // مثال:
  // /locked/who-said
  const { gameId } = useParams();


  // أداة التنقل بين الصفحات
  const navigate = useNavigate();


  // تخزين الكود الذي يكتبه المستخدم
  const [code, setCode] = useState("");


  // تخزين رسالة الخطأ
  const [error, setError] = useState("");


  // تخزين حالة نجاح التفعيل
  // إذا true تظهر شاشة الاحتفال
  const [success, setSuccess] = useState(false);



  // أسماء الألعاب
  const gameNames = {

    "who-said": "من قالها؟ 😂",

    "forbidden-word": "كلمة ممنوعة 🤫",

    "know-me": "من يعرفني أكثر؟ 👀"
  };



  // الأكواد الصحيحة لكل لعبة
  const validCodes = {

    "who-said": "WHO123",

    "forbidden-word": "WORD123",

    "know-me": "ME123"
  };



  // اسم اللعبة الحالية
  const currentGameName = gameNames[gameId];



  // دالة تفعيل الكود
  function activateCode() {

    // إذا الكود المكتوب يساوي الكود الصحيح
    if (code.trim() === validCodes[gameId]) {

      // نحفظ الاشتراك داخل المتصفح
      // حتى لا تظهر صفحة الاشتراك مرة ثانية
      localStorage.setItem(`subscribed-${gameId}`, "true");


      // تشغيل حالة النجاح
      // لإظهار شاشة الاحتفال
      setSuccess(true);


      // بعد 1.2 ثانية
      // ينتقل لصفحة إعداد اللاعبين
      setTimeout(() => {

        navigate(`/play/${gameId}/setup`);

      }, 1200);

    }

    // إذا الكود غير صحيح
    else {

      // نظهر رسالة خطأ
      setError("الكود غير صحيح");
    }
  }



  // دالة تحدث أثناء الكتابة داخل الحقل
  function handleCodeChange(e) {

    // تحديث قيمة الكود
    setCode(e.target.value);


    // حذف رسالة الخطأ مباشرة
    // أول ما يبدأ المستخدم يكتب
    setError("");
  }



  return (

    // الحاوية الرئيسية
    <div style={{

      minHeight: "100dvh",

      background: "#f7f5ff",

      display: "flex",

      justifyContent: "center",

      alignItems: "center",

      padding: "24px",

      boxSizing: "border-box",

      fontFamily: "Cairo, sans-serif",


      // مهم لشاشة الاحتفال
      position: "relative",

      overflow: "hidden"
    }}>



      {/* شاشة الاحتفال تظهر فقط إذا success = true */}
      {success && (

        <div style={{

          // تغطي كامل الشاشة
          position: "fixed",

          inset: 0,

          background: "rgba(247,245,255,0.85)",

          display: "flex",

          justifyContent: "center",

          alignItems: "center",

          flexDirection: "column",

          zIndex: 10,

          fontSize: "42px",

          fontWeight: 700,

          color: "#6C4CF1"
        }}>

          {/* المفرقعات */}
          <div style={{ fontSize: "80px" }}>

            🎉🎊✨

          </div>


          {/* نص النجاح */}
          <div style={{marginTop: "50px"}}>
            
            تم التفعيل!

          </div>

        </div>
      )}



      {/* كرت الاشتراك */}
      <div style={{

        background: "white",

        maxWidth: "420px",

        width: "100%",

        padding: "28px",

        borderRadius: "24px",

        textAlign: "center",

        boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
      }}>



        {/* اسم اللعبة */}
        <h2 style={{

          color: "#6C4CF1",

          marginTop: 0
        }}>

          {currentGameName}

        </h2>



        {/* أيقونة القفل */}
        <div style={{

          fontSize: "48px",

          margin: "20px 0"
        }}>

          🔒

        </div>



        {/* عنوان الاشتراك */}
        <h3 style={{

          margin: 0,

          color: "#333"
        }}>

          هذه اللعبة للمشتركين فقط

        </h3>



        {/* وصف */}
        <p style={{

          color: "#777",

          lineHeight: 1.8
        }}>

          اشتركي عبر واتساب، أو أدخلي كود الاشتراك إذا كان عندك كود.

        </p>



        {/* رابط واتساب */}
        <a

          // رسالة واتساب تتغير حسب اللعبة
          href={`https://wa.me/966537103072?text=مرحبا، أبى أشترك في لعبة ${currentGameName}`}

          target="_blank"
        >

          {/* زر واتساب */}
          <button style={{

            width: "100%",

            padding: "14px",

            background: "#25D366",

            color: "white",

            border: "none",

            borderRadius: "14px",

            fontSize: "17px",

            fontWeight: 700,

            cursor: "pointer",

            fontFamily: "Cairo, sans-serif",

            marginBottom: "16px"
          }}>

            اشترك عبر واتساب 💬

          </button>

        </a>



        {/* حقل إدخال الكود */}
        <input

          type="text"

          placeholder="أدخل كود الاشتراك"


          // القيمة الحالية للحقل
          value={code}


          // عند الكتابة يشغل دالة التحديث
          onChange={handleCodeChange}


          style={{

            width: "100%",

            padding: "14px",

            borderRadius: "14px",

            border: "1px solid #ddd",

            fontSize: "16px",

            fontFamily: "Cairo, sans-serif",

            boxSizing: "border-box",

            textAlign: "center"
          }}
        />



        {/* زر تفعيل الكود */}
        <button

          // عند الضغط يشغل دالة التفعيل
          onClick={activateCode}


          style={{

            width: "100%",

            marginTop: "14px",

            padding: "14px",

            background: "#6C4CF1",

            color: "white",

            border: "none",

            borderRadius: "14px",

            fontSize: "17px",

            fontWeight: 700,

            cursor: "pointer",

            fontFamily: "Cairo, sans-serif"
          }}
        >

          تفعيل الكود ✨

        </button>



        {/* زر الرجوع */}
        <button

          // يرجع لصفحة الألعاب
          onClick={() => navigate("/games")}


          style={{

            width: "100%",

            marginTop: "12px",

            padding: "12px",

            background: "transparent",

            color: "#6C4CF1",

            border: "2px solid #6C4CF1",

            borderRadius: "14px",

            fontSize: "16px",

            fontWeight: 700,

            cursor: "pointer",

            fontFamily: "Cairo, sans-serif"
          }}
        >

          ← رجوع للألعاب

        </button>



        {/* رسالة الخطأ */}
        {/* تظهر فقط إذا error يحتوي نص */}
        {error && (

          <p style={{

            color: "red",

            marginTop: "14px"
          }}>

            {error}

          </p>
        )}


      </div>
    </div>
  );
}