async function main() {
    const [deployer] = await ethers.getSigners(); // Getting the deployer account
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    // Get the ContractFactory for the Crowdfunding contract
    const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  
    // Deploy the contract
    console.log("Deploying contract...");
    const crowdfunding = await Crowdfunding.deploy();
    
    // Wait for the contract to be mined
    await crowdfunding.waitForDeployment();
  
    // Log the contract address after deployment
    console.log("Crowdfunding contract deployed to:", crowdfunding.target);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  