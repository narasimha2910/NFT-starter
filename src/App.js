import { useState } from "react";
import Web3 from "web3";
import testAbi from "./testAbi";

function App() {
  const web3 = new Web3(window.ethereum);

  const [address, setAddress] = useState("");
  const [metaData, setMetaData] = useState({});

  async function load() {
    const web3 = new Web3(Web3.givenProvider);
    const accounts = await web3.eth.requestAccounts();

    setAddress(accounts[0]);
  }

  const getNfts = async () => {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(
      testAbi,
      "0x45DB714f24f5A313569c41683047f1d49e78Ba07"
    );
    contract.defaultAccount = "0x80efF130ddE6223a10e6ab27e35ee9456b635cCD";
    console.log(contract);
    const spacePunksBalance = await contract.methods
      .balanceOf("0x80efF130ddE6223a10e6ab27e35ee9456b635cCD")
      .call();
    console.log();
    const metaArray = [];
    for (let i = 0; i < spacePunksBalance; i++) {
      const tokenId = await contract.methods
        .tokenOfOwnerByIndex("0x80efF130ddE6223a10e6ab27e35ee9456b635cCD", i)
        .call();
      let tokenMetadataURI = await contract.methods.tokenURI(tokenId).call();

      

      if (tokenMetadataURI.startsWith("ipfs://")) {
        tokenMetadataURI = `https://ipfs.io/ipfs/${
          tokenMetadataURI.split("ipfs://")[1]
        }`;
      }

      console.log(tokenMetadataURI);
      const tokenMetadata = await fetch(tokenMetadataURI).then((response) =>
        response.json()
      ).then((data) => data);
      setMetaData(tokenMetadata)
    }
  };

  const connectToWallet = () => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.request({ method: "eth_requestAccounts" }).then((res) => {
        setAddress(res[0]);
      });
    }
  };

  return (
    <>
      <p>Heloo</p>
      <div>
        <h1 style={{ textAlign: "center" }}>IMPORT NFTS</h1>
        <button onClick={load}>Connect</button>
        <div>{address}</div>
        <button onClick={getNfts}>Get NFTs</button>
        <div>Name: {metaData["name"]}</div>
        <div>Image: {metaData["image"]}</div>
        <div>Description: {metaData["description"]}</div>
        <img src={metaData["image"]} alt="" />
      </div>
    </>
  );
}

export default App;
