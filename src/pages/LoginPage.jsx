// src/pages/LoginPage.jsx
export default function LoginPage({ onLogin }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="app-shell">
      <div className="card">
        <h1>VitiSense – Sign In</h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            placeholder="farmer@example.com"
            type="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            placeholder="••••••••"
            required
          />

          <button type="submit" className="button-primary">
            Login
          </button>
        </form>

       
      </div>
    </div>
  );
}

