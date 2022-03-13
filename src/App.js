import React, {useState} from "react";
import {ethers} from "ethers";
import styled, {css} from 'styled-components';
import GlobalStyles from "./globalStyles";

const ErrorMessage = styled.div`
    color: #ff0000;
    margin-bottom: 10px;
    font-size: 20px;
`

const ConnectWallet = styled.div`
    margin: 15px;
`

const MintContainer = styled.div`
    margin: 30px auto;
    text-align: center;
`

const ConnectWalletButton = styled.button`
    background: #f900ff;
    color: #fff;
    padding: 10px 25px;
    border: 0px;
    font-size: 21px;
    font-weight: 700;
    border-radius: 20px;
    cursor: pointer;
    background: ${props => props.background};
    color: ${props => props.color};    
`

const MintButton = styled(ConnectWalletButton)`
    margin-top: 30px;
`

const WalletConnected = styled.div`
    font-size: 22px;
`

const CurrentPrice = styled.div`
    font-size: 32px;
    margin: 30px;
`

const CollectionLogo = styled.img`
    ${props => props.width && `
        max-width: ${props.width};
    `};
`

const SelectMintsForUser = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100px;
    margin: auto;
   
`

const RemoveMint = styled.div`
    height: 30px;
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.background};
    color: ${props => props.color};
    font-size: 25px;
    cursor: pointer;
`

const AddMint = styled(RemoveMint)`
    
`

const MintsForUser = styled.div`
    font-size: 30px;
`

const App = () => {
    // collection configuration
    const mintCost = 0.04;
    const maxMintsForUser = 2;
    const whitelistedAddresses = [
        '',
    ];

    const depositWalletAddress = '';
    const endSaleAtDepositAmount = 0; // leave this to 0 for no limit
    const isMintingEnabled = true;
    const whitelistOnly = false;
    const isRopsten = true;

    // styling configuration
    const logoMaxWidth = '330px';
    const backgroundColor = '#070D2B';
    const textColor = '#6BF6F0';
    const buttonBackgroundColor = '#f900ff';
    const buttonColor = '#FFFFFF';


    const [mintsForUser, setMintsForUser] = useState(1);

    const [error, setError] = useState();
    const [provider, setProvider] = useState();
    const [signer, setSigner] = useState();
    const [signerAddress, setSignerAddress] = useState();
    const [minting, setMinting] = useState(false);
    const [mintingEnabled, setMintingEnabled] = useState(isMintingEnabled);

    const connectWallet = async (e) => {
        e.preventDefault();

        if (!window.ethereum) {
            setError("Metamask wallet not found, please install it to continue.");
            return;
        }

        setError();

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts");
        const signer = provider.getSigner();
        const {chainId} = await provider.getNetwork();

        if (isRopsten) {
            if (chainId != 3) {
                setError('Please connect your Metamask wallet to Ropsten testnet.');
                return;
            }
        } else {
            if (chainId != 1) {
                setError('Please connect your Metamask wallet to Ethereum network.');
                return;
            }
        }

        const signerAddress = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setSignerAddress(signerAddress);

        // check deposit wallet balance if we have a limit to end the sale at (presale, public sale)
        if (endSaleAtDepositAmount > 0) {
            const depositProvider = ethers.getDefaultProvider(isRopsten ? 'ropsten' : 'mainnet');

            depositProvider.getBalance(depositWalletAddress).then((balance) => {
                // convert a currency unit from wei to ether
                const balanceInEth = parseFloat(ethers.utils.formatEther(balance));

                if (balanceInEth >= endSaleAtDepositAmount) {
                    setError('Mint sale limit has been reached, all NFTs are sold out during this sale!');
                    setMintingEnabled(false);
                }
            });
        }
    }

    const disconnectWallet = async () => {
        setProvider();
        setSigner();
        setSignerAddress();
    }

    const decreaseMintsForUser = () => {
        const newMintsForUser = mintsForUser -1;

        if (newMintsForUser >= 1) {
            setMintsForUser(newMintsForUser);
        }
    }

    const increaseMintsForUser = () => {
        const newMintsForUser = mintsForUser + 1;

        if (newMintsForUser <= maxMintsForUser) {
            setMintsForUser(newMintsForUser);
        }
    }

    const displayAddress = (address) => {
        return `${address.substr(0, 7)}...${address.substr(-5)}`;
    }

    const mint = async (e) => {
        e.preventDefault();

        if (signer && !minting) {

            if (whitelistOnly && !whitelistedAddresses.includes(signerAddress)) {
                setError('Your address must be whitelisted to mint.');
                return;
            }

            if (localStorage.getItem(signerAddress) >= maxMintsForUser) {
                setError('Max mint limit reached.');
                return;
            }

            if (mintsForUser <= maxMintsForUser) {
                // total mint cost in wei
                const totalMintCost = ethers.utils.parseEther('' + (mintCost * mintsForUser));

                setMinting(true);

                try {
                    const tx = await signer.sendTransaction({
                        to: depositWalletAddress,
                        value: totalMintCost
                    });

                    setMinting(false);

                    localStorage.setItem(signerAddress, mintsForUser);
                    console.log(tx);

                } catch (err) {
                    setMinting(false);

                    if (err.code === "INSUFFICIENT_FUNDS") {
                        setError(`Insufficient funds in wallet for minting, total cost is: ${mintCost * mintsForUser} ETH`);
                    }

                    console.log(err.message);
                }
            }
        }
    }

    return (
        <MintContainer>
            <GlobalStyles background={backgroundColor} color={textColor} />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <CollectionLogo src="/images/logo.png" width={logoMaxWidth} />
            <ConnectWallet>
                {signerAddress ?
                    <WalletConnected>{displayAddress(signerAddress)}</WalletConnected> :
                    <ConnectWalletButton onClick={connectWallet}  background={buttonBackgroundColor} color={buttonColor}>CONNECT WALLET</ConnectWalletButton>
                }
            </ConnectWallet>
            <CurrentPrice>CURRENT PRICE: {mintCost} ETH</CurrentPrice>
            <SelectMintsForUser>
                <RemoveMint onClick={decreaseMintsForUser} background={buttonBackgroundColor} color={buttonColor}>-</RemoveMint>
                <MintsForUser>{mintsForUser}</MintsForUser>
                <AddMint onClick={increaseMintsForUser} background={buttonBackgroundColor} color={buttonColor}>+</AddMint>
            </SelectMintsForUser>
            {mintingEnabled && signer &&
                <MintButton onClick={mint} background={buttonBackgroundColor} color={buttonColor}>MINT</MintButton>
            }
        </MintContainer>
    );
}

export default App;