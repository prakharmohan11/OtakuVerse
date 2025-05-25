const TestIndex = () => {
  console.log("TestIndex component is rendering!");
  
  return (
    <div style={{ 
      padding: '20px', 
      color: 'white', 
      backgroundColor: 'red', 
      minHeight: '100vh',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🎌 OtakuVerse Test Index 🎌</h1>
      <p style={{ fontSize: '20px', marginBottom: '20px' }}>This is a test page to verify routing works!</p>
      <div style={{ marginTop: '30px' }}>
        <div style={{ marginBottom: '10px' }}>✅ React is working</div>
        <div style={{ marginBottom: '10px' }}>✅ TypeScript is compiling</div>
        <div style={{ marginBottom: '10px' }}>✅ Vite is serving</div>
        <div style={{ marginBottom: '10px' }}>✅ Component is rendering</div>
      </div>
      <nav style={{ marginTop: '40px' }}>
        <a href="/anime" style={{ color: 'yellow', marginRight: '20px', fontSize: '18px' }}>Anime Library</a>
        <a href="/communities" style={{ color: 'yellow', marginRight: '20px', fontSize: '18px' }}>Communities</a>
        <a href="/marketplace" style={{ color: 'yellow', fontSize: '18px' }}>Marketplace</a>
      </nav>
    </div>
  );
};

export default TestIndex;