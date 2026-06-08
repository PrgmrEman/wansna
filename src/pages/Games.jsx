// استيراد أداة التنقل بين الصفحات
import { useNavigate } from "react-router-dom";
// استيراد أداة تحسين SEO
import { Helmet } from "react-helmet-async";

// مكون صفحة الألعاب
export default function Games() {
  // أداة التنقل بين الصفحات
  const navigate = useNavigate();

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
    },
    {
      title: "جيبها بسرعة",
      emoji: "⚡",
      color: "#8DD2A137",
      id: "bring-it-fast",
      description: "اللي يجيبها اسرع يفوز"
    },
    {
      title: "الأرقام الذهبية",
      emoji: "🔒",
      color: "#F5ECA04D",
      id: "golden-numbers",
      description: "اكتشف الأرقام الذهبية بأقل عدد من المحاولات"
    },
  ];

  return (
    <>
      {/* منطقة تحسين محركات البحث */}
      <Helmet>
        <title>اختر لعبتك | ونسنا - ألعاب جماعية ممتعة</title>
        <meta
          name="description"
          content="تصفح ألعاب ونسنا: من قالها؟، الكلمة الممنوعة، من يعرفني أكثر؟، جيبها بسرعة، والأرقام الذهبية. اختر لعبتك وابدأ التحدي مع أصحابك!"
        />
        <link rel="canonical" href="https://wansna.vercel.app/games" />
        {/* تحسين المشاركة على السوشل ميديا */}
        <meta property="og:title" content="اختر لعبتك | ونسنا - ألعاب جماعية" />
        <meta
          property="og:description"
          content="من قالها؟، الكلمة الممنوعة، جيبها بسرعة، والأكثر... اختر لعبتك وابدأ اللعب مع أصحابك!"
        />
        <meta property="og:image" content="https://wansna.vercel.app/logo.png" />
        <meta property="og:url" content="https://wansna.vercel.app/games" />
      </Helmet>

      {/* الحاوية الرئيسية للصفحة */}
      <div
        style={{
          minHeight: "100dvh",
          background: "#F7F5FF",
          padding: "30px",
          paddingBottom: "60px",
          fontFamily: "Cairo, sans-serif",
        }}
      >
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
                if (game.id === "golden-numbers") {
                  navigate("/play/golden-numbers");
                } else {
                  navigate(`/play/${game.id}/setup`);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`اختيار لعبة ${game.title}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (game.id === "golden-numbers") {
                    navigate("/play/golden-numbers");
                  } else {
                    navigate(`/play/${game.id}/setup`);
                  }
                }
              }}
              style={{
                background: game.color,
                borderRadius: "32px",
                padding: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "18px",
                minHeight: "100px",
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

          {/* بطاقة عن ونسنا */}
          <div
            onClick={() => navigate("/about")}
            role="button"
            tabIndex={0}
            aria-label="الذهاب إلى صفحة عن ونسنا"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/about");;
              }
            }}
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
            {/* أيقونة عن ونسنا */}
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

            {/* نص عن ونسنا */}
            <div
              style={{
                textAlign: "right",
                flex: 1
              }}
            >
              {/*  عن ونسنا  */}
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: "800",
                  color: "#444"
                }}
              >
                عن ونسنّا
              </div>

              {/* وصف عن ونسنا */}
              <div
                style={{
                  fontSize: "16px",
                  color: "#777",
                  marginTop: "8px"
                }}
              >
               تعرف على ونسنّا 
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}