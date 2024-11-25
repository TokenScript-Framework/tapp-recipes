import {ethers, network, upgrades} from 'hardhat';
import { MockERC20, TokenBridgeV3 } from '../typechain-types';

let TokenBridgeV3, tokenBridge, owner, addr1, addr2;
let MockERC20, token2, token1;

// const tokenOwnerAddress = "0xDa7747948c0e47339909dfCc1581c5D79812acf0"
const tokenOwnerAddress = "0xDa7747948c0e47339909dfCc1581c5D79812acf0"

// const slnBaseSepoliaAddress = "0x74dDb1C0692Df4930cE6aFe9325d1A6fe632C0Bc"
// const token1Address = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
// const token2Address = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
const token1Address = "0x2120B4404810796edaF3EfF5Da58F010e78b75A9"
const token2Address = "0xb85Df74eB6db8C2D87c3bD7d4Ee1A27929643dA3"

const uniswapRouterBaseSepoliaAddress = "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4"
// const usdtSlnPoolAddress = "0x291Db2c056D94017E67725e5133528851A156cD0"
// const ethSlnPoolAddress = "0xBa33A58609c1e2092F79C83C4432Ca3b81c5Fc0B"

let tx

async function main() {
    if (network.name !== "hardhat"){
        console.log("Script for hardhat only. Exit...")
        return;
    }

    [owner, addr1, addr2] = await ethers.getSigners();
    const wealthySigner = await ethers.getImpersonatedSigner(tokenOwnerAddress)
    
    // Deploy TokenBridgeV3
    TokenBridgeV3 = await ethers.getContractFactory("TokenBridgeV3");
    tokenBridge = await upgrades.deployProxy(TokenBridgeV3.connect(owner), [uniswapRouterBaseSepoliaAddress]) as unknown as TokenBridgeV3
    await tokenBridge.waitForDeployment()

    console.log("ETH balance = ", await ethers.provider.getBalance(wealthySigner.address))
    console.log("Bridge deployed... ", tokenBridge.target)
    
    // Deploy mock ERC20 tokens
    MockERC20 = await ethers.getContractFactory("MockERC20");
    // sln = await MockERC20.attach(slnBaseSepoliaAddress) as MockERC20;
    token1 = await MockERC20.attach(token1Address) as MockERC20;
    token2 = await MockERC20.attach(token2Address) as MockERC20;
    console.log("ERC20 attached... ")

    const tx2 = await owner.sendTransaction({
        to: wealthySigner.address,
        value: 10n ** 18n, // 1 ETH
        gasLimit: 100_000,
      });
      await tx2.wait();
    console.log("1 ETH transferred to SLN owner... ")
    
    const params = {
        tokenIn: token2.target,
        tokenOut: token1.target,
        fee: 10000,
        recipient: wealthySigner.address,
        amountIn: ethers.parseEther("1"),
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    }
    // works good
    // const iSwapRouter = new ethers.Contract(uniswapRouterBaseSepoliaAddress, swapAbi, ethers.provider)
    // tx = await sln.connect(wealthySigner).approve(uniswapRouterBaseSepoliaAddress, ethers.parseEther("1000"));
    // await tx.wait()
    // tx = await iSwapRouter.connect(wealthySigner).exactInputSingle(params)
    // console.log(tx)
    // console.log(await tx.wait())
    
    // console.log({params})

    tx = await token2.connect(wealthySigner).approve(tokenBridge.target, params.amountIn);
    await tx.wait()
    console.log("approved transfer SLN to bridge...")
    const swapId = 1;

    console.log("token1 balance before swap = ", await token1.balanceOf(wealthySigner.address))
    console.log("token2 balance before swap = ", await token2.balanceOf(wealthySigner.address))
    
    tx = await tokenBridge.connect(wealthySigner).swapTokens(
        swapId,
        params.tokenIn,
        params.tokenOut,
        params.amountIn,
        params.amountOutMinimum
    )
    await tx.wait()

    console.log("token1 balance before swap = ", await token1.balanceOf(wealthySigner.address))
    console.log("token2 balance before swap = ", await token2.balanceOf(wealthySigner.address))

    // console.log(await brig)

}

main().then(console.log).catch(console.log);


