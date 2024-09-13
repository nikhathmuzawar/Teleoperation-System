document.getElementById('login').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            window.location.href = 'index.html'; 
        } else {
            alert('Invalid username or password');
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
});
