document.getElementById('searchButton').addEventListener('click', searchParts);
document.getElementById('partNumberInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchParts();
    }
});

async function searchParts() {
    const partNumber = document.getElementById('partNumberInput').value;
    const resultsContainer = document.getElementById('resultsContainer');
    const loader = document.getElementById('loader');
    const searchButton = document.getElementById('searchButton');

    if (!partNumber) {
        alert('Please enter a part number.');
        return;
    }

    // IMPORTANT: Replace this with your actual n8n Webhook URL
    const webhookUrl = 'https://transformco.app.n8n.cloud/webhook/2ba40be1-81c1-43cf-874a-e08b0f0ad97a';

    resultsContainer.innerHTML = '';
    loader.style.display = 'block';
    searchButton.disabled = true;

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ partNumber: partNumber })
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const results = await response.json();
        displayResults(results);

    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = `<p style="color: red;">An error occurred. Please check the console and your n8n workflow.</p>`;
    } finally {
        loader.style.display = 'none';
        searchButton.disabled = false;
    }
}

function displayResults(results) {
    const container = document.getElementById('resultsContainer');
    if (results.length === 0) {
        container.innerHTML = '<p>No results found.</p>';
        return;
    }

    results.forEach(result => {
        if (result.price === "Not Found" && result.name === "Not Found") return;

        const card = document.createElement('div');
        card.className = 'result-card';

        const title = result.name === "Not Found" ? `Result from ${result.site}` : result.name;
        const price = result.price === "Not Found" ? "Price not available" : result.price;
        const availability = result.availability;

        card.innerHTML = `
            <h3><a href="${result.url}" target="_blank">${title}</a></h3>
            <p><strong>Website:</strong> ${result.site}</p>
            <p><strong>Price:</strong> ${price}</p>
            <p><strong>Availability:</strong> <span style="color: ${availability === 'In Stock' ? 'green' : 'red'};">${availability}</span></p>
        `;
        container.appendChild(card);
    });
}
