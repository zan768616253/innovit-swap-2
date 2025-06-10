const {ethers} = require("hardhat");

const main = async () => {
    const [owner]  = await ethers.getSigners();
    console.log("Deploying contracts with the account:", owner.address);

    const factory = await ethers.getContractFactory("UniswapV2Factory");
    const factoryInstance = await factory.deploy(owner.address);
    await factoryInstance.waitForDeployment();
    const factoryAddress = await factoryInstance.getAddress();
    console.log("UniswapV2Factory deployed to:", factoryAddress);

    // Add delay before verification to ensure the contract is deployed and indexed
    console.log("Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 90000)); // 90 seconds delay  

    // Verify contract
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: factoryAddress,
            constructorArguments: [owner.address],
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