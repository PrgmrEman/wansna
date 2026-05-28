// نستورد useState من React
// نستخدمه لحفظ أي بيانات تتغير أثناء اللعب
import { useState } from "react";

// نستورد useNavigate من react-router-dom
// نستخدمه للانتقال بين صفحات التطبيق
import { useNavigate } from "react-router-dom";

// هذا هو مكوّن صفحة لعبة "من قالها؟"
export default function WhoSaid() {
  // navigate تسمح لنا ننقل المستخدم لصفحة ثانية
  const navigate = useNavigate();

  // نقرأ أسماء اللاعبين المحفوظة من localStorage
  const savedPlayers = localStorage.getItem("current-players");

  // إذا فيه لاعبين محفوظين نحولهم من نص إلى Array
  // إذا ما فيه نخلي القائمة فاضية
  const players = savedPlayers ? JSON.parse(savedPlayers) : [];

  // المرحلة الحالية من اللعبة
  // type = اختيار نوع المشاركة
  // writing = كتابة المشاركات
  // guessing = التخمين
  // results = النتائج
  const [phase, setPhase] = useState("type");

  // نوع المشاركة: كلمة / جملة / موقف
  const [entryType, setEntryType] = useState("");

  // ترتيب اللاعب الحالي في مرحلة الكتابة
  const [writingIndex, setWritingIndex] = useState(0);

  // النص الذي يكتبه اللاعب الحالي
  const [text, setText] = useState("");

  // جميع المشاركات التي كتبها اللاعبون
  const [entries, setEntries] = useState([]);

  // رقم جولة التخمين الحالية
  const [currentRound, setCurrentRound] = useState(1);

  // ترتيب اللاعب الحالي في مرحلة التخمين
  const [guessingIndex, setGuessingIndex] = useState(0);

  // العبارة الحالية التي تظهر في التخمين
  const [currentEntry, setCurrentEntry] = useState(null);

  // نقاط كل لاعب
  const [scores, setScores] = useState({});

  // هل تظهر شاشة تمرير الجوال؟
  // true تظهر، false تختفي
  const [showPassScreen, setShowPassScreen] = useState(true);

  // عدد جولات التخمين
  // أقل شيء جولتين
  const guessRounds = Math.max(2, players.length - 2);

  // دالة اختيار نوع المشاركة
  function chooseType(type) {
    // حفظ النوع المختار
    setEntryType(type);

    // إظهار شاشة تمرير الجوال
    setShowPassScreen(true);

    // الانتقال لمرحلة الكتابة
    setPhase("writing");
  }

  // اختيار عبارة عشوائية للاعب معيّن حسب ترتيبه
  function chooseEntryForIndex(playerIndex, allEntries) {
    // نحدد اللاعب من قائمة اللاعبين
    const player = players[playerIndex];

    // إذا وصلتنا عبارات نستخدمها
    // إذا لا نستخدم entries الموجودة في state
    const sourceEntries = allEntries || entries;

    // اختيار عبارة عشوائية لا تخص هذا اللاعب
    const entry = pickRandomEntryForPlayer(player, sourceEntries);

    // حفظ العبارة الحالية
    setCurrentEntry(entry);
  }

  // حفظ مشاركة اللاعب الحالي
  function saveEntry() {
    // منع الحفظ إذا كان النص فارغ
    if (text.trim() === "") {
      alert("لا يمكن حفظه فارغاً");
      return;
    }

    // اللاعب الحالي في مرحلة الكتابة
    const currentPlayer = players[writingIndex];

    // إنشاء مشاركة جديدة
    const newEntry = {
      player: currentPlayer,
      text: text.trim()
    };

    // إضافة المشاركة الجديدة إلى المشاركات السابقة
    const updatedEntries = [...entries, newEntry];

    // حفظ المشاركات
    setEntries(updatedEntries);

    // تفريغ مربع الكتابة
    setText("");

    // إذا فيه لاعب بعد اللاعب الحالي
    if (writingIndex < players.length - 1) {
      // ننتقل للاعب التالي
      setWritingIndex(writingIndex + 1);

      // نظهر شاشة التمرير
      setShowPassScreen(true);
    } else {
      // إذا انتهى كل اللاعبين من الكتابة
      const initialScores = {};

      // نبدأ نقاط كل لاعب من صفر
      players.forEach((player) => {
        initialScores[player] = 0;
      });

      // حفظ النقاط
      setScores(initialScores);

      // بدء التخمين
      startGuessing(updatedEntries);
    }
  }

  // بدء مرحلة التخمين
  function startGuessing(allEntries) {
    // نبدأ من أول لاعب
    setGuessingIndex(0);

    // نبدأ من الجولة الأولى
    setCurrentRound(1);

    // اختيار أول عبارة لأول لاعب
    chooseEntryForIndex(0, allEntries);

    // إظهار شاشة تمرير الجوال
    setShowPassScreen(true);

    // الانتقال لمرحلة التخمين
    setPhase("guessing");
  }

  // تنفيذ التخمين
  function makeGuess(selectedPlayer) {
    // اللاعب الحالي الذي يخمن
    const currentPlayer = players[guessingIndex];

    // التحقق هل اختار صاحب العبارة الصحيح
    const isCorrect = selectedPlayer === currentEntry.player;

    // إذا الإجابة صحيحة
    if (isCorrect) {
      // نزيد نقطة للاعب الحالي
      setScores((previousScores) => ({
        ...previousScores,
        [currentPlayer]: previousScores[currentPlayer] + 1
      }));
    }

    // الانتقال للدور التالي
    goToNextGuess();
  }

  // الانتقال إلى التخمين التالي
  function goToNextGuess() {
    // هل يوجد لاعب بعد اللاعب الحالي في نفس الجولة؟
    const hasNextPlayer = guessingIndex < players.length - 1;

    if (hasNextPlayer) {
      // ترتيب اللاعب التالي
      const nextIndex = guessingIndex + 1;

      // تحديث اللاعب الحالي
      setGuessingIndex(nextIndex);

      // اختيار عبارة للاعب التالي
      chooseEntryForIndex(nextIndex);

      // إظهار شاشة تمرير الجوال
      setShowPassScreen(true);
    } else {
      // إذا انتهى كل اللاعبين في الجولة الحالية
      const hasNextRound = currentRound < guessRounds;

      if (hasNextRound) {
        // رقم الجولة التالية
        const nextRound = currentRound + 1;

        // نرجع لأول لاعب
        setGuessingIndex(0);

        // تحديث رقم الجولة
        setCurrentRound(nextRound);

        // اختيار عبارة لأول لاعب
        chooseEntryForIndex(0);

        // إظهار شاشة تمرير الجوال
        setShowPassScreen(true);
      } else {
        // إذا انتهت كل الجولات ننتقل للنتائج
        setPhase("results");
      }
    }
  }

  // إذا ما فيه لاعبين محفوظين
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

  // شاشة اختيار نوع المشاركة
  if (phase === "type") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>من قالها؟ 😂</h1>

          <p style={textStyle}>اختاروا نوع المشاركة</p>

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

  // شاشة الكتابة
  if (phase === "writing") {
    // اللاعب الحالي
    const currentPlayer = players[writingIndex];

    return (
      <div style={pageStyle}>
        {/* نافذة تمرير الجوال */}
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

          <p style={textStyle}>اكتب {entryType}</p>

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

  // شاشة التخمين
  if (phase === "guessing") {
    // اللاعب الحالي الذي يخمن
    const currentPlayer = players[guessingIndex];

    // خيارات التخمين بدون اسم اللاعب الحالي
    const guessOptions = players.filter((player) => player !== currentPlayer);

    return (
      <div style={pageStyle}>
        {/* نافذة تمرير الجوال */}
        {showPassScreen && (
          <PassOverlay
            playerName={currentPlayer}
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

          {guessOptions.map((player) => (
            <button
              key={player}
              style={mainButton}
              onClick={() => makeGuess(player)}
            >
              {player}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // شاشة النتائج
  if (phase === "results") {
    // تحويل النقاط من Object إلى Array وترتيبها
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    // أعلى نتيجة
    const highestScore = Math.max(...sortedScores.map(([, score]) => score));

    // التحقق هل الكل متعادل
    const allPlayersTied = sortedScores.every(
      ([, score]) => score === highestScore
    );

    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>النتائج 🏆</h1>

          {allPlayersTied && (
            <p style={textStyle}>تعادل جميل بين الجميع 😄</p>
          )}

          {sortedScores.map(([player, score]) => (
            <div key={player} style={resultItemStyle}>
              {score === highestScore && highestScore > 0 && !allPlayersTied
                ? "👑 "
                : ""}

              {player} — {score} نقطة
            </div>
          ))}

          <button style={mainButton} onClick={() => navigate("/games")}>
            رجوع للألعاب
          </button>
        </div>
      </div>
    );
  }
}

// دالة اختيار عبارة عشوائية لا تخص اللاعب الحالي
function pickRandomEntryForPlayer(player, allEntries) {
  // نستبعد عبارات اللاعب نفسه
  const availableEntries = allEntries.filter(
    (entry) => entry.player !== player
  );

  // إذا ما فيه عبارات مناسبة
  if (availableEntries.length === 0) {
    return null;
  }

  // اختيار رقم عشوائي
  const randomIndex = Math.floor(Math.random() * availableEntries.length);

  // إرجاع العبارة المختارة
  return availableEntries[randomIndex];
}

// مكوّن نافذة تمرير الجوال
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

// تنسيق الصفحة الرئيسية لكل مراحل اللعبة
const pageStyle = {
  // يجعل الصفحة بطول الشاشة كامل
  minHeight: "100vh",

  // لون الخلفية
  background: "#f7f5ff",

  // استخدام flex لتوسيط المحتوى
  display: "flex",

  // توسيط أفقي
  justifyContent: "center",

  // توسيط عمودي
  alignItems: "center",

  // مسافة داخلية
  padding: "24px",

  // يمنع زيادة الحجم بسبب padding
  boxSizing: "border-box",

  // خط التطبيق
  fontFamily: "Cairo, sans-serif"
};

// تنسيق الكرت الأبيض
const cardStyle = {
  // خلفية الكرت
  background: "white",

  // عرض الكرت كامل داخل المساحة
  width: "100%",

  // أقصى عرض للكرت
  maxWidth: "480px",

  // مسافة داخلية
  padding: "28px",

  // تدوير الحواف
  borderRadius: "24px",

  // محاذاة النص في الوسط
  textAlign: "center",

  // ظل خفيف للكرت
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

// تنسيق العناوين
const titleStyle = {
  // اللون البنفسجي الأساسي
  color: "#6C4CF1",

  // إزالة المسافة العلوية الافتراضية
  marginTop: 0
};

// تنسيق النصوص العادية
const textStyle = {
  // لون رمادي مريح
  color: "#777",

  // تباعد الأسطر
  lineHeight: 1.8
};

// تنسيق الزر الأساسي
const mainButton = {
  // عرض الزر كامل
  width: "100%",

  // مسافة فوق الزر
  marginTop: "12px",

  // مسافة داخلية
  padding: "14px",

  // لون الخلفية
  background: "#6C4CF1",

  // لون النص
  color: "white",

  // إزالة الحدود
  border: "none",

  // تدوير الزر
  borderRadius: "14px",

  // حجم الخط
  fontSize: "17px",

  // سماكة الخط
  fontWeight: 700,

  // شكل المؤشر عند المرور
  cursor: "pointer",

  // خط Cairo
  fontFamily: "Cairo, sans-serif"
};

// تنسيق مربع الكتابة
const textareaStyle = {
  // عرض كامل
  width: "100%",

  // ارتفاع أدنى
  minHeight: "120px",

  // مسافة داخلية
  padding: "14px",

  // تدوير الحواف
  borderRadius: "14px",

  // حدود خفيفة
  border: "1px solid #ddd",

  // حجم الخط
  fontSize: "16px",

  // خط Cairo
  fontFamily: "Cairo, sans-serif",

  // يحسب padding ضمن العرض
  boxSizing: "border-box",

  // يمنع تغيير حجم مربع الكتابة
  resize: "none"
};

// تنسيق العبارة أثناء التخمين
const quoteStyle = {
  // خلفية فاتحة
  background: "#f7f5ff",

  // مسافة داخلية
  padding: "20px",

  // تدوير الحواف
  borderRadius: "18px",

  // حجم الخط
  fontSize: "22px",

  // خط سميك
  fontWeight: 700,

  // لون النص
  color: "#333",

  // مسافة فوق وتحت
  margin: "20px 0"
};

// تنسيق عنصر النتيجة لكل لاعب
const resultItemStyle = {
  // خلفية فاتحة
  background: "#f7f5ff",

  // مسافة داخلية
  padding: "14px",

  // تدوير الحواف
  borderRadius: "14px",

  // مسافة تحت كل نتيجة
  marginBottom: "10px",

  // خط سميك
  fontWeight: 700
};

// خلفية نافذة تمرير الجوال
const overlayStyle = {
  // تثبيت النافذة فوق كل الصفحة
  position: "fixed",

  // تغطي كامل الشاشة
  inset: 0,

  // خلفية داكنة شفافة
  background: "rgba(20, 16, 40, 0.55)",

  // تغبيش الخلفية
  backdropFilter: "blur(8px)",

  // flex للتوسيط
  display: "flex",

  // توسيط أفقي
  justifyContent: "center",

  // توسيط عمودي
  alignItems: "center",

  // مسافة داخلية
  padding: "24px",

  // حساب padding ضمن الحجم
  boxSizing: "border-box",

  // تجعل النافذة فوق كل العناصر
  zIndex: 100
};

// كرت نافذة تمرير الجوال
const overlayCardStyle = {
  // خلفية بيضاء
  background: "white",

  // عرض كامل داخل النافذة
  width: "100%",

  // أقصى عرض
  maxWidth: "420px",

  // مسافة داخلية
  padding: "28px",

  // تدوير الحواف
  borderRadius: "24px",

  // توسيط النص
  textAlign: "center",

  // ظل واضح
  boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
};