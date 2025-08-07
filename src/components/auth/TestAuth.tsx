import { useEffect, useState } from "react";

function TestAuth() {
  const [message, setMessage] = useState("Loading...");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_SERVER_URI + "/auth/test");
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.text();
        setMessage(data);
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="test-auth-container">
      <h2>Auth API Test</h2>
      {loading ? (
        <p>Loading data from API...</p>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="api-response">
          <p>Response from API:</p>
          <pre>{message}</pre>
        </div>
      )}
    </div>
  );
}

export default TestAuth;