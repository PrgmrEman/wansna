import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* =========================
   إنشاء خطة التخمين
========================= */
function createGuessPlan(players, entries, guessRounds) {
  const plan = [];
  const seenByPlayer = {};

  players.forEach((player) => {
    seenByPlayer[player] = [];
  });

  // إنشاء الأدوار: لكل جولة لكل لاعب
  for (let round = 1; round <= guessRounds; round++) {
    players.forEach((guesser) => {
      plan.push({
        round,
        guesser,
        entry: null,
      });
    });
  }

  // توزيع العبارات على الأدوار
  plan.forEach((turn) => {
    const availableEntries = entries.filter(
      (entry) =>
        entry.player !== turn.guesser &&
        !seenByPlayer[turn.guesser].includes(entry.text)
    );

    // ترتيب حسب الأقل ظهورًا
    const sortedEntries = [...availableEntries].sort((a, b) => {
      const countA = plan.filter(
        (item) => item.entry?.text === a.text
      ).length;
      const countB = plan.filter(
        (item) => item.entry?.text === b.text
      ).length;
      return countA - countB;
    });

    const selectedEntry = sortedEntries[0];
    if (selectedEntry) {
      turn.entry = selectedEntry;
      seenByPlayer[turn.guesser].push(selectedEntry.text);
    }
  });

  return plan.filter((turn) => turn.entry !== null);
}

/* =========================
   مكون لعبة "من قالها؟"
========================= */
export default function WhoSaid() {
  const navigate = useNavigate();

  // قراءة اللاعبين بأمان
  const players = (() => {
    try {
      const saved = localStorage.getItem("current-players");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  const [phase, setPhase] = useState("type");
  const [entryType, setEntryType] = useState("");
  const [writingIndex, setWritingIndex] = useState(0);
  const [text, setText] = useState("");
  const [entries, setEntries] = useState([]);
  const [scores, setScores] = useState({});
  const [showPassScreen, setShowPassScreen] = useState(true);
  const [guessPlan, setGuessPlan] = useState([]);
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0);

  // عدد الجولات = عدد اللاعبين - 2، على الأقل 2
  const guessRounds = Math.max(2, players.length - 2);
  const currentTurn = guessPlan[currentGuessIndex];
  const currentGuesser = currentTurn?.guesser;
  const currentEntry = currentTurn?.entry;
  const currentRound = currentTurn?.round || 1;

  /* =========================
      اختيار نوع المشاركة
  ========================= */
  function chooseType(type) {
    setEntryType(type);
    setShowPassScreen(true);
    setPhase("writing");
  }

  /* =========================
      حفظ مشاركة اللاعب
  ========================= */
  function saveEntry() {
    if (text.trim() === "") {
      alert("لا يمكن حفظه فارغاً");
      return;
    }

    const currentPlayer = players[writingIndex];
    const newEntry = {
      player: currentPlayer,
      text: text.trim(),
    };

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    setText("");

    if (writingIndex < players.length - 1) {
      setWritingIndex(writingIndex + 1);
      setShowPassScreen(true);
    } else {
      const initialScores = {};
      players.forEach((p) => (initialScores[p] = 0));
      setScores(initialScores);
      startGuessing(updatedEntries);
    }
  }

  /* =========================
      بدء مرحلة التخمين
  ========================= */
  function startGuessing(allEntries) {
    const plan = createGuessPlan(players, allEntries, guessRounds);
    setGuessPlan(plan);
    setCurrentGuessIndex(0);
    setShowPassScreen(true);
    setPhase("guessing");
  }

  /* =========================
      تنفيذ التخمين (نقطة للمخمن إذا صح، نقطة لصاحب العبارة إذا خطأ)
  ========================= */
  function makeGuess(selectedPlayer) {
    const isCorrect = selectedPlayer === currentEntry.player;

    setScores((prev) => {
      const updated = { ...prev };
      if (isCorrect) {
        updated[currentGuesser] = (updated[currentGuesser] || 0) + 1;
      } else {
        updated[currentEntry.player] = (updated[currentEntry.player] || 0) + 1;
      }
      return updated;
    });

    // الانتقال الفوري للدور التالي
    const nextIndex = currentGuessIndex + 1;
    if (nextIndex < guessPlan.length) {
      setCurrentGuessIndex(nextIndex);
      setShowPassScreen(true);
    } else {
      setPhase("results");
    }
  }

  /* =========================
      إعادة اللعبة بنفس اللاعبين
  ========================= */
  function playAgain() {
    setPhase("type");
    setEntryType("");
    setWritingIndex(0);
    setText("");
    setEntries([]);
    setScores({});
    setShowPassScreen(true);
    setGuessPlan([]);
    setCurrentGuessIndex(0);
  }

  /* =========================
      لا يوجد لاعبين
  ========================= */
  if (players.length === 0) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2>ما فيه لاعبين محفوظين</h2>
          <button style={mainButton} onClick={() => navigate("/games")}>
            رجوع للألعاب
          </button>
        </div>
      </div>
    );
  }

  /* =========================
      شاشة اختيار النوع
  ========================= */
  if (phase === "type") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>من قالها؟ 😂</h1>
          <p style={textStyle}>اختاروا نوع المشاركة</p>
          {/* ✅ وصف اللعبة المحدث */}
          <p style={{ color: "#6C4CF1", fontWeight: 700, marginTop: -10 ,paddingBottom: "15px",}}>
          😂  خمّن ✅ تكسب نقطة، خمّن ❌ يربح اللي قالها
          </p>
          <button style={mainButton} onClick={() => chooseType("كلمة")}>
            كلمة
          </button>
          <button style={mainButton} onClick={() => chooseType("جملة")}>
            جملة
          </button>
          <button style={mainButton} onClick={() => chooseType("موقف")}>
            موقف
          </button>
        </div>
      </div>
    );
  }

  /* =========================
      شاشة الكتابة
  ========================= */
  if (phase === "writing") {
    const currentPlayer = players[writingIndex];
    return (
      <div style={pageStyle}>
        {showPassScreen && (
          <PassOverlay
            playerName={currentPlayer}
            message="مرروا الجوال إلى"
            buttonText="نعم هذا أنا"
            onConfirm={() => setShowPassScreen(false)}
          />
        )}
        <div style={cardStyle}>
          <h2 style={titleStyle}>مرحلة الكتابة ✍️</h2>
          <p style={textStyle}>
            اكتب {entryType}
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`اكتب ${entryType} هنا`}
            style={textareaStyle}
          />
          <button style={mainButton} onClick={saveEntry}>
            حفظ
          </button>
        </div>
      </div>
    );
  }

  /* =========================
      شاشة التخمين
  ========================= */
  if (phase === "guessing") {
    const guessOptions = players.filter((p) => p !== currentGuesser);

    return (
      <div style={pageStyle}>
        {showPassScreen && (
          <PassOverlay
            playerName={currentGuesser}
            message="مرروا الجوال إلى"
            buttonText="جاهز أخمن"
            onConfirm={() => setShowPassScreen(false)}
          />
        )}

        <div style={cardStyle}>
          <p style={textStyle}>
            الجولة {currentRound} من {guessRounds}
          </p>
          <h2 style={titleStyle}>مين قالها؟</h2>
          <div style={quoteStyle}>{currentEntry?.text}</div>
          <p style={textStyle}>اختر صاحب العبارة</p>
          <div style={guessGridStyle}>
            {guessOptions.map((player) => (
              <button
                key={player}
                style={guessButtonStyle}
                onClick={() => makeGuess(player)}
              >
                {player}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =========================
      شاشة النتائج
  ========================= */
  if (phase === "results") {
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const highestScore = Math.max(...sortedScores.map(([, s]) => s));
    const allTiedAtTop =
      sortedScores.filter(([, s]) => s === highestScore).length > 1;

    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>النتائج 🏆</h1>
          {allTiedAtTop && highestScore > 0 && (
            <p style={textStyle}>تعادل جميل بين المتصدرين 😄</p>
          )}
          {sortedScores.map(([player, score]) => (
            <div key={player} style={resultItemStyle}>
              {score === highestScore && highestScore > 0 && "👑 "}
              {player} — {score} نقطة
            </div>
          ))}
          <button style={mainButton} onClick={playAgain}>
            العب مرة أخرى
          </button>
          <button
            style={{ ...mainButton, background: "#888" }}
            onClick={() => navigate("/games")}
          >
            رجوع للألعاب
          </button>
        </div>
      </div>
    );
  }
}

/* =========================
   مكون شاشة تمرير الجوال
========================= */
function PassOverlay({ playerName, message, buttonText, onConfirm }) {
  return (
    <div style={overlayStyle}>
      <div style={overlayCardStyle}>
        <h2 style={{ color: "#6C4CF1", marginTop: 0 }}>{message}</h2>
        <h1 style={{ color: "#333" }}>{playerName}</h1>
        <p style={textStyle}>لا تفتح الشاشة إلا لما يكون الجوال معه 👀</p>
        <button style={mainButton} onClick={onConfirm}>
          {buttonText}
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
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  boxSizing: "border-box",
  fontFamily: "Cairo, sans-serif",
};

const cardStyle = {
  background: "white",
  width: "100%",
  maxWidth: "480px",
  padding: "28px",
  borderRadius: "24px",
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const titleStyle = {
  color: "#6C4CF1",
  marginTop: 0,
  marginBottom: "20px",
  fontSize: "28px",
  fontWeight: 700,
  fontFamily: "Cairo, sans-serif",
  
};

const textStyle = {
  color: "#777",
  lineHeight: 1.8,
  fontFamily: "Cairo, sans-serif",
  fontSize: "18px",
  paddingBottom: "15px",
  fontWeight: 500,
};

const mainButton = {
  width: "100%",
  marginTop: "12px",
  padding: "14px",
  background: "#6C4CF1",
  color: "white",
  border: "none",
  borderRadius: "14px",
  fontSize: "17px",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "Cairo, sans-serif",
};

const textareaStyle = {
  width: "100%",
  minHeight: "120px",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid #ddd",
  fontSize: "16px",
  fontFamily: "Cairo, sans-serif",
  boxSizing: "border-box",
  resize: "none",
  background: "white",
  color: "#222",
};

const quoteStyle = {
  background: "#f7f5ff",
  padding: "20px",
  borderRadius: "18px",
  fontSize: "22px",
  fontWeight: 700,
  color: "#333",
  margin: "20px 0",
};

const resultItemStyle = {
  background: "#f7f5ff",
  padding: "14px",
  borderRadius: "14px",
  marginBottom: "10px",
  fontWeight: 700,
};

const guessGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "12px",
  marginTop: "16px",
};

const guessButtonStyle = {
  ...mainButton,
  width: "auto",
  marginTop: 0,
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(20, 16, 40, 0.55)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  boxSizing: "border-box",
  zIndex: 100,


};

const overlayCardStyle = {
  background: "white",
  width: "100%",
  maxWidth: "420px",
  padding: "28px",
  borderRadius: "24px",
  textAlign: "center",
  boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
};