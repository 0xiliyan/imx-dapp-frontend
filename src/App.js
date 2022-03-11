import {useState} from "react";
import {ethers} from "ethers";
import styled, {css} from 'styled-components';

const Section = styled.div`
    margin-bottom: 10px;
`

const Button = styled.button`
    margin-right: 10px;
`

const ErrorMessage = styled.div`
    color: #ff0000;
    margin-bottom: 10px;
`

const ConnectWallet = styled.div`
    margin: 15px;
`

const MintContainer = styled.div`
    max-width: 300px;
    margin: 30px auto;
`

const ConnectWalletButton = styled.button`
    background: #0983e5;
    color: #fff;
    padding: 5px 20px;
    border: 0px;
    border-radius: 3px;
    margin-top: 15px;
`

const MintButton = styled(ConnectWalletButton)`
`

const App = () => {
    const mintCost = 0.04;
    const maxMintsForUser = 2;
    const whitelistedAddresses = [
        '',
    ];

    const depositWalletAddress = '';
    const endSaleAtDepositAmount = 0; // leave this to 0 for no limit
    const isMintingEnabled = true;
    const whitelistOnly = false;
    const isRopsten = false;

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
                <div>
                    <div>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    <div><h2>Mint an NFT</h2></div>
                    <ConnectWallet>
                        {signerAddress ?
                            <div>
                                <span>{displayAddress(signerAddress)}</span>
                            </div> :
                            <div>
                                <div onClick={connectWallet}>
                                    <ConnectWalletButton>Connect</ConnectWalletButton>
                                </div>
                            </div>
                        }
                    </ConnectWallet>
                    <div className="summonSecText">1 NFT costs {mintCost} ETH</div>
                    <div className="summonSecOptions">
                        <label onClick={() => setMintsForUser(1)}><input type="radio" value="1" />1 NFT</label>
                        <label onClick={() => setMintsForUser(2)}><input type="radio" value="2" />2 NFTS</label>
                    </div>
                    {mintingEnabled && signer &&
                        <div className="summonSecButton" onClick={mint}>
                            <MintButton>Mint</MintButton>
                        </div>
                    }
                </div>
            </div>
        </MintContainer>
    );
}

export default App;