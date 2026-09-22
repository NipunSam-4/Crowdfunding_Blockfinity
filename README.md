# Blockfinity

## Team Members

* Nipun Samal 230041025
* Subhankar Das 230001073
* Salaj Bansal 230002063
* Abhash Raj 230001002
* Sanat Kumar Shukla 230005043
* Abhijeet Singh Parihar 230005001

---

## Set Up Hardhat Project

Initialize a new Hardhat project by running:

```bash
npx hardhat
```

Follow the prompts to create a basic project.

## Install Dependencies

Install necessary packages:

```bash
npm install @openzeppelin/contracts ethers
```

## Create Smart Contract

In the `contracts` folder, create a new file named `Crowdfunding.sol` and implement your smart contract code.

## Compile Contracts

Compile your contracts using:

```bash
npx hardhat compile
```

## Deploy Contract

Create a deployment script in the `scripts` folder, e.g., `scripts/deploy.js`, and write the deployment logic.

Deploy the contract to the local Hardhat network by running:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

## Interact with Contract

Open the Hardhat console with:

```bash
npx hardhat console --network localhost
```

Interact with your deployed contract using the console.

## Front-End Development

Install front-end dependencies:

```bash
npm install ethers react
```

Start the development server:

```bash
npm run dev
```

## Testing

Run tests using:

```bash
npx hardhat test
```

## Useful Commands

| Command                                                 | Description        |
| ------------------------------------------------------- | ------------------ |
| `npx hardhat node`                                      | Start Hardhat node |
| `npx hardhat compile`                                   | Compile contracts  |
| `npx hardhat run scripts/deploy.js --network localhost` | Deploy contract    |
| `npx hardhat test`                                      | Run tests          |
