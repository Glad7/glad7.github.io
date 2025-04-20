let allCards = [];
let currentCube = [];

// Load collection and initialize
async function init() {
    // Load CSV collection
    const response = await fetch('collection.csv');
    const csvData = await response.text();
    
    // Parse CSV
    const results = Papa.parse(csvData, { header: true });
    const scryfallIds = results.data.map(row => row.scryfall_id);
    
    // Batch fetch card data from Scryfall
    const cardData = await fetchScryfallData(scryfallIds);
    allCards = cardData;
    
    renderCards(allCards);
}

async function fetchScryfallData(ids) {
    const chunkSize = 75; // Scryfall's max per request
    const chunks = [];
    
    for (let i = 0; i < ids.length; i += chunkSize) {
        chunks.push(ids.slice(i, i + chunkSize));
    }

    const requests = chunks.map(async chunk => {
        const response = await fetch('https://api.scryfall.com/cards/collection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifiers: chunk.map(id => ({ id })) })
        });
        return await response.json();
    });

    const responses = await Promise.all(requests);
    return responses.flatMap(r => r.data);
}

function renderCards(cards) {
    const container = document.getElementById('card-container');
    container.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <img src="${card.image_uris?.normal || 'assets/card-back.jpg'}" 
                 alt="${card.name}">
            <h4>${card.name}</h4>
            <p>${card.mana_cost}</p>
        `;
        cardElement.addEventListener('click', () => addToCube(card));
        container.appendChild(cardElement);
    });
}

// Filtering functions
function filterCards() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const colorFilter = document.getElementById('color-filter').value;
    const typeFilter = document.getElementById('type-filter').value.toLowerCase();

    return allCards.filter(card => {
        return (card.name.toLowerCase().includes(searchTerm) &&
               (!colorFilter || card.colors?.includes(colorFilter)) &&
               (!typeFilter || card.type_line.toLowerCase().includes(typeFilter));
    });
}

// Cube management
function addToCube(card) {
    if (!currentCube.find(c => c.id === card.id)) {
        currentCube.push(card);
        updateCubeDisplay();
    }
}

function updateCubeDisplay() {
    const container = document.getElementById('cube-container');
    container.innerHTML = currentCube.map(card => `
        <div class="card">
            <img src="${card.image_uris?.small || 'assets/card-back.jpg'}" 
                 alt="${card.name}">
        </div>
    `).join('');
}

// Event Listeners
document.getElementById('apply-filters').addEventListener('click', () => {
    renderCards(filterCards());
});

document.getElementById('save-cube').addEventListener('click', () => {
    const cubeData = currentCube.map(card => ({
        id: card.id,
        name: card.name
    }));
    localStorage.setItem('savedCube', JSON.stringify(cubeData));
    alert('Cube saved!');
});

// Initialize
init();