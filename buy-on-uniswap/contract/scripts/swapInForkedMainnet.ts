import {ethers, network, upgrades} from 'hardhat';
import { MockERC20, TokenBridgeV3 } from '../typechain-types';

let TokenBridgeV3, tokenBridge, owner, addr1, addr2;
let MockERC20, sln, usdt, weth;

const slnOwnerAddress = "0x38CDdcCB57BB40906fe2e99aB389ba3Ab7f5ab53"

const slnMainnetAddress = "0xDb82c0d91E057E05600C8F8dc836bEb41da6df14"
const wethMainnetAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const usdtMainnetAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"

const uniswapRouterMainnetAddress = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"
const usdtSlnPoolAddress = "0x291Db2c056D94017E67725e5133528851A156cD0"
const ethSlnPoolAddress = "0xBa33A58609c1e2092F79C83C4432Ca3b81c5Fc0B"

let tx

async function main() {
    if (network.name !== "hardhat"){
        console.log("Script for hardhat only. Exit...")
        return;
    }

    [owner, addr1, addr2] = await ethers.getSigners();
    const wealthySigner = await ethers.getImpersonatedSigner(slnOwnerAddress)
    
    // Deploy TokenBridgeV3
    TokenBridgeV3 = await ethers.getContractFactory("TokenBridgeV3");
    tokenBridge = await upgrades.deployProxy(TokenBridgeV3.connect(owner), [uniswapRouterMainnetAddress]) as unknown as TokenBridgeV3
    await tokenBridge.waitForDeployment()

    console.log("ETH balance = ", await ethers.provider.getBalance(wealthySigner.address))
    console.log("Bridge deployed... ", tokenBridge.target)
    
    // Deploy mock ERC20 tokens
    MockERC20 = await ethers.getContractFactory("MockERC20");
    sln = await MockERC20.attach(slnMainnetAddress) as MockERC20;
    weth = await MockERC20.attach(wethMainnetAddress) as MockERC20;
    usdt = await MockERC20.attach(usdtMainnetAddress) as MockERC20;
    console.log("ERC20 attached... ")

    const tx2 = await owner.sendTransaction({
        to: wealthySigner.address,
        value: 10n ** 18n, // 1 ETH
        gasLimit: 100_000,
      });
      await tx2.wait();
    console.log("1 ETH transferred to SLN owner... ")
    
    const params = {
        tokenIn: sln.target,
        tokenOut: weth.target,
        fee: 10000,
        recipient: wealthySigner.address,
        amountIn: ethers.parseEther("1"),
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    }
    // works good
    // const iSwapRouter = new ethers.Contract(uniswapRouterMainnetAddress, swapAbi, ethers.provider)
    // tx = await sln.connect(wealthySigner).approve(uniswapRouterMainnetAddress, ethers.parseEther("1000"));
    // await tx.wait()
    // tx = await iSwapRouter.connect(wealthySigner).exactInputSingle(params)
    // console.log(tx)
    // console.log(await tx.wait())
    
    // console.log({params})

    tx = await sln.connect(wealthySigner).approve(tokenBridge.target, params.amountIn);
    await tx.wait()
    console.log("approved transfer SLN to bridge...")
    const swapId = 1;

    console.log("\nUSDT balance before swap = ", await usdt.balanceOf(wealthySigner.address))
    console.log("WETH balance before swap = ", await weth.balanceOf(wealthySigner.address))
    console.log("SLN balance before swap = ", await sln.balanceOf(wealthySigner.address))
    
    tx = await tokenBridge.connect(wealthySigner).swapTokens(
        swapId,
        params.tokenIn,
        params.tokenOut,
        params.amountIn,
        params.amountOutMinimum
    )
    await tx.wait()

    console.log("\nUSDT balance before swap = ", await usdt.balanceOf(wealthySigner.address))
    console.log("WETH balance before swap = ", await weth.balanceOf(wealthySigner.address))
    console.log("SLN balance before swap = ", await sln.balanceOf(wealthySigner.address))

    // console.log(await brig)

}

main().then(console.log).catch(console.log);


