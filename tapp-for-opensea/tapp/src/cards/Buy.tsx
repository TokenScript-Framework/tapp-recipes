import React, { useState, useEffect } from "react";
import Loader from "../components/loader/loader";
import { ethers } from "ethers";
import axios from "axios";
import { Seaport } from "@opensea/seaport-js";
import { OPENSEA_CONDUIT_KEY } from "@opensea/seaport-js/lib/constants";
import { Chain } from "opensea-js";
import { createPublicClient, custom } from 'viem'
import { tokenData } from "@token-kit/onchain";

import { base, baseSepolia } from "viem/chains";

import opensearSVG from "../assets/opensea.svg"
import { isTestChain } from "../components/lib/utils";

interface OrderType {
    orderHash: string;
    protocolAddress: string;
    protocolData: any; // 如果可能，这里也应该定义具体类型
}

interface Token {
    image: string;
    attributes:
    {
        "trait_type": string;
        "value": string | number
    }[];
    name: string;
    description: string;
}

// @ts-ignore
export const Buy: React.FC = () => {
    const [orderHash, setOrderHash] = useState<`0x${string}` | null>(null);
    const [protocolAddress, setProtocolAddress] = useState<`0x${string}` | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [order, setOrder] = useState<any>();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState<Token | null>(null)
    const [transactionHash, setTransactionHash] = useState<string>('');

    const isProd = !isTestChain(chainID)

    const SCAN_BASE_URL = isProd ? 'https://basescan.org' : 'https://sepolia.basescan.org';

    async function loadOrder(orderHash: `0x${string}`, protocolAddress: `0x${string}`) {

        const orderDetail = (
            await axios.get(
                `https://testnets-api.opensea.io/api/v2/orders/chain/${isProd ? Chain.Base : Chain.BaseSepolia}/protocol/${protocolAddress}/${orderHash}`
            )
        ).data.order;
        console.log(orderDetail)

        const considerations = orderDetail.protocol_data.parameters.consideration;

        const taker = considerations.length === 3 ? considerations[2].recipient : null;

        return {
            orderHash: orderHash,
            currentPrice: `${ethers.formatEther(orderDetail.price.current.value)} ${orderDetail.price.current.currency}`,
            protocolAddress: protocolAddress,
            protocolData: orderDetail.protocol_data,
            taker: taker,
            asset: {
                tokenContract: orderDetail.protocol_data.parameters.offer[0].token,
                tokenId: orderDetail.protocol_data.parameters.offer[0].identifierOrCriteria

            },
            startTime: orderDetail.protocol_data.parameters.startTime,
            endTime: orderDetail.protocol_data.parameters.endTime
        };
    }

    async function getMetadata(contract: `0x${string}`, tokenId: string) {
        try {
            const walletClient = createPublicClient({
                chain: isProd ? base : baseSepolia,
                transport: custom(window.ethereum),
            });

            const result = await tokenData(
                walletClient,
                contract,
                Number(tokenId), { includeTokenMetadata: true },
            );

            if ('tokenMetadata' in result) {
                return result.tokenMetadata;
            }
            throw new Error('Token metadata not available');
        } catch (error) {
            throw error instanceof Error ? error : new Error('Unknown error occurred');

        }
    }

    function getParams() {
        const params = new URLSearchParams(document.location.hash.replace('#', ''));
        if (params.get('orderHash')) {
            setOrderHash(params.get('orderHash') as `0x${string}`)
            setProtocolAddress(params.get('protocolAddress') as `0x${string}`)
        }
    }

    async function fulfilLsting(order: OrderType) {
        try {
            setConfirming(true);
            setError('')
            setSuccess(false);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const result = (
                await axios.post(
                    "https://testnets-api.opensea.io/api/v2/listings/fulfillment_data",
                    {
                        listing: {
                            hash: order.orderHash,
                            chain: isProd ? Chain.Base : Chain.BaseSepolia,
                            protocol_address: order.protocolAddress,
                        },
                        fulfiller: { address: walletAddress },
                    }
                )
            ).data;


            const signature = result.fulfillment_data.orders[0].signature;
            const protocolData = order.protocolData;

            protocolData.signature = signature;
            const checksummedProtocolAddress = ethers.getAddress(
                order.protocolAddress
            );

            const seaport = new Seaport(await provider.getSigner(), {
                overrides: {
                    contractAddress: checksummedProtocolAddress,
                    seaportVersion: "1.6",
                    defaultConduitKey: OPENSEA_CONDUIT_KEY,
                },
            });
            const { executeAllActions } = await seaport.fulfillOrder({
                order: protocolData,
                accountAddress: walletAddress,
            });
            const transaction = await executeAllActions();
            setTransactionHash(transaction.hash)
            setSuccess(true);

        } catch (error) {
            console.log('ERROR', error)
            setError(parseError(String(error)))
        } finally {
            setConfirming(false)
        }
    }

    function parseError(error: string) {
        if (error.includes("ACTION_REJECTED")) {
            return "User rejected the transaction."
        } {
            return error
        }
    }

    useEffect(() => {
        setLoading(true);
        getParams()
        if (orderHash && protocolAddress) {
            try {
                loadOrder(orderHash, protocolAddress).then(async (order) => {
                    console.log("orders-----", order)
                    setOrder(order);
                    try {
                        const result = await getMetadata(order.asset.tokenContract, order.asset.tokenId)
                        console.log("tokenMetadata--", result)
                        setToken(result as Token)
                    } catch (error) {
                        console.log("Error for getMetadata: ", error)
                        setToken({
                            image: '',
                            attributes: [],
                            name: '',
                            description: 'unknow'
                        })
                    } finally {
                        setLoading(false);
                    }
                });
            } catch (error) {
                console.log("Error for loadOrder:", error)
            } finally {
                setLoading(false);
            }
        }
    }, [orderHash, protocolAddress]);

    if (loading) {
        return (<div className="h-[100vh] flex items-center justify-center">
            <Loader show={loading} />
        </div>)
    }

    return (
        <div className="p-0">
            {order ? (
                <div className="w-full">
                    <div className="rounded-[8px] border mb-8 w-full">
                        <div className="bg-gray-100">
                            {token?.image ? (
                                <img
                                    src={token?.image}
                                    alt={token?.name} />
                            ) : (
                                <div className="relative w-full h-72 bg-gray-100 flex items-center justify-center">
                                    <div className="relative w-full h-full p-10">
                                        <img
                                            src={opensearSVG}
                                            alt='NFT' className="w-full h-full opacity-10" />
                                    </div>
                                </div>
                            )}


                        </div>
                        <div className="p-3 rounded font-bold text-lg">
                            <p className="truncate">{token?.name || 'Unknown'}</p>
                            <p className="uppercase">{order.currentPrice}</p>
                        </div>
                    </div>

                    <div>
                        {order.endTime < (Math.floor(Date.now() / 1000)) && (
                            <div className="p-4 text-red-500 text-center rounded-lg">
                                Order expired
                            </div>
                        )}

                        {(order.endTime > (Math.floor(Date.now() / 1000)) && (!order.taker || order.taker === walletAddress)) && (
                            <button
                                onClick={() => fulfilLsting(order)}
                                disabled={confirming}
                                className={`w-full font-bold py-2 px-4 rounded-[8px] ${confirming
                                    ? 'bg-blue-300 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-700'
                                    } text-white`}
                            >
                                Confirm
                            </button>
                        )}
                        {error && (
                            <div className="p-4 text-red-500  rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 text-green-900 ">
                                Success! 🎉 Please access <a href={`${SCAN_BASE_URL}/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">Transaction Scan</a> to view the transaction details.
                            </div>
                        )}

                    </div>
                </div>
            )
                : (
                    <div className="h-[100vh] flex items-center justify-center">
                        <div className="font-bold text-4xl">
                            No orders!
                        </div>
                    </div>
                )
            }

            <Loader show={confirming} />
        </div>
    );
};
