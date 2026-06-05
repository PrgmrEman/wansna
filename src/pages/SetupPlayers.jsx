// نستورد useState لتخزين اللاعبين والجمعات السابقة
import { useState } from "react";

// نستورد useNavigate للتنقل بين الصفحات
// ونستورد useParams لمعرفة اللعبة الحالية من الرابط
import { useNavigate, useParams } from "react-router-dom";

// صفحة إعداد اللاعبين
export default function SetupPlayers() {
  // نقرأ معرف اللعبة من الرابط
  const { gameId } = useParams();

  // نجهز أداة التنقل
  const navigate = useNavigate();

  // أسماء الألعاب
  const gameNames = {
    "who-said": "من قالها؟ 😂",
    "forbidden-word": "الكلمة الممنوعة 🤫",
    "know-me": "من يعرفني أكثر؟ 👀",
    "bring-it-fast": "جيبها بسرعة ⚡",
    "golden-numbers": "الأرقام الذهبية 🔒"
  };

  // شرح كل لعبة
  const gameDescriptions = {
    "who-said":
      "يختار اللاعبون نمط اللعبة: جملة، كلمة، أو موقف. يكتب كل لاعب محتوى حسب النمط المختار، ثم تبدأ الجولات. في كل جولة يظهر محتوى لأحد اللاعبين ويحاول اللاعب الحالي تخمين من قاله. إذا خمن صح يكسب نقطة، وإذا أخطأ يكسب صاحب الإجابة نقطة. أنصحكم بنمط موقف لأنه أكثر حماسًا وضحكًا.",

    "forbidden-word":
      "يختار اللاعبون موضوع اللعبة. في كل جولة  محاور وضيف. يعرف المحاور الكلمة الممنوعة ويحاول استدراج الضيف ليقولها دون أن يكتشفها. إذا قال الضيف الكلمة يفوز المحاور، وإذا اكتشفها الضيف أو انتهى الوقت دون قولها يفوز الضيف. لعبة ممتعة تعتمد على الذكاء وسرعة البديهة.",

    "know-me":
        "يتم اختيار لاعب عشوائياً ليكتب أسئلة عن نفسه. يحاول باقي اللاعبين الإجابة وفقاً لمعرفتهم به، ثم في النهاية يخمن صاحب الأسئلة من أكثر شخص يعرفه. لعبة ممتعة تكشف من يعرفك أكثر.",

    "bring-it-fast":
      "تدعم اللعبة حتى 12 لاعباً. عند البداية يحصل كل لاعب على لون خاص به ويجب عليه حفظه جيداً. يتم تحديد عدد الجولات قبل بدء اللعب. في كل جولة يُطلب إحضار شيء بسرعة، وعلى اللاعبين الإسراع لإحضاره ثم العودة إلى الجوال والضغط على لونهم. أول لاعب يضغط على لونه يفوز بالجولة. إذا ضغط لاعب على لون لاعب آخر تُحتسب الجولة مباشرة لصاحب ذلك اللون، لذلك تحتاج اللعبة إلى السرعة والتركيز وحفظ لونك جيداً. في النهاية يتم جمع نتائج جميع الجولات وإعلان اللاعب الأكثر فوزاً بالجولات بطلاً للعبة.",
    "golden-numbers":
      "يختار اللاعبون نمط اللعب فردياً أو جماعياً، ثم يتم تحديد مدى الأرقام. يختار النظام 4 أرقام ذهبية سرية من هذا المدى، وعلى اللاعبين محاولة اكتشافها. بعد كل محاولة يخبرك النظام بعدد الأرقام الذهبية التي تم اكتشافها دون الكشف عنها. استمر في التخمين والاستنتاج حتى تصل إلى جميع الأرقام الذهبية. في النمط الجماعي يتناوب اللاعبون على المحاولات، والفائز هو أول من يكتشف الأرقام الذهبية كاملة."
  };

  // اللاعبين الحاليين في هذه الجولة
  const [players, setPlayers] = useState([""]);

  // الجمعات السابقة
  const [savedGroups, setSavedGroups] = useState(() => {
    const data = localStorage.getItem("saved-groups");
    return data ? JSON.parse(data) : [];
  });

  // رقم الجمعة التي يتم حذفها حاليًا
  const [deletingGroupId, setDeletingGroupId] = useState(null);

  // تحديث اسم لاعب معيّن
  function updatePlayer(index, value) {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  }

  // إضافة لاعب جديد
  function addPlayer() {
    setPlayers([...players, ""]);
  }

  // حذف لاعب
  function removePlayer(index) {
    const newPlayers = players.filter((_, i) => i !== index);
    setPlayers(newPlayers);
  }

  // اختيار جمعة محفوظة
  function selectSavedGroup(group) {
    setPlayers(group.players);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // حذف جمعة محفوظة
  function deleteGroup(groupId) {
    setDeletingGroupId(groupId);

    setTimeout(() => {
      const updatedGroups = savedGroups.filter(
        (group) => group.id !== groupId
      );

      setSavedGroups(updatedGroups);

      localStorage.setItem(
        "saved-groups",
        JSON.stringify(updatedGroups)
      );

      setDeletingGroupId(null);
    }, 300);
  }

  // بدء الجولة
  function startGame() {
    const cleanPlayers = players
      .map((name) => name.trim())
      .filter((name) => name !== "");

    if (cleanPlayers.length < 3) {
      alert("أضف 3 لاعبين على الأقل");
      return;
    }

    const newGroup = {
      id: Date.now(),
      date: new Date().toLocaleDateString("ar-SA"),
      players: cleanPlayers
    };

    const updatedGroups = [newGroup, ...savedGroups];

    setSavedGroups(updatedGroups);

    localStorage.setItem("saved-groups", JSON.stringify(updatedGroups));

    localStorage.setItem(
      "current-players",
      JSON.stringify(cleanPlayers)
    );

    navigate(`/play/${gameId}`);
  }

  return (
    <div style={pageStyle}>
      {/* عنوان اللعبة */}
      <h1 style={mainTitleStyle}>
        {gameNames[gameId]}
      </h1>

      {/* كرت إعداد اللاعبين */}
      <div style={cardStyle}>
        {/* عنوان الكرت */}
        <h2 style={cardTitleStyle}>
          من بيلعب معك؟ 👥
        </h2>

        {/* حقول اللاعبين */}
        {players.map((player, index) => (
          <div key={index} style={playerRowStyle}>
            <input
              type="text"
              placeholder={`اسم اللاعب ${index + 1}`}
              value={player}
              onChange={(e) => updatePlayer(index, e.target.value)}
              style={inputStyle}
            />

            <button
              onClick={() => removePlayer(index)}
              style={deletePlayerButtonStyle}
            >
              حذف
            </button>
          </div>
        ))}

        {/* زر إضافة لاعب */}
        <button onClick={addPlayer} style={addPlayerButtonStyle}>
          + إضافة لاعب
        </button>

        {/* شرح اللعبة */}
        <div style={descriptionBoxStyle}>
          <div style={descriptionTitleStyle}>
            شرح اللعبة 📖
          </div>

          <div style={descriptionTextStyle}>
            {gameDescriptions[gameId]}
          </div>
        </div>

        {/* زر بدء الجولة */}
        <button onClick={startGame} style={startButtonStyle}>
          ابدأ الجولة 🎮
        </button>

        {/* الجمعات السابقة */}
        {savedGroups.length > 0 && (
          <div style={{ marginTop: "28px" }}>
            <h3>الجمعات السابقة</h3>

            {savedGroups.map((group) => (
              <div
                key={group.id}
                style={{
                  ...savedGroupCardStyle,
                  opacity: deletingGroupId === group.id ? 0 : 1,
                  transform:
                    deletingGroupId === group.id
                      ? "translateX(40px)"
                      : "translateX(0)"
                }}
              >
                <strong>جمعة {group.date}</strong>

                <p style={savedGroupPlayersStyle}>
                  {group.players.join(" - ")}
                </p>

                <div style={savedGroupButtonsStyle}>
                  <button
                    onClick={() => selectSavedGroup(group)}
                    style={useGroupButtonStyle}
                  >
                    استخدام
                  </button>

                  <button
                    onClick={() => deleteGroup(group.id)}
                    style={deleteGroupButtonStyle}
                  >
                    حذف الجمعة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button style={backButtonStyle} onClick={() => navigate("/games")}>
          رجوع للألعاب
        </button>
      </div>
    </div>
  );
}

/* =========================
   التنسيقات
========================= */

const pageStyle = {
  minHeight: "100dvh",
  background: "#f7f5ff",
  padding: "24px",
  boxSizing: "border-box",
  fontFamily: "Cairo, sans-serif"
};

const mainTitleStyle = {
  color: "#6C4CF1",
  paddingTop: "20px",
  textAlign: "center",
  paddingBottom: "12px",
  fontSize: "40px"
};

const cardStyle = {
  background: "white",
  maxWidth: "500px",
  margin: "30px auto",
  padding: "24px",
  borderRadius: "24px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

const cardTitleStyle = {
  marginTop: 0,
  marginBottom: "18px",
  color: "#131214",
  fontFamily: "Cairo, sans-serif",
  fontSize: "30px",
  fontWeight: "900",
  lineHeight: "1.3"
};

const playerRowStyle = {
  display: "flex",
  gap: "8px",
  marginBottom: "10px"
};

const inputStyle = {
  flex: 1,
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid #ddd",
  fontSize: "16px",
  fontFamily: "Cairo, sans-serif"
};

const deletePlayerButtonStyle = {
  padding: "0 14px",
  border: "none",
  borderRadius: "14px",
  background: "#ffeff3",
  color: "#d6336c",
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif"
};

const addPlayerButtonStyle = {
  width: "100%",
  padding: "12px",
  background: "transparent",
  color: "#6C4CF1",
  border: "2px dashed #6C4CF1",
  borderRadius: "14px",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif"
};

const descriptionBoxStyle = {
  background: "#f7f5ff",
  borderRadius: "16px",
  padding: "16px",
  marginTop: "16px",
  marginBottom: "16px",
  textAlign: "right",
  direction: "rtl"
};

const descriptionTitleStyle = {
  color: "#6C4CF1",
  fontWeight: "800",
  marginBottom: "8px",
  fontFamily: "Cairo, sans-serif"
};

const descriptionTextStyle = {
  color: "#555",
  lineHeight: "1.9",
  fontFamily: "Cairo, sans-serif"
};

const startButtonStyle = {
  width: "100%",
  marginTop: "16px",
  padding: "14px",
  background: "#6C4CF1",
  color: "white",
  border: "none",
  borderRadius: "14px",
  fontSize: "17px",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif"
};

const savedGroupCardStyle = {
  background: "#f7f5ff",
  padding: "14px",
  borderRadius: "16px",
  marginBottom: "12px",
  transition: "all 0.3s ease"
};

const savedGroupPlayersStyle = {
  color: "#777",
  margin: "8px 0"
};

const savedGroupButtonsStyle = {
  display: "flex",
  gap: "10px",
  justifyContent: "center",
  marginTop: "10px"
};

const useGroupButtonStyle = {
  padding: "8px 14px",
  border: "none",
  borderRadius: "10px",
  background: "#6C4CF1",
  color: "white",
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif"
};

const deleteGroupButtonStyle = {
  padding: "8px 14px",
  border: "none",
  borderRadius: "10px",
  background: "#ffeff3",
  color: "#d6336c",
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif"
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
  fontFamily: "Cairo, sans-serif"
};