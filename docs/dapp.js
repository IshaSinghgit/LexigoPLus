// @TODO: Update this address to match your deployed ArtworkMarket contract!
// const contractAddress = "0x7a377fAd8c7dB341e662c93A79d0B0319DD3DaE8";
const contractAddress = "0xba949cf5a11d0a394fa6a1908b8c721bfc2a1b2b";


const dApp = {
  ethEnabled: async function() {
    // If the browser has an Ethereum provider (MetaMask) installed
    if (window.ethereum) {
      try {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        return true;
      } catch (error) {
        console.error("Error enabling Ethereum:", error);
        return false;
      }
    }
    return false;
  },

  collectVars: async function() {
    // get land tokens
    this.tokens = [];
    this.totalSupply = await this.artContract.methods.totalSupply().call();

    // fetch json metadata from IPFS (name, description, image, etc)
    const fetchMetadata = (reference_uri) => fetch(`https://gateway.pinata.cloud/ipfs/${reference_uri.replace("ipfs://", "")}`, { mode: "cors" }).then((resp) => resp.json());

    for (let i = 1; i <= this.totalSupply; i++) {
      try {
        const token_uri = await this.artContract.methods.tokenURI(i).call();
        if (token_uri) {
          const token_json = await fetchMetadata(token_uri);
          this.tokens.push({
            tokenId: i,
            highestBid: Number(await this.artContract.methods.highestBid(i).call()),
            auctionEnded: Boolean(await this.artContract.methods.auctionEnded(i).call()),
            pendingReturn: Number(await this.artContract.methods.pendingReturn(i, this.accounts[0]).call()),
            auction: new window.web3.eth.Contract(
              this.auctionJson,
              await this.artContract.methods.auctions(i).call(),
              { defaultAccount: this.accounts[0] }
            ),
            owner: await this.artContract.methods.ownerOf(i).call(),
            ...token_json
          });
        } else {
          console.error("Token URI is undefined for tokenId:", i);
        }
      } catch (e) {
        console.error("Error fetching token metadata:", e);
      }
    }
  },


  setAdmin: function() {
    // if account selected in MetaMask is the same as owner then admin will show
    if (this.isAdmin) {
      $(".dapp-admin").show();
    } else {
      $(".dapp-admin").hide();
    }
  },

  updateUI: async function() {
    console.log("updating UI");
    // refresh variables
    await this.collectVars();
 
    $("#dapp-tokens").html("");
    this.tokens.forEach((token) => {
      try {
        // your existing UI update code here
      } catch (e) {
        console.error("Error updating UI:", e);
      }
    });

    // hide or show admin functions based on contract ownership
    this.setAdmin();
  },

  bid: async function(event) {
    // your existing bid function code here
  },

  endAuction: async function(event) {
    // your existing endAuction function code here
  },

  withdraw: async function(event) {
    // your existing withdraw function code here
  },

  registerArt: async function() {
    // your existing registerArt function code here
  },

  main: async function() {
    // Initialize web3
    if (!await this.ethEnabled()) {
      alert("Please install MetaMask to use this dApp!");
    }

    this.accounts = await window.web3.eth.getAccounts();
    this.contractAddress = contractAddress;

    this.artJson = await (await fetch("./ArtworkMarket.json")).json();
    this.auctionJson = await (await fetch("./ArtworkAuction.json")).json();

    this.artContract = new window.web3.eth.Contract(
      this.artJson,
      this.contractAddress,
      { defaultAccount: this.accounts[0] }
    );
    console.log("Contract object", this.artContract);

    this.isAdmin = this.accounts[0] == await this.artContract.methods.owner().call();

    await this.updateUI();
  }
};

dApp.main();
