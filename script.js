"use strict";

const $ = selector => document.querySelector(selector);

const $wordToMix = $(`#word`);
const $numberOfTries = $(`#number-of-tries`);
const $triesBallContainer = $(`.tries-ball-container`);
const $letterErrors = $(`#letter-mistaken`);
const $inputWordDivs = $(`.input-word`);
const $randomWordBtn = $(`#random-word`);
const $resetMenuBtn = $(`#reset-menu`);

let letterOrder = 0;
let triesSpan = 1;
let LettersInArr = [];
let divToCheck = [];
let nextBall = $triesBallContainer.children[0];

let wordToMix;

const getWordFromApi = () => {
    return new Promise(async (resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '48f083acb0msh1c2a2187bae615cp1f0dfejsn25ed4d9660c7',
                'X-RapidAPI-Host': 'random-words5.p.rapidapi.com'
            }
        };

        const url = 'https://random-words5.p.rapidapi.com/getRandom?maxLength=6';

        let promiseResponse = await fetch(url, options);
        resolve(await promiseResponse.text());
    })
}

const randomizeWordOrder = () => {
    return new Promise(async (resolve, reject) => {
        wordToMix = await getWordFromApi();
        let wordMixed = "";
        let setOrder = new Set();

        for (let i = 0; i < wordToMix.length; i++) {
            LettersInArr.push(wordToMix[i]);
        }

        for (let i = 0; i < wordToMix.length; i++) {
            let randomOrder = Math.round(Math.random() * (wordToMix.length - 1));
            setOrder.add(await changingForNonExistingNumber(wordToMix.length, randomOrder, setOrder))
        }

        [...setOrder].forEach(element => wordMixed += wordToMix[element]);

        resolve(wordMixed);
    })
}

const changingForNonExistingNumber = (maxNumber, numberToCheck, setToCompare) => {
    return new Promise(async (resolve, reject) => {
        while (setToCompare.has(numberToCheck)) {
            numberToCheck = Math.round(Math.random() * (maxNumber - 1));
        }
        resolve(numberToCheck);
    });
}


const changingGameBody = async () => {
    let wordMixed = await randomizeWordOrder();
    let documentFragment = document.createDocumentFragment();
    $wordToMix.textContent = wordMixed;

    if (divToCheck.length != 0) {
        divToCheck.forEach(element => element.remove());
        divToCheck.splice(0, divToCheck.length);
    }

    for (let i = 0; i < wordMixed.length; i++) {
        let input = document.createElement(`input`);

        input.classList.add(`edges`);
        input.setAttribute(`minLength`, 1);
        input.setAttribute(`maxLength`, 1);
        input.setAttribute(`disabled`, "");
        input.id = `input-number-${i}`;

        input.addEventListener(`click`, (ev) => giveDivDetails(ev.target));

        input.addEventListener(`keyup`, (keyEvent) => {
            if (keyEvent.key != `Backspace`) {
                input.value = keyEvent.key;

                if (wordValidation(keyEvent.target)) {
                    keyEvent.target.setAttribute(`disabled`, "");
                    goNext(input);

                } else {
                    showingAttemps();
                    letterMistaken(keyEvent.key);
                }

            } else {
                goBack(input);

            }
        });

        divToCheck.push(input);
        documentFragment.append(input);
    }

    documentFragment.childNodes[0].removeAttribute(`disabled`);
    $inputWordDivs.append(documentFragment);
}

const giveDivDetails = (element) => {
    if ($(`.active`)) {
        $(`.active`).classList.remove(`active`);
        element.classList.add(`active`);

    } else {
        element.classList.add(`active`);
    }

    $(`#${element.id}`).focus();
    element.value = '_';
}

const wordValidation = (currentElement) => {
    let divToCompare = divToCheck.indexOf(currentElement);
    let valueToCheck = LettersInArr[letterOrder];
    let valueToCheckFromDiv = $inputWordDivs.children[divToCompare].value;

    if (valueToCheck == valueToCheckFromDiv) {
        letterOrder++;
        return true;
    }

    return false;
}

const goNext = (currentElement) => {
    if (currentElement.nextSibling != null) {
        let nextDiv = currentElement.nextElementSibling;
        nextDiv.removeAttribute(`disabled`);
        giveDivDetails(nextDiv);

    } else {
        let finalWordInput = "";

        $inputWordDivs.childNodes.forEach(element => finalWordInput += element.value);

        if (wordToMix == finalWordInput) {
            let winnerMessage = [...$inputWordDivs.children];
            winnerMessage.forEach(element => element.classList.add('active'));
        }
    }
}

const goBack = (currentElement) => {
    if (currentElement.previousSibling != null) {
        letterOrder--;
        let previousDiv = currentElement.previousElementSibling

        previousDiv.removeAttribute(`disabled`);
        giveDivDetails(previousDiv);
    }
}

const showingAttemps = () => {
    nextBall.classList.replace('empty', 'tries-colored');

    if (nextBall.nextElementSibling != null) {
        $numberOfTries.textContent = `${triesSpan}/5`;
        let nextTry = nextBall.nextElementSibling;
        nextBall = nextTry;

        triesSpan++;

    } else {
        $numberOfTries.textContent = `${triesSpan}/5`;
        let winnerMessage = [...$inputWordDivs.children];

        winnerMessage.forEach(element => element.classList.remove('active'));
        divToCheck.forEach(element => element.setAttribute(`disabled`, ""));
    }
}

const letterMistaken = (keyToPlace) => $letterErrors.innerHTML += `${keyToPlace}, `;

const checkIfGameStart = () => {if (wordToMix != undefined) return true};

const startNewGame = () => {
    wordToMix = "";
    letterOrder = 0;
    triesSpan = 1;
    LettersInArr = [];
    nextBall = $triesBallContainer.children[0];
    $numberOfTries.textContent = `0/5`;
    $letterErrors.innerHTML = "";

    [...$triesBallContainer.children].forEach(element => element.classList.replace(`tries-colored`, `empty`));

    changingGameBody();
}

const resetMenu = () => {
    wordToMix = "";
    letterOrder = 0;
    triesSpan = 1;
    LettersInArr = [];
    nextBall = $triesBallContainer.children[0];
    
    $numberOfTries.textContent = `0/5`;
    $letterErrors.innerHTML = "";
    $wordToMix.innerHTML = "";

    [...$triesBallContainer.children].forEach(element => element.classList.replace(`tries-colored`, `empty`));

    [...$inputWordDivs.children].forEach(element => element.remove());
}

$randomWordBtn.addEventListener(`click`, ev => {
    if (checkIfGameStart()) {
        startNewGame();

    } else {
        changingGameBody();
    }
});

$resetMenuBtn.addEventListener(`click`, (ev) => {if (wordToMix != undefined) resetMenu()});