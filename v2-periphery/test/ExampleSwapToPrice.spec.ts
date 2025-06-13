import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { MaxUint256 } from 'ethers/constants'
import { BigNumber, bigNumberify, defaultAbiCoder, formatEther, Interface, keccak256 } from 'ethers/utils'
import { solidity, MockProvider, createFixtureLoader, deployContract } from 'ethereum-waffle'

import { expandTo18Decimals } from './shared/utilities'
import { v2Fixture } from './shared/fixtures'

import ExampleSwapToPrice from '../build/ExampleSwapToPrice.json'
import UniswapV2Pair from '../../v2-core/build/UniswapV2Pair.json' // ← Add this import


chai.use(solidity)

const overrides = {
  gasLimit: 9999999
}

describe('ExampleSwapToPrice', () => {
    
  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
    gasLimit: 9999999
  })
  const [wallet] = provider.getWallets()
  const loadFixture = createFixtureLoader(provider, [wallet])

  before(async () => {
    const initCodeHash = keccak256('0x' + UniswapV2Pair.bytecode);
    
    console.log("Init code hash:", initCodeHash);
    console.log("For solidity (without 0x):", initCodeHash.slice(2));
  })

  let token0: Contract
  let token1: Contract
  let pair: Contract
  let swapToPriceExample: Contract
  let router: Contract

  beforeEach(async function() {
    try {        
        const fixture = await loadFixture(v2Fixture)
        token0 = fixture.token0
        token1 = fixture.token1
        pair = fixture.pair
        router = fixture.router

        swapToPriceExample = await deployContract(
            wallet,
            ExampleSwapToPrice,
            [fixture.factoryV2.address, fixture.router.address],
            overrides
        )

        // Add safety checks
        if (!swapToPriceExample) {
            throw new Error("Contract deployment returned undefined");
        }

        if (!swapToPriceExample.address) {
            throw new Error("Contract deployment succeeded but no address returned");
        }

        // Test that the contract is accessible
        const routerAddress = await swapToPriceExample.router();

    } catch (error) {        
        throw error;
    }
  })

  beforeEach('set up price differential of 1:100', async () => {
    await token0.transfer(pair.address, expandTo18Decimals(10))
    await token1.transfer(pair.address, expandTo18Decimals(1000))
    await pair.sync(overrides)
  })

  beforeEach('approve the swap contract to spend any amount of both tokens', async () => {
    await token0.approve(swapToPriceExample.address, MaxUint256)
    await token1.approve(swapToPriceExample.address, MaxUint256)
  })

  it('correct router address', async () => {
    expect(await swapToPriceExample.router()).to.eq(router.address)
  })

  describe('#swapToPrice', () => {
    
    // Add this test first
    it('should have contract deployed', async () => {        
        expect(swapToPriceExample).to.not.be.undefined;
        expect(swapToPriceExample.address).to.not.be.undefined;
    
    });

    it('requires non-zero true price inputs', async () => {
      await expect(
        swapToPriceExample.swapToPrice(
          token0.address,
          token1.address,
          0,
          0,
          MaxUint256,
          MaxUint256,
          wallet.address,
          MaxUint256
        )
      ).to.be.revertedWith('ExampleSwapToPrice: ZERO_PRICE')
      await expect(
        swapToPriceExample.swapToPrice(
          token0.address,
          token1.address,
          10,
          0,
          MaxUint256,
          MaxUint256,
          wallet.address,
          MaxUint256
        )
      ).to.be.revertedWith('ExampleSwapToPrice: ZERO_PRICE')
      await expect(
        swapToPriceExample.swapToPrice(
          token0.address,
          token1.address,
          0,
          10,
          MaxUint256,
          MaxUint256,
          wallet.address,
          MaxUint256
        )
      ).to.be.revertedWith('ExampleSwapToPrice: ZERO_PRICE')
    })

    it('requires non-zero max spend', async () => {
      await expect(
        swapToPriceExample.swapToPrice(token0.address, token1.address, 1, 100, 0, 0, wallet.address, MaxUint256)
      ).to.be.revertedWith('ExampleSwapToPrice: ZERO_SPEND')
    })

    // it('test debug messages', async () => {
    //     try {
                      
    //         console.log("Debug messages test started");

    //         const tx = await swapToPriceExample.testDebugMessages();

    //         // Wait for transaction and capture events
    //         const receipt = await tx.wait();

    //         // Print all emitted events to see what's happening
    //         if (receipt.events) {
    //             receipt.events.forEach((event: {event: string; args: any[]}, i: number) => {
    //                 if (event.event === "DebugLog" || event.event === "DebugUint" || 
    //                     event.event === "DebugReserves" || event.event === "DebugBool" ||
    //                     event.event === "DebugAddress") {
    //                 // console.log(`Event ${i}: ${event.event}`, event.args);
    //                 }
    //             });
    //         }
    //         console.log("Debug messages test Done");
    //     }  catch (error) {
    //         console.error("Debug messages test error:", error);
    //         throw error;
    //     }
    // })
    
    it('moves the price to 1:90', async () => {
      await expect(
        swapToPriceExample.swapToPrice(
          token0.address,
          token1.address,
          1,
          90,
          MaxUint256,
          MaxUint256,
          wallet.address,
          MaxUint256,
          overrides
        )
      )
        // (1e19 + 526682316179835569) : (1e21 - 49890467170695440744) ~= 1:90
        .to.emit(token0, 'Transfer')
        .withArgs(wallet.address, swapToPriceExample.address, '526682316179835569')
        .to.emit(token0, 'Approval')
        .withArgs(swapToPriceExample.address, router.address, '526682316179835569')
        .to.emit(token0, 'Transfer')
        .withArgs(swapToPriceExample.address, pair.address, '526682316179835569')
        .to.emit(token1, 'Transfer')
        .withArgs(pair.address, wallet.address, '49890467170695440744')       
    })

    it('moves the price to 1:110', async () => {
      await expect(
        swapToPriceExample.swapToPrice(
          token0.address,
          token1.address,
          1,
          110,
          MaxUint256,
          MaxUint256,
          wallet.address,
          MaxUint256,
          overrides
        )
      )
        // (1e21 + 47376582963642643588) : (1e19 - 451039908682851138) ~= 1:110
        .to.emit(token1, 'Transfer')
        .withArgs(wallet.address, swapToPriceExample.address, '47376582963642643588')
        .to.emit(token1, 'Approval')
        .withArgs(swapToPriceExample.address, router.address, '47376582963642643588')
        .to.emit(token1, 'Transfer')
        .withArgs(swapToPriceExample.address, pair.address, '47376582963642643588')
        .to.emit(token0, 'Transfer')
        .withArgs(pair.address, wallet.address, '451039908682851138')
    })

    it('reverse token order', async () => {
      await expect(
        swapToPriceExample.swapToPrice(
          token1.address,
          token0.address,
          110,
          1,
          MaxUint256,
          MaxUint256,
          wallet.address,
          MaxUint256,
          overrides
        )
      )
        // (1e21 + 47376582963642643588) : (1e19 - 451039908682851138) ~= 1:110
        .to.emit(token1, 'Transfer')
        .withArgs(wallet.address, swapToPriceExample.address, '47376582963642643588')
        .to.emit(token1, 'Approval')
        .withArgs(swapToPriceExample.address, router.address, '47376582963642643588')
        .to.emit(token1, 'Transfer')
        .withArgs(swapToPriceExample.address, pair.address, '47376582963642643588')
        .to.emit(token0, 'Transfer')
        .withArgs(pair.address, wallet.address, '451039908682851138')
    })

    it('swap gas cost', async () => {
      const tx = await swapToPriceExample.swapToPrice(
        token0.address,
        token1.address,
        1,
        110,
        MaxUint256,
        MaxUint256,
        wallet.address,
        MaxUint256,
        overrides
      )
      const receipt = await tx.wait()
    //   expect(receipt.gasUsed).to.be.within(110000, 150000); ???
    }).retries(2) // gas test is inconsistent
  })
})
