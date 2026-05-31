import { useNavigate } from "react-router-dom";

export default function BringItFast() {

  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#F7F5FF",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px",
        fontFamily: "Cairo, sans-serif"
      }}
    >
      <div
        style={{
          background: "#FFF3C7",
          padding: "30px",
          borderRadius: "32px",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center"
        }}
      >
        <h1
          style={{
            color: "#6C4CF1",
            fontSize: "34px",
            fontWeight: "900"
          }}
        >
          ⚡ جيبها بسرعة
        </h1>

        <p>
          قريبًا...
        </p>

        <button
          onClick={() => navigate("/games")}
          style={{
            marginTop: "20px",
            background: "#6C4CF1",
            color: "white",
            border: "none",
            borderRadius: "24px",
            padding: "14px 24px",
            cursor: "pointer"
          }}
        >
          رجوع
        </button>
      </div>
    </div>
  );
}