pragma solidity =0.6.6;

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import '@uniswap/lib/contracts/libraries/Babylonian.sol';
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';

import '../libraries/UniswapV2LiquidityMathLibrary.sol';
import '../interfaces/IERC20.sol';
import '../interfaces/IUniswapV2Router01.sol';
import '../libraries/SafeMath.sol';
import '../libraries/UniswapV2LibraryLocal.sol';

contract ExampleSwapToPriceLocal {
    using SafeMath for uint256;

    // Add debug events
    event DebugLog(string message);
    event DebugUint(string message, uint256 value);
    event DebugAddress(string message, address value);
    event DebugBool(string message, bool value);
    event DebugReserves(uint256 reserveA, uint256 reserveB);

    IUniswapV2Router01 public immutable router;
    address public immutable factory;

    constructor(address factory_, IUniswapV2Router01 router_) public {
        factory = factory_;
        router = router_;
    }

    function testDebugMessages() public {
        emit DebugLog('This is a debug log message');
        emit DebugUint('Debugging uint value', 42);
        emit DebugAddress('Debugging address', msg.sender);
        emit DebugBool('Debugging boolean value', true);
        emit DebugReserves(1000, 2000);
    }

    // swaps an amount of either token such that the trade is profit-maximizing, given an external true price
    // true price is expressed in the ratio of token A to token B
    // caller must approve this contract to spend whichever token is intended to be swapped
    function swapToPrice(
        address tokenA,
        address tokenB,
        uint256 truePriceTokenA,
        uint256 truePriceTokenB,
        uint256 maxSpendTokenA,
        uint256 maxSpendTokenB,
        address to,
        uint256 deadline
    ) public {
        emit DebugLog('Starting swapToPrice');
        emit DebugAddress('TokenA', tokenA);
        emit DebugAddress('TokenB', tokenB);
        emit DebugUint('TruePriceTokenA', truePriceTokenA);
        emit DebugUint('TruePriceTokenB', truePriceTokenB);

        // true price is expressed as a ratio, so both values must be non-zero
        require(truePriceTokenA != 0 && truePriceTokenB != 0, 'ExampleSwapToPrice: ZERO_PRICE');
        // caller can specify 0 for either if they wish to swap in only one direction, but not both
        require(maxSpendTokenA != 0 || maxSpendTokenB != 0, 'ExampleSwapToPrice: ZERO_SPEND');

        bool aToB;
        uint256 amountIn;
        {
            (uint256 reserveA, uint256 reserveB) = UniswapV2LibraryLocal.getReserves(factory, tokenA, tokenB);
            emit DebugReserves(reserveA, reserveB);

            emit DebugLog('Before computeProfitMaximizingTrade');
            // Just call the function directly and use event logging
            (aToB, amountIn) = UniswapV2LiquidityMathLibrary.computeProfitMaximizingTrade(
                truePriceTokenA,
                truePriceTokenB,
                reserveA,
                reserveB
            );
            emit DebugBool('aToB', aToB);
            emit DebugUint('amountIn', amountIn);
        }

        require(amountIn > 0, 'ExampleSwapToPrice: ZERO_AMOUNT_IN');

        emit DebugLog('After require amountIn check');
        emit DebugUint('maxSpendTokenA', maxSpendTokenA);
        emit DebugUint('maxSpendTokenB', maxSpendTokenB);

        // spend up to the allowance of the token in
        uint256 maxSpend = aToB ? maxSpendTokenA : maxSpendTokenB;
        if (amountIn > maxSpend) {
            amountIn = maxSpend;
        }

        address tokenIn = aToB ? tokenA : tokenB;
        address tokenOut = aToB ? tokenB : tokenA;
        TransferHelper.safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);
        TransferHelper.safeApprove(tokenIn, address(router), amountIn);

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        router.swapExactTokensForTokens(
            amountIn,
            0, // amountOutMin: we can skip computing this number because the math is tested
            path,
            to,
            deadline
        );
        emit DebugLog('Swap completed successfully');
    }
}
