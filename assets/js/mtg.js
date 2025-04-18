// Automatically load collection when page loads
window.addEventListener('load', () => {
    // Replace with your actual GitHub CSV URL
    const csvUrl = 'https://raw.githubusercontent.com/Glad7/glad7.github.io/refs/heads/main/assets/js/my-cards.csv';
    loadCollection(csvUrl);
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadCollection(csvUrl) {
    try {
        showStatus('Loading collection...');
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Failed to load collection');
        
        const csvData = await response.text();
        const cards = parseCSV(csvData);
        
        showStatus('');
        await displayCards(cards);
    } catch (error) {
        showStatus(`Error: ${error.message}`, true);
        console.error('Loading failed:', error);
    }
}

// Keep existing helper functions unchanged from previous answer:
// parseCSV, displayCards, fetchCardData, createCardElement, showStatus

function parseCSV(csvData) {
    return csvData.split('\n')
        .slice(1) // Remove header
        .map(line => line.trim())
        .filter(line => line !== '');
}

async function displayCards(cardNames) {
    const container = document.getElementById('cardContainer');
    container.innerHTML = ''; // Clear previous results

    for (const cardName of cardNames) {
        try {
            const cardData = await fetchCardData(cardName.trim());
            const cardElement = createCardElement(cardData);
            container.appendChild(cardElement);
        } catch (error) {
            console.error(`Error fetching ${cardName}:`, error);
        }
    }
}

async function fetchCardData(cardName) {
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`);
    if (!response.ok) throw new Error('Card not found');
    sleep(100);
    return response.json();
}

function createCardElement(cardData) {
    const section = document.createElement('section');
    section.className = 'spotlight';

    section.innerHTML = `
        <div class="content">
            <div class="inner">
                <h2>${cardData.name}</h2>
                <p>${cardData.type_line}</p>
                <p>${cardData.oracle_text}</p>
            </div>
        </div>
        <a href="#" class="image">
            <img src="${cardData.image_uris?.normal || 'images/placeholder.jpg'}" 
                 alt="${cardData.name}" 
                 data-position="center center" />
        </a>
    `;
    return section;
}

function showStatus(message, isError = false) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = isError ? 'error' : '';
}    
