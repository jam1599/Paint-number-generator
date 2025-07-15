console.log('JavaScript is working!');
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    const root = document.getElementById('root');
    if (root) {
        console.log('Root element found');
        root.innerHTML = `
            <div style="padding: 20px; background-color: red; color: white; text-align: center;">
                <h1>BASIC TEST - If you see this, HTML/JS is working!</h1>
                <p>This is pure HTML/JavaScript without React</p>
                <p>Date: ${new Date().toLocaleString()}</p>
            </div>
        `;
    } else {
        console.error('Root element not found!');
    }
});
