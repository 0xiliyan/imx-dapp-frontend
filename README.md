
  
    
# ImmutableX Configurable Frontend Minting Dapp  
This repository is part of the ImmutableX Configurable Developer Toolkit consisting of Frontend minting dapp + Backend minter + Ethereum Solidity contract, three key pieces of software every project on ImmutableX needs to launch its own collection.  The goal was to make onboarding new projects as seamless as possible with little to no programming involved (configuration only), yet allow flexibility and extra features. Please find short overview of each repository below:    
    
**Backend Minter**    
 https://github.com/0xiliyan/imx-dapp-backend    
    
A set of configurable Node.js scripts that can be used for minting on ImmutableX, airdropping NFTs from external CSV datasource, adding minting royalties, etc.    
    
**Frontend Minting Dapp**    
 https://github.com/0xiliyan/imx-dapp-frontend    
    
React.js configurable frontend minting dapp.    
    
**Ethereum Solidity Contract**    
 https://github.com/0xiliyan/imx-dapp-contract  
  
Ready-to-deploy Solidity contract, necessary for integration with ImmutableX.    
    
    
## Installation    
1) Install all necessary project dependencies from `package.json`:    
    
```npm install ```     

2) Compile the application:

```npm run start ```     


 ## Configuration    
There is a sample theme for the frontend minting dapp which is completely configurable:

![Sample Minting Dapp Layout](https://coinlistwiki.com/img/minting_dapp_example.png)

Lets go over the available configuration options, which can be found in `src/App.js`, it should be pretty self explanatory.

### Collection Related Configuration:

You can change the mint cost, i.e. you have different costs for presale or public , max mints per user and the list of whitelisted addresses (most suitable for presale as public is usually open to everyone).
```javascript
// collection configuration  
const mintCost = 0.04;  
const maxMintsForUser = 2;  
const whitelistedAddresses = [  
    '',  
];  
```


Next, you have to provide the deposit wallet address that will accept the payment transfers from users.  set `isRopsten`to true if you're testing on Ropsten or false if the dapp is in production, ready for minting! 

```javascript
const depositWalletAddress = '';  
const endSaleAtDepositAmount = 0; // leave this to 0 for no limit  
const isMintingEnabled = true;  
const whitelistOnly = false;  
const isRopsten = true;
```
### Theme Related Configuration:

The minting dapp theme look can be configured as well with the options below
```javascript
// styling configuration  
const logoMaxWidth = '330px';  
const backgroundColor = '#070D2B';  
const textColor = '#6BF6F0';  
const buttonBackgroundColor = '#f900ff';  
const buttonColor = '#FFFFFF';
```
To change the minting dapp logo, just swap the logo at `public/images/logo.png`with your own logo.

The sample theme is using a default Google Font, which is placed in `public/index.html`. If you want to use another font simply insert the `<link>`tagin the header and change the font-family inside `src/globalStyles.js`

```css
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet">
```
If you want to make more advanced and bespoke theme customizations feel free to edit the CSS code found in `App.js` as well as write your own styles. Styled Components package has been used for styling the frontend dapp:

https://styled-components.com/

## Deployment

After compiling the application you can deploy the `build` folder to any hosting or server of your choice. Your minting dapp is ready! 

To compile the bundle, execute the following command in your terminal:

```npm run build ```     
