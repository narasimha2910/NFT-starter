import { useEffect, useState } from "react";
import Web3 from "web3";
import testAbi from "./testAbi";
import algosdk from "algosdk";

function App() {
  const [address, setAddress] = useState("");
  const [metaData, setMetaData] = useState([]);
  const [walletMeta, setWalletMeta] = useState([]);
  const [algoState, setAlgoState] = useState([])

  async function load() {
    const web3 = new Web3(Web3.givenProvider);
    const accounts = await web3.eth.requestAccounts();
    setAddress(accounts[0]);
  }

  const getAlgoNfts = async () => {
    const addr = "3HEERVIOYPNGGRMDQR4GGEDNXOM37RUR5U5DHALB7YTGKLMEPXZTXWGK5Q"
    const ixAddress = `https://algoindexer.algoexplorerapi.io/v2/accounts/${addr}`;
    // const indexerClient = new algosdk.Indexer("",ixAddress);
    // let accountInfo = await indexerClient
    //   .lookupAccountByID(
    //     "3HEERVIOYPNGGRMDQR4GGEDNXOM37RUR5U5DHALB7YTGKLMEPXZTXWGK5Q"
    //   )
    //   .do();
    // console.log(
    //   "Information for Account: " + JSON.stringify(accountInfo, undefined, 2)
    // );
    const resp = await fetch(ixAddress).then(res => res.json())
    setAlgoState(resp.account["created-assets"])
    setWalletMeta([]);
    setMetaData([]);
    console.log(resp);
  }

  const getNftsByWallet = async () => {
    const walletAddress = "0x91e1543bf18cc3c7a25e682f9c20cf8bd6f28548";
    const teszosAddr = "tz1PoudzaVvSh8QAMLUwP7mCEwNPTC7VthaZ";
    const api = `https://api.rarible.org/v0.1/items/byOwner?owner=TEZOS:${teszosAddr}`;
    console.log("Called");
    const items = await fetch(api)
      .then((res) => res.json())
      .then((res) => res.items).catch(err => console.log(err));
    console.log(items);

    // const meta = await extractMetaData(items)
    // console.log(meta)
    setMetaData(items);
    setWalletMeta([]);
  };

  // const extractMetaData = async (items) => {
  //   const metaArray = [];
  //   // items.map(async (item) => {
  //   //   const metaData = await fetch(
  //   //     `https://ethereum-api.rarible.org/v0.1/nft/items/${item.id}`
  //   //   ).then((res) => res.json());
  //   //   metaArray.push(metaData.meta);
  //   // });

  //   for(let i=0; i<items.length; i++){
  //     const metaData = await fetch(
  //       `https://ethereum-api.rarible.org/v0.1/nft/items/${items[i].id}`
  //     ).then((res) => res.json());
  //     metaData.meta && metaArray.push(metaData.meta);
  //   }

  //   console.log(metaArray);
  //   return metaArray
  // }

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
    setMetaData([]);
    setWalletMeta(metaArray);
  };

  return (
    <>
      <div
        style={{
          textAlign: "center",
        }}
      >
        <h1 style={{ textAlign: "center" }}>IMPORT NFTS</h1>
        <button onClick={load}>Connect</button>
        <h2 style={{ marginBottom: "30px" }}>{address}</h2>
        <button onClick={getNfts} style={{ marginBottom: "30px" }}>
          Get NFTs
        </button>
        <button onClick={getNftsByWallet} style={{ marginBottom: "30px" }}>
          Get NFTs By Wallet
        </button>
        <button onClick={getAlgoNfts} style={{ marginBottom: "30px" }}>
          Get Algorand Assets
        </button>
        <div>
          {metaData.length ? (
            metaData.map((meta, ix) => {
              console.log("Hello: " + meta);
              return (
                <div key={ix}>
                  <div>Name: {meta.meta.name}</div>
                  {/* <div>Image: {meta.image.url.PREVIEW}</div> */}
                  <div>Description: {meta.meta.description}</div>
                  <img
                    src={meta.meta.content[0].url}
                    alt=""
                    style={{ height: "200px", width: "200px" }}
                  />
                </div>
              );
            })
          ) : walletMeta.length ? (
            walletMeta.map((meta, ix) => {
              console.log("Hello: " + meta);
              return (
                <div key={ix}>
                  <div>Name: {meta.name}</div>
                  {/* <div>Image: {meta.image.url.PREVIEW}</div> */}
                  <div>Description: {meta.description}</div>
                  <img
                    src={meta.image}
                    alt=""
                    style={{ height: "200px", width: "200px" }}
                  />
                </div>
              );
            })
          ) : algoState.length ? algoState.map(algo => {
            return <div>
              <p>{algo.params.name}</p>
              <p>{algo.params.url}</p>
            </div>
          }) : (
            <div>Loading ... </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
