// نستورد useState لتخزين اللاعبين والجمعات السابقة
import { useState } from "react";

// نستورد useNavigate للتنقل بين الصفحات
// ونستورد useParams لمعرفة اللعبة الحالية من الرابط
import { useNavigate, useParams } from "react-router-dom";


// صفحة إعداد اللاعبين
export default function SetupPlayers() {

  // نقرأ معرف اللعبة من الرابط
  // مثال: /play/who-said/setup
  const { gameId } = useParams();

  // نجهز أداة التنقل
  const navigate = useNavigate();


  // أسماء الألعاب
  const gameNames = {
    "who-said": "من قالها؟ 😂",
    "forbidden-word": " الكلمة الممنوعة🤫",
    "know-me": "من يعرفني أكثر؟ 👀"
  };


  // اللاعبين الحاليين في هذه الجولة
  // نبدأ بحقل واحد فاضي
  const [players, setPlayers] = useState([""]);


  // الجمعات السابقة
  // نقرأها من localStorage عند فتح الصفحة
  const [savedGroups, setSavedGroups] = useState(() => {

    // نحاول نقرأ الجمعات المحفوظة
    const data = localStorage.getItem("saved-groups");

    // إذا فيه بيانات، نحولها من نص إلى Array
    // إذا ما فيه، نرجع قائمة فاضية
    return data ? JSON.parse(data) : [];
  });


  // تحديث اسم لاعب معيّن
  function updatePlayer(index, value) {

    // ننسخ قائمة اللاعبين الحالية
    const newPlayers = [...players];

    // نغير اللاعب المطلوب
    newPlayers[index] = value;

    // نحدث الواجهة
    setPlayers(newPlayers);
  }


  // إضافة لاعب جديد
  function addPlayer() {

    // نضيف حقل فاضي جديد
    setPlayers([...players, ""]);
  }


  // حذف لاعب من القائمة الحالية
  function removePlayer(index) {

    // نحذف اللاعب حسب ترتيبه
    const newPlayers = players.filter((_, i) => i !== index);

    // نحدث القائمة
    setPlayers(newPlayers);
  }


  // اختيار جمعة محفوظة
  // سميناها selectSavedGroup بدل useSavedGroup
  // لأن React يعتبر أي دالة تبدأ بـ use كأنها Hook
  function selectSavedGroup(group) {

    // ننسخ لاعبين الجمعة المختارة إلى اللاعبين الحاليين
    setPlayers(group.players);

     // نطلع المستخدم لأعلى الصفحة عشان يشوف الأسماء
    window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
  }


  // حذف جمعة كاملة من الجمعات السابقة
  function deleteGroup(groupId) {

    // نحذف الجمعة التي لها نفس id
    const updatedGroups = savedGroups.filter((group) => group.id !== groupId);

    // نحدث الواجهة
    setSavedGroups(updatedGroups);

    // نحفظ التحديث في localStorage
    localStorage.setItem("saved-groups", JSON.stringify(updatedGroups));
  }


  // بدء الجولة
  function startGame() {

    // ننظف الأسماء:
    // نحذف المسافات ونستبعد الحقول الفاضية
    const cleanPlayers = players
      .map((name) => name.trim())
      .filter((name) => name !== "");


    // لازم يكون فيه 3 على الأقل
    if (cleanPlayers.length < 3) {
      alert("أضف 3 لاعبين على الأقل");
      return;
    }


    // ننشئ جمعة جديدة بتاريخ اليوم
    const newGroup = {
      id: Date.now(),
      date: new Date().toLocaleDateString("ar-SA"),
      players: cleanPlayers
    };


    // نضيف الجمعة الجديدة في أول القائمة
    const updatedGroups = [newGroup, ...savedGroups];


    // نحدث الجمعات في الواجهة
    setSavedGroups(updatedGroups);


    // نحفظ الجمعات في localStorage
    localStorage.setItem("saved-groups", JSON.stringify(updatedGroups));


    // نحفظ اللاعبين الحاليين عشان صفحة اللعبة تستخدمهم
    localStorage.setItem(
      "current-players",
      JSON.stringify(cleanPlayers)
    );


    // ننتقل لصفحة اللعبة
    navigate(`/play/${gameId}`);
  }


  return (
    <div style={{
      minHeight: "100vh",
      background: "#f7f5ff",
      padding: "24px",
      boxSizing: "border-box",
      fontFamily: "Cairo, sans-serif"
    }}>

      {/* عنوان اللعبة */}
      <h1 style={{
        color: "#6C4CF1",
        textAlign: "center",
        paddingBottom: "12px",
        fontSize: "50px",
        
      }}>
        {gameNames[gameId]}
      </h1>


      {/* كرت إعداد اللاعبين */}
      <div style={{
        background: "white",
        maxWidth: "500px",
        margin: "30px auto",
        padding: "24px",
        borderRadius: "24px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
      }}>

        {/* عنوان الكرت */}
        <h2 style={{ marginTop: 0 ,fontFamily: "Cairo, sans-serif"}}>
          من بيلعب معك؟ 👥
        </h2>


        {/* حقول اللاعبين */}
        {players.map((player, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "10px"
            }}
          >

            {/* حقل اسم اللاعب */}
            <input
              type="text"
              placeholder={`اسم اللاعب ${index + 1}`}
              value={player}
              onChange={(e) => updatePlayer(index, e.target.value)}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "14px",
                border: "1px solid #ddd",
                fontSize: "16px",
                fontFamily: "Cairo, sans-serif"
              }}
            />


            {/* زر حذف اللاعب */}
            <button
              onClick={() => removePlayer(index)}
              style={{
                padding: "0 14px",
                border: "none",
                borderRadius: "14px",
                background: "#ffeff3",
                color: "#d6336c",
                cursor: "pointer",
                fontFamily: "Cairo, sans-serif"
              }}
            >
              حذف
            </button>
          </div>
        ))}


        {/* زر إضافة لاعب */}
        <button
          onClick={addPlayer}
          style={{
            width: "100%",
            padding: "12px",
            background: "transparent",
            color: "#6C4CF1",
            border: "2px dashed #6C4CF1",
            borderRadius: "14px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Cairo, sans-serif"
          }}
        >
          + إضافة لاعب
        </button>


        {/* زر بدء الجولة */}
        <button
          onClick={startGame}
          style={{
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
          }}
        >
          ابدأ الجولة 🎮
        </button>


        {/* الجمعات السابقة تظهر فقط إذا فيه جمعات محفوظة */}
        {savedGroups.length > 0 && (
          <div style={{ marginTop: "28px" }}>

            <h3>الجمعات السابقة</h3>

            {savedGroups.map((group) => (
              <div
                key={group.id}
                style={{
                  background: "#f7f5ff",
                  padding: "14px",
                  borderRadius: "16px",
                  marginBottom: "12px"
                }}
              >

                {/* تاريخ الجمعة */}
                <strong>جمعة {group.date}</strong>


                {/* أسماء اللاعبين في الجمعة */}
                <p style={{ color: "#777", margin: "8px 0" }}>
                  {group.players.join(" - ")}
                </p>


                {/* زر استخدام الجمعة */}
                <button
                  onClick={() => selectSavedGroup(group)}
                  style={{
                    marginLeft: "8px",
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#6C4CF1",
                    color: "white",
                    cursor: "pointer",
                    fontFamily: "Cairo, sans-serif"
                  }}
                >
                  استخدام
                </button>


                {/* زر حذف الجمعة */}
                <button
                  onClick={() => deleteGroup(group.id)}
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#ffeff3",
                    color: "#d6336c",
                    cursor: "pointer",
                    fontFamily: "Cairo, sans-serif"
                  }}
                >
                  حذف الجمعة
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}