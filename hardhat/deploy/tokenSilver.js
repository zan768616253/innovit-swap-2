const {ethers} = require("hardhat");

const main = async () => {
    const [owner]  = await ethers.getSigners();
    console.log("Deploying contracts with the account:", owner.address);

    const initialSupply = ethers.parseUnits("500000", 18); // 500,000 tokens with 18 decimals
    const silver = await ethers.getContractFactory("TokenSilver");
    const silverInstance = await silver.deploy(initialSupply);
    await silverInstance.waitForDeployment();
    const silverAddress = await silverInstance.getAddress();
    console.log("Token Silver deployed to:", silverAddress);

    // Add delay before verification to ensure the contract is deployed and indexed
    console.log("Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 20000)); // 30 seconds delay  

    // Verify contract
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: silverAddress,
            constructorArguments: [initialSupply],
        });
        console.log("Contract verified successfully");
    } catch (error) {
        if (error.message.includes("already verified")) {
            console.log("Contract is already verified");
        } else {
            console.error("Error verifying contract:", error);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});