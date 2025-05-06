const SPREADSHEET_ID = '1DzWC671BAulfVOoCStL9n2_6iC4zFRhGVMFCSxg5f20';
const API_KEY = 'AIzaSyA78gUHhzwWTi6f45X5XgA9f-jv42H_3jk';
const RANGE = 'CardList!A2:C'; // データがA2から始まる

async function getCardData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        const data = await response.json();
        const values = data.values || [];

        if (values.length > 0) {
            const cardData = values.map(row => ({
                cardNumber: row[0] || '不明',
                cardName: row[2] || '名称不明'
            }));
            displayCardList(cardData);
            return cardData;
        } else {
            console.error('カードデータが見つかりませんでした。');
            displayCardList([]);
            return [];
        }
    } catch (error) {
        console.error('カードデータの取得中にエラーが発生しました:', error);
        console.error('エラーの詳細:', error.stack); // エラーの詳細情報をログ出力
        displayCardList([]);
        return [];
    }
}

function displayCardList(cardData) {
    const cardListElement = document.getElementById('card-list');
    cardListElement.innerHTML = '';

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

        // エラーハンドリング：画像が存在しない場合は非表示
        cardImage.onerror = () => {
            cardImage.style.display = 'none';
        };

        // カード名の分割処理（存在しない場合はデフォルト表示）
        const names = card.cardName ? card.cardName.split(' ') : ['名称不明'];
        let cardName = names[0];
        let characterName = names.length > 1 ? names.slice(1).join(' ') : null;

        let cardText = cardImage.outerHTML;
        cardText += `<p>${cardName}</p>`;
        if (characterName) {
            cardText += `<p>${characterName}</p>`;
        }
        cardText += `<p>${card.cardNumber}</p>`;

        cardElement.innerHTML = cardText; // ここでカード画像要素がDOMに追加される

        // イベントリスナーをDOMに追加された後で設定
        const addedCardImage = cardElement.querySelector('img'); // 追加されたカード画像要素を取得
        if (addedCardImage) { // カード画像要素が存在する場合のみイベントリスナーを設定
            addedCardImage.addEventListener('click', () => {
                console.log('画像がクリックされました');
                console.log('largeUrl:', largeUrl);
                const modal = document.getElementById('image-modal');
                const modalImage = document.getElementById('modal-image');
                modal.style.display = 'block';
                modalImage.src = largeUrl;
            });
        }

        cardListElement.appendChild(cardElement);
    });

    // モーダルの表示と非表示
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

// 初回データ取得
getCardData();