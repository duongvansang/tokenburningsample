window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            const accounts = await ethereum.enable()
            window.web3.currentAccount = accounts[0];
            // console.log(window.web3.currentAccount);

            // refresh page when account change
            ethereum.on('accountsChanged', function (accounts) {
                // Time to reload your interface with accounts[0]!
                window.location.reload();
            });

            window.dApp = new DApp(accounts[0]);
            dApp.start();
        } catch (error) {
            console.log(error)
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

});

