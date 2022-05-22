import { useInput } from "./Hooks/UseInput";
import { useEffect, useState } from "react";

const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey); 

const contract = require("./artifacts/contracts/HandValentine.sol/HandValentine.json")
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const NFTContract = new web3.eth.Contract(contract.abi, contractAddress);

function App() {
  
  const [walletAddress, setWallet] = useState("");
  let { value, bind, reset } = useInput("Type some lovely words here <3");

  let currentAccount = null;
  
  const server_url = "http://localhost:8080";

  useEffect(() => {
    async function getCurrentWalletConnected () {
      if (window.ethereum) {
        window.ethereum.request({method: "eth_accounts"})
        .then((res) => {
          if (res.length > 0) {
            handleAccountsChanged(res)
          }
        }).catch((err) => {
          if (err.code === 4001) {
            alert('Please connect to metamask!')
          } else {
            console.error(err)
          }
        })
      } else { alert("Install metamask extension!")}
    };
    getCurrentWalletConnected()
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      alert('Please connect to MetaMask!');
    } else if (accounts[0] !== currentAccount) {
      currentAccount = accounts[0]
      setWallet(currentAccount)
      console.log("Wallet connected: ", walletAddress);
    }
  }
  
  const connectWallet = async () => {
    if (isMainnet()) {
      if(window.ethereum) {
        window.ethereum.request({method:'eth_requestAccounts'})
        .then(res => handleAccountsChanged(res))
        .catch((err) => {
          if (err.code === 4001) {
            alert('Please connect to metamask!')
          } else {
            console.error(err)
          }
        });
      } else {
        alert("Install metamask extension!")
      }
    }
  };

  function isMainnet() {
    let chainId = window.ethereum.networkVersion
    if (parseInt(chainId) === 4) { // 4 = rinkeby, 1 = mainnet
      return true;
    } else {
      alert("Please connect your Web3 to mainnet network!")
      return false;
    }
  };

  const mintNFT = async(tokenURI) => {      
    const addressFrom = walletAddress;
    const nonce = await web3.eth.getTransactionCount(addressFrom, 'latest'); 
    const tx = {
      'from': addressFrom,
      'to': contractAddress,
      'nonce': nonce,
      'gas': 300000,
      'value': web3.utils.toWei('0.02', 'ether'),
      'data': NFTContract.methods.publicMint(tokenURI).encodeABI()    // make call to smart contract 
    }

    web3.eth.getAccounts().then(accounts => {
      web3.eth.sendTransaction(tx, 
        function(err, transactionHash) {
          if (!err){
            alert("Hand Valentine successfully minted! ")
            console.log("Transaction hash:", transactionHash)
          } else {
            alert("Something went wrong. Try again!")
            console.log(err);
          }
        })
    })
}

  const mintClick = async () => {
    let hash;
    console.log("Input: ", value);

    // draw image and upload 
    await fetch(`${server_url}/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({wish: value})
    }).then((res) => res.json())
      .then((data) => {hash = data.metadataHash})
      .catch((err) => console.log(err))

      // mint
      if (hash && isMainnet()) {
        await mintNFT(hash);
      }
  };

  return (
    <div className="app">
      <header className="header">
        <img src="/logo.png" className="header__logo" alt="logo" />
        <img
          src="/metamask.png"
          className="header__metamask"
          alt="metamask"
          onClick={connectWallet}
        />
      </header>

      <div className="input">
        <img src="/heart.png" className="input__heart" alt="heart" />
        <textarea type="text" {...bind} className="input__controller" onClick={reset}/>  
        <img
          src="/send-love-btn.png"
          onClick={mintClick}
          className="input__btn"
          alt="input btn"
        />
        <img
          src="/kanye-types.png"
          className="input__types"
          alt="kanye-types"
        />
      </div>

      <footer className="footer">
        <img src="/torn-paper-big.png" className="footer__bg" alt="footer bg" />
        <img
          src="/freemint-type.png"
          className="footer__info"
          alt="footer info"
        />
        <div className="socials">
          <a href="https://twitter.com/nicedaybruh" target="_blank" className="socials__link">
            <img src="/twitter.png" alt="twitter" />
          </a>
          <a href="https://discord.gg/238RHdQA3G" target="_blank" className="socials__link">
            <img src="/discord.png" alt="discord" />
          </a>
          <a href="#" target="_blank" className="socials__link">
            <img src="/opensea.png" alt="opensea" />
          </a>
          <a href="#" target="_blank" className="socials__link">
            <img src="/instagram.png" alt="instagram" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;