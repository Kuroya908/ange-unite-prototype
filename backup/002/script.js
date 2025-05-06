const SPREADSHEET_ID = '1DzWC671BAulfVOoCStL9n2_6iC4zFRhGVMFCSxg5f20';
const API_KEY = 'AIzaSyA78gUHhzwWTi6f45X5XgA9f-jv42H_3jk';
const RANGE = 'CardList!A2:E'; // データがA2から始まる

async function getCardData(version = null, keyword = null, type = null) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        const data = await response.json();
        const values = data.values || [];

        if (values.length > 0) {
            let cardData = values.map(row => ({
                cardNumber: row[0] || '不明',
                cardName: row[2] || '名称不明',
                cardType: row[4] || '不明'
            }));

            if (version) {
                const versionList = await getVersionList();
                const selectedVersion = versionList.find(v => String(v.version) === version.split('_')[0]);

                if (selectedVersion) {
                    cardData = cardData.filter(card => {
                        const cardVersion = card.cardNumber.split('-')[0] || '00';
                        const isFoil = card.cardNumber.includes('_foil');
                        const targetVersion = isFoil ? selectedVersion.foil : selectedVersion.normal;

                        if (card.cardNumber === 'omega' || card.cardNumber === 'sigma') {
                            return version === '1';
                        }

                        if (targetVersion === '未設定') {
                            return false;
                        }

                        if (isFoil) {
                            return version === (cardVersion + '_foil');
                        } else {
                            return version === cardVersion;
                        }
                    });
                }
            }

            if (keyword) {
                cardData = cardData.filter(card => {
                    return card.cardNumber.includes(keyword) || card.cardName.includes(keyword);
                });
            }

            if (type) {
                cardData = cardData.filter(card => {
                    return card.cardType === type;
                });
            }

            displayCardList(cardData);
            return cardData;
        } else {
            console.error('カードデータが見つかりませんでした。');
            displayCardList([]);
            return [];
        }
    } catch (error) {
        console.error('カードデータの取得中にエラーが発生しました:', error);
        console.error('エラーの詳細:', error.stack);
        displayCardList([]);
        return [];
    }
}

function displayCardList(cardData) {
    const cardListElement = document.getElementById('card-list');
    cardListElement.innerHTML = '';

    if (cardData.length === 0) {
        const messageElement = document.createElement('div');
        messageElement.textContent = 'カードが見つかりませんでした。';
        messageElement.classList.add('empty-message'); // クラスを追加
        cardListElement.appendChild(messageElement);
        return;
    }

    cardData.forEach(card => {
        if (!card.cardNumber) {
            console.error('カード番号がありません:', card);
            return;
        }

        const cardElement = document.createElement('div');
        cardElement.classList.add('card');

        let thumbUrl, largeUrl;
        if (card.cardNumber === 'omega' || card.cardNumber === 'sigma') {
            thumbUrl = `https://ange-unite.com/_assets_/hjangeunite/cardlist01/thum/${card.cardNumber}.png`;
            largeUrl = `https://ange-unite.com/_assets_/hjangeunite/cardlist01/large/${card.cardNumber}.png`;
        } else {
            // カード番号からバージョンを取得（例: 1-001 → version = 01）
            let version = card.cardNumber.split('-')[0] || '00';
            version = version.length === 1 ? '0' + version : version;

            thumbUrl = `https://ange-unite.com/_assets_/hjangeunite/cardlist${version}/thum/${card.cardNumber}.png`;
            largeUrl = `https://ange-unite.com/_assets_/hjangeunite/cardlist${version}/large/${card.cardNumber}.png`;
        }

        const cardImage = document.createElement('img');
        cardImage.src = thumbUrl;
        cardImage.alt = card.cardName;

        cardImage.onerror = () => {
            cardImage.style.display = 'none';
        };

        const names = card.cardName ? card.cardName.split(' ') : ['名称不明'];
        let cardName = names[0];
        let characterName = names.length > 1 ? names.slice(1).join(' ') : null;

        let cardText = cardImage.outerHTML;
        cardText += `<p>${cardName}</p>`;
        if (characterName) {
            cardText += `<p>${characterName}</p>`;
        }
        cardText += `<p>${card.cardNumber}</p>`;

        cardElement.innerHTML = cardText;

        const addedCardImage = cardElement.querySelector('img');
        if (addedCardImage) {
            addedCardImage.addEventListener('click', () => {
                const modal = document.getElementById('image-modal');
                const modalImage = document.getElementById('modal-image');
                modal.style.display = 'block';
                modalImage.src = largeUrl;
            });
        }

        cardListElement.appendChild(cardElement);
    });

    const modal = document.getElementById('image-modal');
    const modalClose = document.getElementsByClassName('modal-close')[0];

    modalClose.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

async function getVersionList() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/master!L2:M?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }
        const data = await response.json();
        const values = data.values || [];
        return values.map((row, index) => ({
            version: index + 1,
            normal: row[0] || '未設定',
            foil: row[1] || '未設定'
        }));
    } catch (error) {
        console.error('バージョンリストの取得中にエラーが発生しました:', error);
        return [];
    }
}

async function populateVersionSelect() {
    const versionList = await getVersionList();
    const versionSelect = document.getElementById('version-select');
    versionList.forEach(version => {
        const option = document.createElement('option');
        option.value = version.version;
        option.textContent = version.normal; // バージョン名をそのまま表示
        versionSelect.appendChild(option);

        const foilOption = document.createElement('option');
        foilOption.value = version.version + '_foil';
        foilOption.textContent = version.foil; // バージョン名をそのまま表示
        versionSelect.appendChild(foilOption);
    });
}

async function getCardTypeList() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/CardList!E2:E?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }
        const data = await response.json();
        const values = data.values || [];
        const types = new Set(values.flat()); // 重複を削除
        return Array.from(types);
    } catch (error) {
        console.error('カード種別リストの取得中にエラーが発生しました:', error);
        return [];
    }
}

async function populateTypeSelect() {
    const typeList = await getCardTypeList();
    const typeSelect = document.getElementById('type-select');
    typeList.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
}

document.getElementById('search-box').addEventListener('input', (event) => {
    const keyword = event.target.value;
    const type = document.getElementById('type-select').value; // typeを取得
    getCardData(null, keyword, type); // typeを渡す
});

document.getElementById('version-select').addEventListener('change', (event) => {
    const version = event.target.value;
    const type = document.getElementById('type-select').value; // typeを取得
    getCardData(version, null, type); // typeを渡す
});

document.getElementById('type-select').addEventListener('change', (event) => {
    const type = event.target.value;
    getCardData(null, null, type); // typeを渡す
});

document.getElementById('clear-button').addEventListener('click', () => {
    document.getElementById('search-box').value = '';
    document.getElementById('version-select').value = '';
    document.getElementById('type-select').value = ''; // カード種別をリセット
    displayCardList([]);
});

// 初期化
populateVersionSelect();
populateTypeSelect();
displayCardList([]);