// استيراد أداة التنقل بين الصفحات
import { useNavigate } from "react-router-dom";


// مكون صفحة الألعاب
export default function Games() {

  // أداة التنقل
  const navigate = useNavigate();


  // قائمة الألعاب
  const games = [

    {
      title: "من قالها؟",
      emoji: "😂",
      color: "#F6F0DC",
      id: "who-said",
      description: "خمّن ✅ تكسب نقطة,خمّن ❌ يربح اللي قالها"
    },

    {
      title: "الكلمة الممنوعة",
      emoji: "🤫",
      color: "#E8F1FF",
      id: "forbidden-word",
      description: "استدرج صاحبك يقول الكلمة"
    },

    {
      title: "من يعرفني أكثر؟",
      emoji: "👀",
      color: "#F1E7FF",
      id: "know-me",
      description: "اختبر مين يعرفك فعلًا"
    }

  ];


  return (

    // الحاوية الرئيسية
    <div
      style={{

        // ارتفاع الشاشة بالكامل
        minHeight: "100dvh",

        // لون الخلفية
        background: "#F7F5FF",

        // مسافة داخلية
        padding: "24px",

        // الخط المستخدم
        fontFamily: "Cairo, sans-serif"
      }}
    >

      {/* رأس الصفحة */}
      <div
        style={{
          textAlign: "center",
          marginTop: "30px",
          marginBottom: "40px"
        }}
      >

        {/* اسم التطبيق */}
        <h1
          style={{
            color: "#6C4CF1",
            fontSize: "58px",
            fontWeight: "900",
            margin: 0,
            fontFamily: "Cairo, sans-serif",
          }}
        >
          ونسنّا
        </h1>

        {/* وصف التطبيق */}
        <p
          style={{
            marginTop: "20px",
            color: "#888",
            fontSize: "20px",
            fontWeight: "700",
            marginLeft: "100px",
          }}
        >
          ألعاب تجمعكم🎮
        </p>

        {/* عنوان القسم */}
        <h2
          style={{
            marginTop: "35px",
            color: "rgba(95, 146, 182, 0.8)",
            fontSize: "30px",
            fontWeight: "800",
            fontFamily: "Cairo, sans-serif",
          }}
        >
        اختر لعبة... وخلّينا نلعب
        </h2>

      </div>



      {/* قائمة الألعاب */}
      <div
        style={{

          display: "flex",
          flexDirection: "column",

          gap: "18px",

          maxWidth: "550px",

          margin: "0 auto"
        }}
      >

        {/* إنشاء بطاقة لكل لعبة */}
        {games.map((game) => (

          <div
            key={game.id}

            // الانتقال للعبة عند الضغط
            onClick={() => {
              navigate(`/play/${game.id}/setup`);
            }}

            style={{

              // لون البطاقة
              background: game.color,

              // حواف دائرية
              borderRadius: "28px",

              // مسافات داخلية
              padding: "20px",

              // شكل المؤشر
              cursor: "pointer",

              // توزيع العناصر أفقياً
              display: "flex",

              alignItems: "center",

              gap: "18px",

              // ارتفاع البطاقة
              minHeight: "120px",

              // ظل خفيف
              boxShadow: "0 8px 20px rgba(190, 182, 182, 0.78)"
            }}
          >

            {/* مربع الإيموجي */}
            <div
              style={{
                width: "80px",
                height: "80px",

                background: "rgba(142, 142, 235, 0.75)",

                borderRadius: "22px",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                fontSize: "42px",

                flexShrink: 0
              }}
            >
              {game.emoji}
            </div>



            {/* معلومات اللعبة */}
            <div
              style={{
                textAlign: "right",
                flex: 1
              }}
            >

              {/* اسم اللعبة */}
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: "800",
                  color: "#444"
                }}
              >
                {game.title}
              </div>

              {/* وصف اللعبة */}
              <div
                style={{
                  fontSize: "16px",
                  color: "#777",
                  marginTop: "6px"
                }}
              >
                {game.description}
              </div>

            </div>

          </div>

        ))}



        {/* بطاقة الدعم */}
        <div
          onClick={() => navigate("/support")}

          style={{
            background: "#FFE8F1",

            borderRadius: "28px",

            padding: "20px",

            cursor: "pointer",

            display: "flex",

            alignItems: "center",

            gap: "18px",

            minHeight: "120px",

            boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
          }}
        >

          {/* أيقونة الدعم */}
          <div
            style={{
              width: "80px",
              height: "80px",

              background: "rgba(255,255,255,.75)",

              borderRadius: "22px",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              fontSize: "42px",

              flexShrink: 0
            }}
          >
            ❤️
          </div>


          {/* نص الدعم */}
          <div
            style={{
              textAlign: "right",
              flex: 1
            }}
          >

            <div
              style={{
                fontSize: "30px",
                fontWeight: "800",
                color: "#444"
              }}
            >
              ادعم ونسنّا
            </div>

            <div
              style={{
                fontSize: "16px",
                color: "#777",
                marginTop: "6px"
              }}
            >
              بدعمك نقدر نطور أكثر 🚀
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}