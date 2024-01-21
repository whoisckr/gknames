(function () {
    async function loadConversionMap() {
        try {
            const cacheBuster = Date.now();
            const response = await fetch(`map.json?${cacheBuster}`);
            const jsonData = await response.json();
            return jsonData;
        } catch (error) {
            console.error('Error loading conversion map:', error);
            console.log('Raw JSON response:', await response.text());
            return null;
        }
    }

    async function convertName(koreanName, conversionMap) {
        if (!conversionMap) {
            console.error('Conversion map not loaded.');
            return null;
        }

        let convertedName = '';
        let isFirstConversion = true;

        for (const char of koreanName) {
            if (conversionMap[char]) {
                if (!isFirstConversion) {
                    convertedName += ' ';
                }
                convertedName += conversionMap[char];
                isFirstConversion = false;
            } else {
                //console.log(`Character not found in conversion map: ${char}`);
                convertedName += char;
            }
        }

        return convertedName;
    }

    async function copyOrConvert(format) {
        const resultParagraph = document.getElementById('result');
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
            await navigator.clipboard.writeText(resultText);
        } catch (err) {
            console.error('Unable to copy to clipboard.', err);
        }
    }

    // Link event to button
    document.getElementById('romAndHanBtn').addEventListener('click', () => copyOrConvert('romAndHan'));
    document.getElementById('hanAndRomBtn').addEventListener('click', () => copyOrConvert('hanAndRom'));
    document.getElementById('onlyRomBtn').addEventListener('click', () => copyOrConvert('onlyRom'));
})();
