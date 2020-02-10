const NETWORK = {
    ROPSTEN: 'https://ropsten.infura.io/v3/af1b1e69f5bf435db4f4199557f1d8f8',
    KOVAN: 'https://kovan.infura.io/v3/af1b1e69f5bf435db4f4199557f1d8f8',
    RINKEBY: 'https://rinkeby.infura.io/v3/af1b1e69f5bf435db4f4199557f1d8f8',
    MAINNET: 'https://mainnet.infura.io/v3/af1b1e69f5bf435db4f4199557f1d8f8'
}
const TOKEN_CONTRACT = {
    ROPSTEN: '0x4f7796965d400449a510e4d0500481dec1b6e339',
    MAINNET: '0xb05019c110A28e2F2dE0C80658766813e8672497'
}

// default network is rinkeby
const defaultNetwork = 'ROPSTEN';

const DApp = function (address) {
    this.network = NETWORK[defaultNetwork];
    this.tokenAddress = TOKEN_CONTRACT[defaultNetwork];
    this.web3Provider;
    this.tokenContract;
    this.currentAccount = address;
    this.table;
    this.development = false;
    this.DECIMAL = 18;
    this.oneToken = new BigNumber("10").exponentiatedBy(this.DECIMAL);
}

DApp.prototype.start = function () {
    console.log("[x] Initializing DApp.");
    this.initWeb3();
    this.initContract();
}

DApp.prototype.initWeb3 = async function() {
    // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      this.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      this.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
    }
    web3 = new Web3(this.web3Provider);
    console.log("[x] web3 object initialized.");
}


DApp.prototype.getTokenContract = function () {
    return this.development?
        this.tokenContract.deployed():
        this.tokenContract.at(this.tokenAddress);
}

DApp.prototype.initContract = function () {
    $.getJSON('SnapBotToken.json', (tokenContract) => {
        this.tokenContract = TruffleContract(tokenContract);
        this.tokenContract.setProvider(this.web3Provider);
        
        console.log("[x] SnapBotToken contract initialized.");

        this.initForm();


        // // ERC20 token contract
        // $.getJSON('ERC20.json', (tokenContract) => {
        //     this.tokenContract = TruffleContract(tokenContract);
        //     this.tokenContract.setProvider(this.web3Provider);
        //     console.log("[x] ERC20Token contract initialized.");

        //     $.getJSON('TokenTimeLockedWallet.json', (walletContract) => {
        //         this.walletContract = TruffleContract(walletContract)
        //         this.walletContract.setProvider(this.web3Provider);
        //         console.log("[x] TimeLockedWallet contract initialized.");

        //         web3.eth.getAccounts((error, accounts) => {
        //             if (error) {
        //                 console.error(error);
        //             } else {
        //                 this.currentAccount = accounts[0];
        //                 console.log("[x] Using account", this.currentAccount);
        //                 this.initCreateWalletForm();
        //                 this.initTopupWalletForm();
        //                 this.initClaimForm();
        //                 this.prefillCreateWalletForm();
        //                 this.initTable();
        //                 this.loadWallets();
        //             }
        //         });
        //     });
        // });
    });
}

DApp.prototype.initForm = function () {
    // let account = web3.eth.accounts[0];
    console.log("[x] Inited form", this.currentAccount);
    // console.log(web3.eth.accounts)
    $("#currentAccount").html(this.currentAccount);
    $("#burnToken").click(() => {
        this.burnToken();
    });
    // console.log(this.tokenContract);
    this.getTokenContract().then(async (tokenInstance) => {
        let owner = await tokenInstance.owner();
        if(owner.toLowerCase() !== this.currentAccount.toLowerCase()) {
            alert('You are not owner of token, could not burn');
            $("#burnToken").attr("disabled", "true");
        }
    });
}

DApp.prototype.burnToken = function() {
    let numberToken = $("#amount").val();
    if(isNaN(numberToken)) {
        alert('Invalid token amount');
        return;
    }
    this.getTokenContract().then(async (tokenInstance) => {
        let txHash = await tokenInstance.burn(this.oneToken.multipliedBy(numberToken).toFixed(0), {from: this.currentAccount});
        console.log(txHash);
    });
}
