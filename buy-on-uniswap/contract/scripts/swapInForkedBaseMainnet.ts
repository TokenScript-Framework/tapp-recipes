import {ethers, network, upgrades} from 'hardhat';
import { MockERC20, TokenBridgeV3 } from '../typechain-types';

let TokenBridgeV3, tokenBridge, owner, addr1, addr2;
let MockERC20, brett, usdt, weth;

const wealthyAddress = "0x9BA188E4B2C46C15450EA5Eac83A048E5E5D9444"
const testerAddress = "0x8646DF47d7b16Bf9c13Da881a2D8CDacDa8f5490";

const brettMainnetAddress = "0x532f27101965dd16442E59d40670FaF5eBB142E4"
const wethMainnetAddress = "0x4200000000000000000000000000000000000006"
const usdtMainnetAddress = "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2"

const uniswapRouterMainnetAddress = "0x2626664c2603336E57B271c5C0b26F421741e481"
//const usdtSlnPoolAddress = "0x291Db2c056D94017E67725e5133528851A156cD0"
//const ethSlnPoolAddress = "0xBa33A58609c1e2092F79C83C4432Ca3b81c5Fc0B"

let tx

async function main() {

    if (network.name !== "localhost"){
        console.log("Script for hardhat only. Exit...")
        return;
    }

    [owner, addr1, addr2] = await ethers.getSigners();
    const wealthySigner = await ethers.getImpersonatedSigner(wealthyAddress)
    
    // Deploy TokenBridgeV3
    TokenBridgeV3 = await ethers.getContractFactory("TokenBridgeV3");
    tokenBridge = await upgrades.deployProxy(TokenBridgeV3.connect(owner), [uniswapRouterMainnetAddress]) as unknown as TokenBridgeV3
    await tokenBridge.waitForDeployment()

    console.log("ETH balance = ", await ethers.provider.getBalance(wealthySigner.address))
    console.log("Bridge deployed... ", tokenBridge.target)
    
    // Deploy mock ERC20 tokens
    MockERC20 = await ethers.getContractFactory("MockERC20");
    brett = await MockERC20.attach(brettMainnetAddress) as MockERC20;
    weth = await MockERC20.attach(wethMainnetAddress) as MockERC20;
    usdt = await MockERC20.attach(usdtMainnetAddress) as MockERC20;
    console.log("ERC20 attached... ")

    const tx2 = await owner.sendTransaction({
        to: wealthySigner.address,
        value: ethers.parseEther("1"), // 1 ETH
        gasLimit: 100_000,
      });
      await tx2.wait();
    console.log("1 ETH transferred to BRETT owner... ")

    tx = await owner.sendTransaction({
        to: testerAddress,
        value: ethers.parseEther("1"), // 1 ETH
        gasLimit: 100_000,
    });
    await tx.wait();
    console.log("1 ETH transferred to tester... ")

    tx = await brett.connect(wealthySigner).transfer(testerAddress, ethers.parseEther("10"));
    await tx.wait()
    console.log("10 BRETT transferred to tester...")
    
    const params = {
        tokenIn: brett.target,
        tokenOut: weth.target,
        fee: 10000, // 1% fee tier
        recipient: wealthySigner.address,
        amountIn: ethers.parseEther("0.01"),
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

    tx = await brett.connect(wealthySigner).approve(tokenBridge.target, params.amountIn);
    await tx.wait()
    console.log("approved transfer BRETT to bridge...")
    const swapId = 1;

    console.log("\nUSDT balance before swap = ", await usdt.balanceOf(wealthySigner.address))
    console.log("WETH balance before swap = ", await weth.balanceOf(wealthySigner.address))
    console.log("BRETT balance before swap = ", await brett.balanceOf(wealthySigner.address))
    
    tx = await tokenBridge.connect(wealthySigner).swapTokens(
        swapId,
        params.tokenIn,
        params.tokenOut,
        params.fee,
        params.recipient,
        params.amountIn,
        params.amountOutMinimum,
        params.sqrtPriceLimitX96
    )
    await tx.wait()

    console.log("\nUSDT balance before swap = ", await usdt.balanceOf(wealthySigner.address))
    console.log("WETH balance before swap = ", await weth.balanceOf(wealthySigner.address))
    console.log("BRETT balance before swap = ", await brett.balanceOf(wealthySigner.address))

    // console.log(await brig)

}

main().then(console.log).catch(console.log);


