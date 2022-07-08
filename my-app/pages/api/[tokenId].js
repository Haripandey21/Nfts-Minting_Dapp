export default function handler(req, res) {
    const tokenId = req.query.tokenId;
    const image_url =
      "https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/";
    res.status(200).json({
      name: "SUPPORT ETHEREUM #" + tokenId,
      description: "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether (ETH or Ξ) is the native cryptocurrency of the platform. Among cryptocurrencies, Ether is second only to Bitcoin in market capitalization",
      image: image_url + tokenId + ".svg",
    });
  }
