import { useState } from "react";
import { Loader, Placeholder, Authenticator } from "@aws-amplify/ui-react"; // <-- Import thêm Authenticator
import "./App.css";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

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

    try {
      const formData = new FormData(event.currentTarget);
      
      const { data, errors } = await amplifyClient.queries.askBedrock({
        ingredients: [formData.get("ingredients")?.toString() || ""],
      });

      if (!errors) {
        setResult(data?.body || "No data returned");
      } else {
        console.error("GraphQL Errors:", errors);
      }
    } catch (e) {
      alert(`An error occurred: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  // Bọc toàn bộ giao diện trong <Authenticator>
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main className="app-container">
          <header className="app-header">
            {/* Nút đăng xuất để quản lý phiên làm việc */}
            <div style={{ textAlign: 'right', padding: '10px' }}>
              <button onClick={signOut} style={{ padding: '5px 10px', cursor: 'pointer' }}>
                Sign out
              </button>
            </div>
            <h1>Meet Your Personal</h1>
            <h2>Gemini Recipe AI</h2>
            <p>
              Simply type a few ingredients using the format ingredient1, ingredient2, 
              etc., and Gemini AI will generate an all-new recipe on demand...
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
              result && <div className="result-content">{result}</div>
            )}
          </section>
        </main>
      )}
    </Authenticator>
  );
}

export default App;