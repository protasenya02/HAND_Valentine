// general metadata for Ethereum
const namePrefix = "HAND Valentine";
const description = "HAND stands for Have A Nice Day!";
const baseUri = "https://gateway.pinata.cloud/ipfs"

const format = {
    width: 1600,
    height: 1600
};

const letter = {
    width: 60,
    height: 60,
    paragraph_space: 22
};

const spaces = {
    min: 5,
    max: 20
}

const textField = {
    width: 700,
    height: 450,
    left_x: 450,
    left_y: 550
}

let backgroundMap = new Map();
backgroundMap.set(1, "Blue heart");
backgroundMap.set(2, "Cloudy sky");
backgroundMap.set(3, "Autumn heart");
backgroundMap.set(4, "Colorful heart");
backgroundMap.set(5, "Green heart");
backgroundMap.set(6, "Love heart");
backgroundMap.set(7, "Rainbow sky");
backgroundMap.set(8, "Green heart");
backgroundMap.set(9, "Floral heart");
backgroundMap.set(10, "Purple heart");
backgroundMap.set(11, "Message");
backgroundMap.set(12, "Fiery heart");
backgroundMap.set(13, "Eyes heart");
backgroundMap.set(14, "Pink heart");
backgroundMap.set(15, "Orange heart");

module.exports = { 
    namePrefix,
    description,
    baseUri,
    format, 
    textField, 
    letter,
    spaces,
    backgroundMap
};