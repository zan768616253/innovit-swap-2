const {ethers} = require("hardhat");

const main = async () => {
    const [owner]  = await ethers.getSigners();
    console.log("Deploying contracts with the account:", owner.address);

    const initialSupply = ethers.parseUnits("5000000", 18); // 5,000,000 tokens with 18 decimals
    const copper = await ethers.getContractFactory("TokenCopper");
    const copperInstance = await copper.deploy(initialSupply);
    await copperInstance.waitForDeployment();
    const copperAddress = await copperInstance.getAddress();
    console.log("Token Copper deployed to:", copperAddress);

    // Add delay before verification to ensure the contract is deployed and indexed
    console.log("Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 20000)); // 30 seconds delay  

    // Verify contract
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: copperAddress,
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