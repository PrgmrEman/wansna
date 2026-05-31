// استيراد أداة التنقل بين الصفحات
import { useNavigate } from "react-router-dom";

// استيراد أدوات React
import { useEffect, useState } from "react";


// مكون صفحة الألعاب
export default function Games() {

  // أداة التنقل بين الصفحات
  const navigate = useNavigate();


  // نخزن هنا حدث تثبيت التطبيق
  const [installPrompt, setInstallPrompt] = useState(null);


  // التقاط حدث التثبيت من المتصفح
  useEffect(() => {
    const handler = (e) => {

      // منع المتصفح من إظهار التثبيت تلقائيًا
      e.preventDefault();

      // حفظ حدث التثبيت لاستخدامه عند الضغط على زر التثبيت
      setInstallPrompt(e);
    };


    // الاستماع لحدث التثبيت
    window.addEventListener("beforeinstallprompt", handler);


    // تنظيف الحدث عند مغادرة الصفحة
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);


  // دالة مشاركة التطبيق
  const shareApp = async () => {
    try {

      // إذا الجهاز يدعم المشاركة
      if (navigator.share) {
        await navigator.share({
          title: "ونسنّا",
          text: "جربوا ونسنّا 🎮 ألعاب تجمعكم على جوال واحد",
          url: window.location.origin,
        });
      }

      // إذا المتصفح لا يدعم المشاركة، ننسخ الرابط
      else {
        await navigator.clipboard.writeText(window.location.origin);
        alert("تم نسخ رابط ونسنّا ✅");
      }

    } catch (err) {
      console.log(err);
    }
  };


  // دالة تثبيت التطبيق
  const installApp = async () => {

    // إذا لم يكن حدث التثبيت جاهزًا
    if (!installPrompt) {
      alert(
        "إذا لم تظهر نافذة التثبيت، افتحي الموقع من Chrome أو Safari ثم اختاري: إضافة إلى الشاشة الرئيسية"
      );
      return;
    }


    // إظهار نافذة التثبيت الرسمية
    installPrompt.prompt();


    // انتظار اختيار المستخدم
    await installPrompt.userChoice;


    // تفريغ الحدث بعد الاستخدام
    setInstallPrompt(null);
  };


  // قائمة الألعاب
  const games = [
    {
      title: "من قالها؟",
      emoji: "😂",
      color: "#F6F0DC",
      id: "who-said",
      description: "خمّن ✅ تكسب نقطة, خمّن ❌ يربح اللي قالها"
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

    // الحاوية الرئيسية للصفحة
    <div
      style={{

        // ارتفاع الشاشة بالكامل
        minHeight: "100dvh",

        // لون الخلفية
        background: "#F7F5FF",

        // مسافة داخلية من الأطراف
        padding: "30px",

        // مساحة إضافية أسفل الصفحة
        paddingBottom: "60px",

        // الخط المستخدم
        fontFamily: "Cairo, sans-serif",

        // مهم حتى تكون الأزرار العائمة داخل هذه الصفحة
        position: "relative"
      }}
    >

      {/* أزرار عائمة أعلى اليسار */}
      <div
        style={{
          position: "absolute",
          top: "22px",
          left: "22px",
          display: "flex",
          gap: "8px",
          zIndex: 5
        }}
      >

        {/* زر المشاركة */}
        <button
          onClick={shareApp}
          title="مشاركة التطبيق"
          style={topIconButtonStyle}
        >
          📎
        </button>


        {/* زر تثبيت التطبيق */}
        <button
          onClick={installApp}
          title="تثبيت التطبيق"
          style={topIconButtonStyle}
        >
          📲
        </button>

      </div>



      {/* رأس الصفحة */}
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
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
            marginTop: "22px",
            color: "#888",
            fontSize: "20px",
            fontWeight: "700",
            marginLeft: "100px",
          }}
        >
          ألعاب تجمعكم 🎮
        </p>


        {/* عنوان قسم اختيار اللعبة */}
        <h2
          style={{
            marginTop: "35px",
            marginLeft: "300px",
            color: "rgba(112, 74, 227, 0.93)",
            fontSize: "24px",
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

            // الانتقال لصفحة إعداد اللعبة عند الضغط
            onClick={() => {
              navigate(`/play/${game.id}/setup`);
            }}

            style={{

              // لون البطاقة حسب اللعبة
              background: game.color,

              // تدوير حواف البطاقة
              borderRadius: "32px",

              // مسافة داخلية
              padding: "20px",

              // شكل المؤشر عند المرور
              cursor: "pointer",

              // توزيع الإيموجي والنص بجانب بعض
              display: "flex",

              alignItems: "center",

              gap: "18px",

              // ارتفاع البطاقة
              minHeight: "100px",

              // ظل البطاقة
              boxShadow: "0 8px 20px rgba(190, 182, 182, 0.78)"
            }}
          >

            {/* مربع الإيموجي */}
            <div
              style={{
                width: "80px",
                height: "80px",

                background: "rgba(131, 131, 165, 0.06)",

                borderRadius: "26px",

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
                  marginTop: "20px"
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

            borderRadius: "32px",

            padding: "20px",

            cursor: "pointer",

            display: "flex",

            alignItems: "center",

            gap: "18px",

            minHeight: "100px",

            boxShadow: "0 8px 20px rgba(0,0,0,0.06)",

            marginBottom: "20px",
          }}
        >

          {/* أيقونة الدعم */}
          <div
            style={{
              width: "80px",
              height: "80px",

              background: "rgba(255,255,255,.75)",

              borderRadius: "26px",

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

            {/* عنوان الدعم */}
            <div
              style={{
                fontSize: "30px",
                fontWeight: "800",
                color: "#444"
              }}
            >
              ادعم ونسنّا
            </div>


            {/* وصف الدعم */}
            <div
              style={{
                fontSize: "16px",
                color: "#777",
                marginTop: "8px"
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


// تنسيق أزرار المشاركة والتثبيت العائمة
const topIconButtonStyle = {
  width: "42px",
  height: "42px",
  border: "none",
  borderRadius: "50%",
  background: "#F7F5FF",
  
  cursor: "pointer",
  fontSize: "22px",
  fontWeight: "900",
  
};