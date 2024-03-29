import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";
import Image from 'next/image';
export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // presaleStarted keeps track of whether the presale has started or not
  const [presaleStarted, setPresaleStarted] = useState(false);
  // presaleEnded keeps track of whether the presale ended
  const [presaleEnded, setPresaleEnded] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  /**
   * presaleMint: Mint an NFT during the presale
   */
  const presaleMint = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const whitelistContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // call the presaleMint from the contract, only whitelisted addresses would be able to mint
      const tx = await whitelistContract.presaleMint({
        // value signifies the cost of one crypto dev which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Nft,Check your NFTs at https://testnets.opensea.io ");
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * publicMint: Mint an NFT after the presale
   */
  const publicMint = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
 
      const whitelistContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // call the mint from the contract to mint the Crypto Dev
      const tx = await whitelistContract.mint({
        // value signifies the cost of one crypto dev which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Nft,Check your NFTs at https://testnets.opensea.io ");
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
    
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };


  const startPresale = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
    
      const whitelistContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // call the startPresale from the contract
      const tx = await whitelistContract.startPresale();
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      // set the presale started to true
      await checkIfPresaleStarted();
    } catch (err) {
      console.error(err);
    }
  };
  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };


  useEffect(() => {

    const connectWallet = async () => {
      try {
      
        await getProviderOrSigner();
        setWalletConnected(true);
      } catch (err) {
        console.error(err);
      }
    };
    
      /**
   * getOwner: calls the contract to retrieve the owner
   */
  const getOwner = async () => {
    try {
     
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the owner function from the contract
      const _owner = await nftContract.owner();
      // We will get the signer now to extract the address of the currently connected MetaMask account
      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

    const checkIfPresaleStarted = async () => {
      try {
    
        const provider = await getProviderOrSigner();
        const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
        // call the presaleStarted from the contract
        const _presaleStarted = await nftContract.presaleStarted();
        if (!_presaleStarted) {
          await getOwner();
        }
        setPresaleStarted(_presaleStarted);
        return _presaleStarted;
      } catch (err) {
        console.error(err);
        return false;
      }
    };
     
  const checkIfPresaleEnded = async () => {
    try {

      const provider = await getProviderOrSigner();
   
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the presaleEnded from the contract
      const _presaleEnded = await nftContract.presaleEnded();
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
      return hasEnded;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
   /**
   * getTokenIdsMinted: gets the number of tokenIds that have been minted
   */
    const getTokenIdsMinted = async () => {
      try {
      
        const provider = await getProviderOrSigner();
  
        const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
        // call the tokenIds from the contract
        const _tokenIds = await nftContract.tokenIds();
        //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
        setTokenIdsMinted(_tokenIds.toString());
      } catch (err) {
        console.error(err);
      }
    };

    if (!walletConnected) {
   
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      // Check if presale has started and ended
      const _presaleStarted = checkIfPresaleStarted();
      if (_presaleStarted) {
        checkIfPresaleEnded();
      }

      getTokenIdsMinted();

      // Set an interval which gets called every 5 seconds to check presale has ended
      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);

      // set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  /*
      renderButton: Returns a button based on the state of the dapp
    */
  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }


    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    if (isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale!
        </button>
      );
    }

    // If connected user is not the owner but presale hasn't started yet, tell them that
    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale hasnt started!</div>
        </div>
      );
    }

    // If presale started, but hasn't ended yet, allow for minting during the presale period
    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Nft 🥳
           
          </div>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    // If presale started and has ended, its time for public minting
    if (presaleStarted && presaleEnded) {
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      );
    }
  };
  const wholeList=[
    {
      id:1,
      image :"nft1.png",
      artist :"Bored Ape Yacht Club",
      song :"#2987",
      price : "99"
      
    
    },
    {
      id:2,
      image :"nft2.png",
      artist :"Bored Ape Yacht Club",
      song : "#2892 ",
     price : "96.5"
    
    },
    {
      id:3,
      image :"nft3.png",
      artist :"Bored Ape Yacht Club",
      song : "#3021",
     price : "97.5"
    
    },
    {
      id:4,
      image :"nft4.png",
      artist :"Bored Ape Yacht Club",
      song :"#3092",
      price : "93.7"
      
    
    },
    {
      id:5,
      image :"nft5.png",
      artist :"Bored Ape Yacht Club",
      song : "#9232 ",
     price : "93.2"
    
    },
    {
      id:6,
      image :"nft6.png",
      artist :"Bored Ape Yacht Club",
      song : "#8922",
     price : "98"
    
    },
    {
      id:7,
      image :"nft7.png",
      artist :"Bored Ape Yacht Club",
      song :"#2322",
      price : "90"
      
    
    },
    {
      id:8,
      image :"nft8.png",
      artist :"Bored Ape Yacht Club",
      song : "#7675 ",
     price : "96.7"
    
    },
    {
      id:9,
      image :"nft9.png",
      artist :"Bored Ape Yacht Club",
      song : "#3453",
     price : "94"
    
    }
]


  return (
    
    <div className="bg-slate-600">
      <Head>
        <title>Nfts_Collection</title>
        <meta name="description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>     
      <div className="relative bg-white overflow-hidden">
  <div className="max-w-6xl mx-auto">
    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
      <svg className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="50,0 100,0 50,100 0,100" />
      </svg>

      <div>
        <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
          <nav className="relative flex items-center justify-between sm:h-10 lg:justify-start" aria-label="Global">
            <div className="flex items-center flex-grow flex-shrink-0 lg:flex-grow-0">
              <div className="flex items-center justify-between w-full md:w-auto">
                
                <div className="-mr-2 flex items-center md:hidden">
                  
                </div>
              </div>
            </div>
           
          </nav>
        </div>

      
        
      </div>

      <main className="mt-10 mx-auto max-w-7xl px-2 sm:mt-12 sm:px-6 md:mt-16 lg:mt-2 lg:px-8 xl:mt-3">
        <div className="sm:text-center lg:text-left">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block xl:inline">The new way to </span>
            <span className="block text-indigo-600 xl:inline">become a millionaire.  </span>
          </h1>
          <p className="mt-3 text-base font-bold text-black-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">If you have no any digital asset, make one by using NFT.</p>
          <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
          <div className="rounded-md shadow">
              <a href="https://whitelist-dapp-bltts8jel-haripandey21.vercel.app/" className="w-full flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-2 md:text-lg md:px-11">Participate in Whitelist</a>
            </div>                
          </div>
          <div>         
          {renderButton()}
        </div>
          
        </div>
      </main>
    </div>
    <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
    <img className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src="../background.png" alt=""/>
  </div>
  </div>
 
 
</div>
<div className="mt-10 text-center font-bold text-white ">
  TOP NFTS 
</div>
<div className=" py-3 bg-gray-700  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        { 


       
          wholeList.map((item,index)=>{
            return <div  key={item.song} className="drop-shadow-10xl shadow-md shadow-white-300 mb-3 max-w-sm bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-end px-4 pt-4">             
                
            </div>
            <div className="px-2 max-w-sm bg-white rounded-bl-4xl rounded-tr-4xl shadow-md dark:bg-gray-800 dark:border-gray-700">
    <a href="#">
        <img key={item.image}  className="p-2 rounded-bl-3xl rounded-tr-3xl" src={item.image} alt="nft image" />
    </a>
    <div className="px-5">
        <a href="#">
            <h5  className=" mb-3 text-center flex-center text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{item.song}</h5>
            <h6  className="text-center text-xl font-semibold tracking-tight text-orange-600">by {item.artist}</h6>
            <h6 className="text-center text font- tracking-tight text-gray-900 dark:text-white">Floor price: {item.price} eth</h6>
        </a>
       
        <div className="flex justify-between items-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white"></span>
            <a href="https://opensea.io/collection/boredapeyachtclub" className="text-white bg-blue-200 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">BUY</a>
        </div>
</div>
            </div>
        </div>
  
          })
        }
     
        </div>
<footer className="p-2 justify-center bg-white-lg shadow md:flex md:items-center md:justify-center lg:p-3 dark:bg-gray-800">
    <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
      <a className="hover:underline"></a>Made by @Haripandey
    </span>
</footer>
    </div>
  );
}
