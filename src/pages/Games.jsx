// نستورد أداة التنقل
import { useNavigate } from "react-router-dom";


// هذا مكون صفحة الألعاب
export default function Games() {

  // يسمح لنا بالتنقل بين الصفحات
  const navigate = useNavigate();


  // مصفوفة الألعاب
  // كل لعبة لها:
  // title = الاسم
  // id = معرف اللعبة
  const games = [

    {
      title: "من قالها؟ 😂",
      id: "who-said"
    },

    {
      title: "الكلمة ممنوعة 🤫",
      id: "forbidden-word"
    },

    {
      title: "من يعرفني أكثر؟ 👀",
      id: "know-me"
    }

  ];


  return (

    // الحاوية الرئيسية
    <div style={{

      minHeight: "100vh",
      background: "#f7f5ff",

      padding: "24px",

      fontFamily: "Cairo, sans-serif"
    }}>


      {/* عنوان الصفحة */}
      <h1 style={{

        textAlign: "center",

        color: "#6C4CF1",

        marginBottom: "40px"
      }}>

        اختر اللعبة 🎮

      </h1>



      {/* حاوية كروت الألعاب */}
      <div style={{

        display: "flex",

        flexDirection: "column",

        gap: "20px",

        maxWidth: "500px",

        margin: "0 auto"
      }}>


        {/* نلف على الألعاب */}
        {games.map((game) => (


          // كرت اللعبة
          <div

            // مفتاح فريد لكل عنصر
            key={game.id}


            // عند الضغط ينتقل لصفحة القفل
            onClick={() => {

            // نقرأ حالة الاشتراك من المتصفح
            const isSubscribed = localStorage.getItem(`subscribed-${game.id}`);


            // إذا اللعبة مفعلة
            if (isSubscribed === "true") {

              // يروح مباشرة للإعداد
              navigate(`/play/${game.id}/setup`);
            }

            // إذا غير مفعلة
            else {

              // يروح لصفحة الاشتراك
              navigate(`/locked/${game.id}`);
            }
          }}


            style={{

              background: "white",

              padding: "24px",

              borderRadius: "20px",

              cursor: "pointer",

              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",

              transition: "0.2s"
            }}
          >

            {/* اسم اللعبة */}
            <h2 style={{

              margin: 0,

              color: "#444"
            }}>

              {game.title}

            </h2>

          </div>

        ))}

      </div>

    </div>
  );
}