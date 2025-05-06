const SPREADSHEET_ID = '1DzWC671BAulfVOoCStL9n2_6iC4zFRhGVMFCSxg5f20';
const API_KEY = 'AIzaSyA78gUHhzwWTi6f45X5XgA9f-jv42H_3jk';
const RANGE = 'CardList!A2:C'; // データがA2から始まるように修正

async function getCardData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        let values = data.values; // valuesの定義をtryブロック内に移動

        if (values && values.length > 0) {
            const cardData = values.map(row => ({
                cardNumber: row[0],
                cardName: row[2]
            }));
            displayCardList(cardData);
            return cardData;
        } else {
            console.error('カードデータが見つかりませんでした。');
            displayCardList([]); // 空の配列を渡して、空のリストを表示
            return [];
        }
    } catch (error) {
        console.error('カードデータの取得中にエラーが発生しました:', error);
        displayCardList([]); // エラー発生時も空の配列を渡す
        return [];
    }
}

function displayCardList(cardData) {
    const cardListElement = document.getElementById('card-list');
    cardListElement.innerHTML = '';

    cardData.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');

        // カード番号の最初の数字を取得してバージョン情報を生成
        let version = card.cardNumber.split('-')[0];
        // バージョン情報が1桁の場合、先頭に0を追加
        version = version.length === 1 ? '0' + version : version;
        const imageUrl = `https://ange-unite.com/_assets_/hjangeunite/cardlist${version}/large/${card.cardNumber}.png`;

        cardElement.innerHTML = `
            <img src="${imageUrl}" alt="${card.cardName}">
            <p>${card.cardName}</p>
        `;
        cardListElement.appendChild(cardElement);
    });
}

getCardData();