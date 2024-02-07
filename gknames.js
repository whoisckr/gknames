(function () {
    const MAX_LOCAL_STORAGE_SIZE = 5 * 1024 * 1024; // 5 MB

    async function loadConversionMap() {
        try {
            const timestamp = Date.now();
            const response = await fetch(`map.json?${timestamp}`);
            const conversionMap = await response.json();
            return conversionMap;
        } catch (error) {
            console.error('Error loading conversion map:', error);
            return null;
        }
    }

    function convertName(koreanName, conversionMap) { // just outputs rom, see copyConvert for formats
        if (!conversionMap) {
            console.error('Conversion map not loaded.');
            return null;
        }

        let romanizedName = '';
        let isFirstChar = true; // prevents extra space before first char

        for (const char of koreanName) {
            if (conversionMap[char]) {
                if (!isFirstChar) {
                    romanizedName += ' ';
                }
                romanizedName += conversionMap[char];
                isFirstChar = false;
            } else {
                //console.log(`Character not found in conversion map: ${char}`);
                romanizedName += char;
            }
        }

        return romanizedName;
    }

    async function copyConvert(format) { // formats rom name + copies to clipboard
        const koreanNameInput = document.getElementById('koreanName');
        const koreanName = koreanNameInput.value.trim();

        const conversionMap = await loadConversionMap();

        let resultText;

        if (format === 'romAndHan') {
            console.log('User Input:', koreanName);
            const romanizedName = await convertName(koreanName, conversionMap);
            resultText = `${romanizedName} (${koreanName})`;
        } else if (format === 'hanAndRom') {
            resultText = `${koreanName} (${await convertName(koreanName, conversionMap)})`;
        } else if (format === 'onlyRom') {
            resultText = await convertName(koreanName, conversionMap);
        } else {
            return;
        }

        try {
            logToHistory(koreanName, resultText);
            await navigator.clipboard.writeText(resultText);
        } catch (error) {
            console.error('Unable to copy to clipboard.', error);
        }
    }

    function logToHistory(koreanName, resultText) {
        if (koreanName === undefined || resultText === undefined) {
            return;
        }

        const history = JSON.parse(localStorage.getItem('conversionHistory')) || [];
        const timestamp = new Date().toISOString();
        history.push({ timestamp, resultText, koreanName });
        localStorage.setItem('conversionHistory', JSON.stringify(history));
        checkLocalStorageSize();
    }


    function downloadHistory() {
        const history = JSON.parse(localStorage.getItem('conversionHistory')) || [];
        const historyText = history.map(entry => `${new Date(entry.timestamp).toLocaleString()}: ${entry.koreanName}, ${entry.resultText}`).join('\n');
        const blob = new Blob([historyText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'conversion_history.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function clearHistory() {
        localStorage.removeItem('conversionHistory');
    }

    function checkLocalStorageSize() {
        if (localStorage && localStorage.length > MAX_LOCAL_STORAGE_SIZE) {
            localStorage.clear();
        }
    }

    document.getElementById('romAndHanBtn').addEventListener('click', () => copyConvert('romAndHan'));
    document.getElementById('hanAndRomBtn').addEventListener('click', () => copyConvert('hanAndRom'));
    document.getElementById('onlyRomBtn').addEventListener('click', () => copyConvert('onlyRom'));
    document.getElementById('downloadHistoryButton').addEventListener('click', downloadHistory);
    document.getElementById('clearHistoryButton').addEventListener('click', clearHistory);
})();
