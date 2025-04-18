// Automatically load collection when page loads
window.addEventListener('load', () => {
    // Replace with your actual GitHub CSV URL
    const csvUrl = 'https://raw.githubusercontent.com/glad7/glad7.github.io/main/collection.csv';
    loadCollection(csvUrl);
});

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