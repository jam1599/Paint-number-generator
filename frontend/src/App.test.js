import React from 'react';

function AppTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'blue', textAlign: 'center' }}>Paint by Numbers Generator - Basic Test</h1>
      <p style={{ textAlign: 'center', fontSize: '18px' }}>
        This is a super simple test without Material-UI.
      </p>
      <p style={{ textAlign: 'center', color: 'green' }}>
        If you see this, basic React is working!
      </p>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button style={{ padding: '10px 20px', fontSize: '16px' }}>
          Test Button
        </button>
      </div>
    </div>
  );
}

export default AppTest;
