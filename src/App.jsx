import { useState } from "react";
import { Loader, Placeholder } from "@aws-amplify/ui-react";
import "./App.css";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

// Không cần khai báo type <Schema> trong môi trường JS thuần
const amplifyClient = generateClient({
  authMode: "userPool",
});

function App() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Xóa bỏ type định dạng sự kiện (event) của TypeScript
  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      
      // Vẫn gọi qua interface askBedrock nhưng dữ liệu do Gemini xử lý
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

  return (
    <main className="app-container">
      <header className="app-header">
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
  );
}

export default App;