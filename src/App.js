import { useEffect, useState } from "react";
import Web3 from "web3";
import testAbi from "./testAbi";

function App() {
  const [address, setAddress] = useState("");
  const [metaData, setMetaData] = useState([]);

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
      const tokenMetadata = await fetch(tokenMetadataURI)
        .then((response) => response.json())
        .then((data) => data);
      console.log(tokenMetadata);
      metaArray.push(tokenMetadata);
      console.log(metaArray);
    }
    setMetaData(metaArray);
  };

  useEffect(() => {
    console.log(metaData);
  }, [metaData]);

  return (
    <>
      <div
        style={{
          textAlign: "center"
        }}
      >
        <h1 style={{ textAlign: "center" }}>IMPORT NFTS</h1>
        <button onClick={load}>Connect</button>
        <h2 style={{ marginBottom: "30px" }}>{address}</h2>
        <button onClick={getNfts} style={{ marginBottom: "30px" }}>
          Get NFTs
        </button>
        <div>
          {metaData.length ? (
            metaData.map((meta, ix) => {
              return (
                <div key={ix}>
                  <div>Name: {meta.name}</div>
                  <div>Image: {meta.image}</div>
                  <div>Description: {meta.description}</div>
                  <img
                    src={meta.image}
                    alt=""
                    style={{ height: "200px", width: "200px" }}
                  />
                </div>
              );
            })
          ) : (
            <div>Loading ... </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
