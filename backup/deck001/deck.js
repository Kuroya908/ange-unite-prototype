let deck = []; // デッキリスト

function displayCardList(cardData) {
    const cardListElement = document.getElementById('card-list');
    cardListElement.innerHTML = '';

    if (cardData.length === 0) {
        const messageElement = document.createElement('div');
        messageElement.textContent = 'カードが見つかりませんでした。';
        messageElement.classList.add('empty-message');
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

function addCardToDeck(card) {
    if (deck.length >= 43) {
        alert('デッキが上限に達しました。');
        return;
    }

    const cardCount = deck.filter(c => c.cardNumber === card.cardNumber).length;
    if (cardCount >= 3) {
        alert('同じカードは3枚までしか追加できません。');
        return;
    }

    deck.push(card);
    updateDeckList();
}

function removeCardFromDeck(index) {
    deck.splice(index, 1);
    updateDeckList();
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
            const index = deck.findIndex(c => c.cardNumber === card.cardNumber);
            if (index !== -1) {
                removeCardFromDeck(index);
            }
        });

        const countDisplay = document.createElement('span');
        countDisplay.textContent = count;

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