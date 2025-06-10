const {ethers} = require("hardhat");

const main = async () => {
    const [owner]  = await ethers.getSigners();
    console.log("Deploying contracts with the account:", owner.address);

    const factoryAddress = "0x16161b3Ac640D748F6216FB37b21BCDb1A1367F7";  // Factory address
    const wethAddress = "0x4355bd875B3DF7C82d3bC3726601A856103bbd74";     // WETH address
    
    const router02 = await ethers.getContractFactory("UniswapV2Router02");
    const router02Instance = await router02.deploy(factoryAddress, wethAddress);
    await router02Instance.waitForDeployment();
    const router02Address = await router02Instance.getAddress();
    console.log("Router02 deployed to:", router02Address);

    // Add delay before verification to ensure the contract is deployed and indexed
    console.log("Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 20000)); // 30 seconds delay  

    // Verify contract
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: router02Address,
            constructorArguments: [factoryAddress, wethAddress],
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

// Factory Address = "0x16161b3Ac640D748F6216FB37b21BCDb1A1367F7"
// WETH Address = "0x4355bd875B3DF7C82d3bC3726601A856103bbd74"

