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

        const resultData = await response.json();

        // --- THIS IS THE PROOF ---
        // This will show you exactly what data n8n sent to your website.
        console.log("RAW DATA RECEIVED FROM N8N:", resultData);
        // ------------------------
        
        // The rest of this code tries to fix the data if it's broken
        let itemsArray = [];
        if (Array.isArray(resultData)) {
            itemsArray = resultData;
        } else if (resultData && typeof resultData === 'object') {
            itemsArray = [resultData];
        }
        
        displayResults(itemsArray);

    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = `<p style="color: red;">An error occurred.</p>`;
    } finally {
        loader.style.display = 'none';
        searchButton.disabled = false;
    }
}

function displayResults(results) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = ''; // Clear previous results

    if (!results || results.length === 0) {
        container.innerHTML = '<p>No results found.</p>';
        return;
    }

    results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'result-card';
        const title = result.site || 'Unknown Site';
        const price = result.price || 'Not available';
        const availability = result.availability || 'Not specified';
        const url = result.url || '#';
        card.innerHTML = `
            <h3><a href="${url}" target="_blank">${title}</a></h3>
            <p><strong>Price:</strong> ${price}</p>
            <p><strong>Availability:</strong> <span style="color: ${availability && availability.toUpperCase().includes('IN STOCK') ? 'green' : 'red'};">${availability}</span></p>
        `;
        container.appendChild(card);
    });
}
