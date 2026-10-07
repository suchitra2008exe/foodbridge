
import { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    fetch("http://localhost:5000/api/test")
      .then((response) => {
        if (!response.ok) {
          throw new Error("API request failed");
        }
        return response.json();
      })
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        console.error(error);
        setMessage("Failed to connect to backend");
      });
  }, []);

  return (
    <main>
      <h1>🌱 FoodBridge</h1>
      <h2>Rescue Food. Reduce Waste.</h2>
      <p>{message}</p>
    </main>
  );
}

export default App;
