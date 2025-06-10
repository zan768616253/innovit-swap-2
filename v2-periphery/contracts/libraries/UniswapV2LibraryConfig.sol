pragma solidity =0.6.6;

library UniswapV2LibraryConfig {
    // Original Uniswap V2 init code hash (for mainnet/testing)
    bytes32 public constant MAINNET_INIT_CODE_HASH = 0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f;

    // Your custom init code hash (for Arbitrum Sepolia)
    bytes32 public constant ARBITRUM_SEPOLIA_INIT_CODE_HASH =
        0x3cbfc32c849afe4e535b057f794ebed9eaf51c9923dd8a7f871a30fa9ee03450;

    // Add more networks as needed
    bytes32 public constant LOCALHOST_INIT_CODE_HASH =
        0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f;
}
