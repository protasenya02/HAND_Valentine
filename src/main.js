const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
require("dotenv").config()
const console = require("console");

let tokenId = 0;

const {
  namePrefix,
  baseUri, 
  description,
  format,
  letter, 
  textField, 
  spaces,
  backgroundMap
} = require("./config.js");

const PINATA_KEY = process.env.PINATA_KEY;
const PINATA_SECRET = process.env.PINATA_SECRET;

const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK(PINATA_KEY, PINATA_SECRET);

const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
const basePath = process.cwd();

const buildDir = `${basePath}/build`;
const letterDir = `${basePath}/letter/`;
const backDir = `${basePath}/background/`;

const buildSetup = () => {
  if (!fs.existsSync(buildDir)) {
   fs.mkdirSync(buildDir);
  }
};

const saveImage = (_canvas, tokenId) => {
  try {
    fs.writeFileSync(`${buildDir}/${tokenId}.png`, _canvas.toBuffer("image/png"));
  } catch (err) {
    throw new Error(`Can't save image with id=${tokenId}.`);
  }
};

const randomNumber = async(_max) => {
  return Math.floor(Math.random() * (_max - 1) + 1);
}

const drawBackground = async () => {
  try {
    bcNumber = await randomNumber(backgroundMap.size);
    let background = await loadImage(`${backDir}${bcNumber}.png`);
    ctx.drawImage(
      background,
      0,
      0,
      format.width,
      format.height
    );
    return bcNumber;
  } catch (err) {
    throw new Error(`Can't draw background.`);
  }
}

const drawLetters = async(wish) => {
  try {
    let _x = textField.left_x;
    let _y = textField.left_y;

    if (wish.length < 50) {
      _y += letter.height * 2;
    }

    for (let i = 0; i < wish.length; i++) {

      // TODO: if not in [drawn symbols] then trim
      let currLetter = wish.charAt(i).toLocaleLowerCase();
      currLetter = currLetter.replace('.', 'dot').replace('\'', 'quote').replace(/\s/i, 'space').replace(':', 'colon')
      .replace('$', 'dollar').replace('*', 'star').replace('=', 'equal').replace('+', 'plus').replace('-', 'minus').replace('%', 'percent')
      .replace('@', 'at').replace('?', 'question').replace('!', 'exclamation').replace(',', 'comma').replace('-', 'minus').replace('^', 'carat')
      .replace('#', 'grid').replace('(', 'lbracket').replace(')', 'rbracket').replace('[', 'lsqbracket').replace(']', 'rsqbracket').replace('\"', 'doubleqoute')
      .replace('<', 'larrow').replace('>', 'rarrow').replace('/', 'rslash').replace('\\', 'lslash').replace('_', 'underline').replace('&', 'ampersand');
      
      let _image = await loadImage(`${letterDir}${currLetter}.png`);

      ctx.drawImage(
        _image,
        _x + await randomNumber(spaces.min, spaces.max),  
        _y + await randomNumber(spaces.min, spaces.max),
        letter.width,
        letter.height
      );
        _x += letter.width;

      // check out of width
      if (_x >= textField.width + textField.left_x) {
        _x = textField.left_x;
        _y += letter.height + letter.paragraph_space;
      }

      // check if numb of letter bigger then text field
      if (_y >= textField.height + textField.left_y) {
        break;
      }
    }
  } catch (err) {
    throw new Error(`Can't draw text: ${wish}.`);
  }
}

const getBackgroundName = async(_bcNumb) => {
  return backgroundMap.get(_bcNumb);
}

const addMetadata = async (_token_id, _imgHash, _bcNumb) => {
  const backgroundName = await getBackgroundName(_bcNumb);
  const tempMetadata = {
    name: `${namePrefix} #${_token_id}`,
    description: description,
    image: `${baseUri}/` + _imgHash,
    attributes: [
      {
        "trait_type": "Background",
        "value": backgroundName,   
      },
    ]
  };
  return tempMetadata;
};

const saveSingleTokenMetadata = async (tokenId, _imgHash, _bcNumb) => {
  try{
    const tokenMetadata = await addMetadata(tokenId, _imgHash, _bcNumb);
    console.log(`Writing metadata for ${tokenId}: ${JSON.stringify(tokenMetadata)}`);
    fs.writeFileSync(`${buildDir}/${tokenId}.json`, JSON.stringify(tokenMetadata));
  } catch (err) {
    throw new Error(`Can't save token with id=${tokenId} metadata.`);
  }
};

const uploadFileToIpfs = async(file) => {
  try {
    const result = await pinata.pinFileToIPFS(file, null);
    console.log(`File successfully uploaded to Ipfs`);
    return result.IpfsHash;
  } catch(err) {
    throw new Error(`Can't save file to Ipfs.`);
  }
}

const deleteImage = async (file) => {
  try {
    if (file.existsSync()) {
      fs.unlink(file, (err) => {
        if (err) throw err;
        console.log('Image successfully deleted');
      });  
    }
  } catch (err) {
    throw new Error(`Can't delete file ${file}.`);
  }
}

const drawValentine = async(input) => {  
  try {
    // create image
    tokenId = Date.now();
    let bcNumb = await drawBackground();
    await drawLetters(input);
    saveImage(canvas, tokenId);
    const imageFile = fs.createReadStream(`${buildDir}/${tokenId}.png`);
    const imgHash = await uploadFileToIpfs(imageFile);

    // save metadata
    await saveSingleTokenMetadata(tokenId, imgHash, bcNumb);
    const metadataFile = await fs.createReadStream(`${buildDir}/${tokenId}.json`);
    const metaHash = await uploadFileToIpfs(metadataFile);
    // delete image
    // deleteImage(`${buildDir}/${tokenId}.png`);
    // deleteImage(`${buildDir}/${tokenId}.json`);
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // tokenId++;
     return metaHash;
  } catch (err) {
      throw err;
  }
}

module.exports = { buildSetup, drawValentine };
