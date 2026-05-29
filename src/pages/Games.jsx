// نستورد أداة التنقل بين الصفحات
import { useNavigate } from "react-router-dom";



// هذا مكون صفحة الألعاب
export default function Games() {

  // يسمح لنا بالانتقال بين الصفحات
  const navigate = useNavigate();



  // مصفوفة الألعاب
  // كل لعبة تحتوي على:
  // title = اسم اللعبة
  // id = معرف اللعبة
  // description = وصف بسيط تحت الاسم
  const games = [

    {
      title: "من قالها؟ 😂",
      id: "who-said",
      description: "😂  خمّن ✅ تكسب نقطة، خمّن ❌ يربح اللي قالها"
    },

    {
      title: "الكلمة الممنوعة 🤫",
      id: "forbidden-word",
      description: "استدرج صاحبك يقول الكلمة 🎤"
    },

    {
      title: "من يعرفني أكثر؟ 👀",
      id: "know-me",
      description: "اختبر مين يعرفك فعلًا 💜"
    }

  ];



  return (

    // الحاوية الرئيسية للصفحة
    <div style={{

      // يجعل الصفحة بطول الشاشة
      minHeight: "100dvh",

      // لون الخلفية
      background: "#f7f5ff",

      // مسافة داخلية
      padding: "24px",

      // الخط المستخدم
      fontFamily: "Cairo, sans-serif"
    }}>



      {/* عنوان الصفحة */}
      <h1 style={{

        // توسيط العنوان
        textAlign: "center",

        // لون العنوان
        color: "#6C4CF1",

        // مسافة من الأعلى
        marginTop: "40px",

        // مسافة من الأسفل
        marginBottom: "40px",

        // حجم الخط
        fontSize: "48px",

        // سماكة الخط
        fontWeight: "800",

        // خط Cairo
        fontFamily: "Cairo, sans-serif",

      }}>

        اختر اللعبة 🎮

      </h1>




      {/* حاوية كروت الألعاب */}
      <div style={{

        // ترتيب عمودي
        display: "flex",

        flexDirection: "column",

        // مسافة بين الكروت
        gap: "20px",

        // أقصى عرض للحاوية
        maxWidth: "500px",

        // توسيط الحاوية
        margin: "0 auto"
      }}>



        {/* نلف على جميع الألعاب */}
        {games.map((game) => (



          // كرت اللعبة
          <div

            // مفتاح فريد لكل عنصر
            key={game.id}



            // عند الضغط على اللعبة
            onClick={() => {
             /*
              // نقرأ حالة الاشتراك من المتصفح
              const isSubscribed =
                localStorage.getItem(
                  `subscribed-${game.id}`
                );

              // إذا اللعبة مفعلة
              if (isSubscribed === "true") {*/

                // يروح مباشرة لصفحة الإعداد
                navigate(`/play/${game.id}/setup`);
                /*
              }

              // إذا غير مفعلة
              else {

                // يروح لصفحة الاشتراك
                navigate(`/locked/${game.id}`);
              }*/
            }}



            style={{

              // لون الكرت
              background: "white",

              // مسافة داخلية
              padding: "28px",

              // تدوير الحواف
              borderRadius: "24px",

              // شكل المؤشر
              cursor: "pointer",

              // الظل
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",

              // حركة ناعمة
              transition: "0.2s",

              // محاذاة النص
              textAlign: "center"
            }}
          >



            {/* اسم اللعبة */}
            <h2 style={{

              margin: 0,

              color: "#444",

              fontSize: "36px",

              fontWeight: "700"

            }}>

              {game.title}

            </h2>




            {/* وصف اللعبة */}
            <p style={{

              // مسافة من الأعلى
              marginTop: "12px",

              // لون الوصف
              color: "#888",

              // حجم الخط
              fontSize: "16px",

              // سماكة متوسطة
              fontWeight: "600",

              // ارتفاع السطر
              lineHeight: "1.7"

            }}>

              {game.description}

            </p>

          </div>

        ))}
        <button style={supportButtonStyle} onClick={() => navigate("/support")}>
          ادعم ونسنّا ❤️
          
        </button>

      </div>

    </div>
  );
}

const supportButtonStyle = {
  width: "100%",
  minHeight: "58px",
  padding: "10px",
  background: "#fff0f6",
  color: "#d6336c",
  border: "2px solid #ffd6e7",
  borderRadius: "14px",
  fontSize: "16px",
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif",
  marginBottom: "14px"
};