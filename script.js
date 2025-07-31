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

    const webhookUrl = 'https://transformco.app.n8n.cloud/webhook/2ba40be1-81c1-43cf-874a-e08b0f0ad97a'; // Make sure this is your Production URL

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

        // NEW: Check if the response from n8n is an array.
        // If it's not an array, it's probably an error object from the workflow.
        if (!Array.isArray(results)) {
            // Throw an error to be caught by the catch block below.
            const errorMessage = results.error || JSON.stringify(results);
            throw new Error(`The workflow returned an error: ${errorMessage}`);
        }

        displayResults(results);

    } catch (error) {
        console.error('Error:', error);
        // This block now displays network errors AND workflow errors on the page.
        resultsContainer.innerHTML = `<p style="color: red;">An error occurred. Please check the n8n execution log for details.</p><p style="color: #666; font-size: 0.8rem;">Details: ${error.message}</p>`;
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
        if (result.error) {
            console.warn("Skipping result with error:", result);
            return;
        }

        const card = document.createElement('div');
        card.className = 'result-card';

        const title = result.site || 'Unknown Site';
        const price = result.price || 'Not available';
        const availability = result.availability || 'Not specified';
        const url = result.url || '#';

        card.innerHTML = `
            <h3><a href="${url}" target="_blank">${title}</a></h3>
            <p><strong>Price:</strong> ${price}</p>
            <p><strong>Availability:</strong> <span style="color: ${availability.toUpperCase().includes('IN STOCK') ? 'green' : 'red'};">${availability}</span></p>
        `;

        container.appendChild(card);
    });
}
