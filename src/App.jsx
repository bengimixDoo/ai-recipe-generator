import { useState } from "react";
import { Loader, Placeholder, Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";

Amplify.configure(outputs);

const amplifyClient = generateClient({
  authMode: "userPool",
});

function App() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(""); // Clear kết quả cũ trước khi gọi request mới

    try {
      const formData = new FormData(event.currentTarget);
      const ingredientsInput = formData.get("ingredients")?.toString() || "";

      // Tách chuỗi nhập vào (ví dụ "chicken, rice") thành mảng ["chicken", "rice"]
      const ingredients = ingredientsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const { data, errors } = await amplifyClient.queries.askBedrock({
        ingredients,
      });

      // 1. Kiểm tra nếu có lỗi ở tầng GraphQL (Mạng, Auth, Schema...)
      if (errors && errors.length > 0) {
        console.error("GraphQL Errors:", errors);
        setResult(`Lỗi GraphQL: ${errors[0].message}`);
        return;
      }

      // 2. Kiểm tra dữ liệu trả về từ Resolver
      if (data) {
        if (data.error) {
          // Bóc tách thông báo lỗi thực sự từ Gemini / AWS AppSync
          setResult(`Lỗi Backend: ${data.error}`);
        } else if (data.body) {
          setResult(data.body);
        } else {
          setResult("Không có dữ liệu công thức trả về.");
        }
      } else {
        setResult("Server không trả về dữ liệu.");
      }
    } catch (e) {
      console.error("Client Exception:", e);
      setResult(`Lỗi ứng dụng: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main className="app-container">
          <header className="app-header">
            <div style={{ textAlign: "right", padding: "10px" }}>
              <button
                onClick={signOut}
                style={{ padding: "5px 10px", cursor: "pointer" }}
              >
                Sign out
              </button>
            </div>
            <h1>Meet Your Personal</h1>
            <h2>Gemini Recipe AI</h2>
            <p>
              Simply type a few ingredients using the format ingredient1,
              ingredient2, etc., and Gemini AI will generate an all-new recipe
              on demand...
            </p>
          </header>

          <form onSubmit={onSubmit} className="form-container">
            <div className="search-container">
              <input
                type="text"
                name="ingredients"
                placeholder="e.g. chicken, rice, garlic"
                required
              />
              <button type="submit" disabled={loading}>
                Generate
              </button>
            </div>
          </form>

          <section className="result-container">
            {loading ? (
              <div className="loader-container">
                <p>Gemini is thinking...</p>
                <Loader size="large" />
                <Placeholder size="large" />
                <Placeholder size="large" />
                <Placeholder size="large" />
              </div>
            ) : (
              result && (
                <div
                  className="result-content"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {result}
                </div>
              )
            )}
          </section>
        </main>
      )}
    </Authenticator>
  );
}

export default App;