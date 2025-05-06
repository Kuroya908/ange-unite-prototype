let deck = []; // デッキリスト

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

         // 追加ボタン
        const addButton = document.createElement('button');
        addButton.textContent = '+';
        addButton.classList.add('add-button');
        addButton.addEventListener('click', () => {
            addCardToDeck(card);
            updateCardCount(cardElement, 1); // 枚数を増やす
        });
         cardElement.appendChild(addButton);
 
         // 枚数表示
        const cardCount = document.createElement('span');
        cardCount.textContent = '0'; // 初期値
        cardCount.classList.add('card-count');
        cardElement.appendChild(cardCount);
        
        // 削除ボタン
        const removeButton = document.createElement('button');
        removeButton.textContent = '-';
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', () => {
            removeCardFromDeck(card.cardNumber);
            updateCardCount(cardElement, -1); // 枚数を減らす
        });
        cardElement.appendChild(removeButton);

        function updateCardCount(cardElement, change) {
            const cardCountElement = cardElement.querySelector('.card-count');
            let count = parseInt(cardCountElement.textContent) + change;
        
            // カード種別を取得
            const cardTypeElement = cardElement.parentElement.querySelector('p:nth-child(4)');
            if (cardTypeElement) {
                const cardType = cardTypeElement.textContent;
        
                if (cardType.includes('FRAME')) { // FRAMEカードの場合
                    if (count > 12) {
                        count = 12; // 12を超えないように制限
                    }
                } else { // FRAMEカード以外の場合
                    if (count > 3) {
                        count = 3; // 3を超えないように制限
                    }
                }
            } else {
                console.error('カード種別を取得できませんでした。');
                // エラー処理（例：デフォルト値を設定、処理を中断）
            }
        
            if (count < 0) {
                count = 0; // 0未満にならないように制限
            }
        
            cardCountElement.textContent = count;
        }

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

function addCardToDeck(card) {
    if (deck.length >= 43) {
        alert('デッキが上限に達しました。');
        return;
    }

    let cardCount = 0;
    let frameCount = 0; // FRAMEカードの枚数をカウント

    for (let i = 0; i < deck.length; i++) {
        if (deck[i].cardNumber === card.cardNumber) {
            cardCount++;
        }
        if (deck[i].cardType.includes('FRAME')) { // カード種別がFRAMEを含む場合
            frameCount++;
        }
    }

    if (card.cardType.includes('FRAME')) { // 追加するカードがFRAMEを含む場合
        if (frameCount >= 12) {
            alert('FRAMEカードは12枚までしか追加できません。');
            return;
        }
    } else { // FRAMEカード以外の場合
        if (cardCount >= 3) {
            alert('同じカードは3枚までしか追加できません。');
            return;
        }
    }

    deck.push(card);
    updateDeckList();
}

function removeCardFromDeck(cardNumber) {
    const index = deck.findIndex(c => c.cardNumber === cardNumber);
    if (index !== -1) {
        deck.splice(index, 1);
        updateDeckList();
    }
}

function updateDeckList() {
    const deckListElement = document.getElementById('deck-list');
    deckListElement.innerHTML = '';
    const cardCounts = {}; // カードごとの枚数をカウント

    deck.forEach(card => {
        cardCounts[card.cardNumber] = (cardCounts[card.cardNumber] || 0) + 1;
    });

    for (const cardNumber in cardCounts) {
        const card = deck.find(c => c.cardNumber === cardNumber);
        const count = cardCounts[cardNumber];

        const listItem = document.createElement('li');

        let cardText = '';
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
        cardText = `<img src="${thumbUrl}" alt="${card.cardName}">`;
        cardText += card.cardName;

        listItem.innerHTML = cardText;

        const cardImage = listItem.querySelector('img');
        if (cardImage) { // 画像要素が存在するか確認
            cardImage.addEventListener('click', () => {
                const modal = document.getElementById('image-modal');
                const modalImage = document.getElementById('modal-image');
                modal.style.display = 'block';
                modalImage.src = largeUrl;
            });
        }

        const cardCountElement = document.createElement('div');
        cardCountElement.classList.add('card-count');

        const minusButton = document.createElement('button');
        minusButton.textContent = '-';
        minusButton.addEventListener('click', () => {
            removeCardFromDeck(card.cardNumber); // カード番号を渡す
        });

        const countDisplay = document.createElement('span');
        countDisplay.textContent = count; // 枚数を表示
        countDisplay.classList.add('card-count');

        const plusButton = document.createElement('button');
        plusButton.textContent = '+';
        plusButton.addEventListener('click', () => {
            if (deck.length < 43 && count < 3) {
                addCardToDeck(card);
            } else {
                if (deck.length >= 43) {
                    alert('デッキが上限に達しました。');
                } else {
                    alert('同じカードは3枚までしか追加できません。');
                }
            }
        });

        cardCountElement.appendChild(minusButton);
        cardCountElement.appendChild(countDisplay);
        cardCountElement.appendChild(plusButton);

        listItem.appendChild(cardCountElement);
        deckListElement.appendChild(listItem);
    }

    document.getElementById('deck-count').textContent = deck.length;
}

// 初期化
displayCardList([]);