const {ethers} = require("hardhat");

const main = async () => {
    const [owner]  = await ethers.getSigners();
    console.log("Deploying contracts with the account:", owner.address);

    const multiCall = await ethers.getContractFactory("Multicall");
    const multiCallInstance = await multiCall.deploy();
    await multiCallInstance.waitForDeployment();
    const multiCallAddress = await multiCallInstance.getAddress();
    console.log("MultiCall deployed to:", multiCallAddress);    
        
    console.log("Waiting for 5 confirmations...");
    await multiCallInstance.deploymentTransaction().wait(5); // Replace artificial delay with real confirmation

    // Verify contract
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: multiCallAddress,
            constructorArguments: []
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