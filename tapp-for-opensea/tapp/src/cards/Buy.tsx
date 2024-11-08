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

import openseaSVG from "../assets/opensea.svg"
import { addressPipe, isTestChain } from "../components/lib/utils";
import { CountdownTimer } from "../components/timer";

interface OrderType {
    orderHash: string;
    protocolAddress: string;
    protocolData: any; 
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
    const [seaport, setSeaport] = useState<any>();

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

        const seaportInstance = await initSeaport(protocolAddress);
        const orderStatus = await seaportInstance.getOrderStatus(orderHash);
        console.log("result---", orderStatus)
        const isCompleted = orderStatus.totalFilled > 0;

        return {
            orderHash: orderHash,
            currentPrice: `${ethers.formatEther(orderDetail.price.current.value)} ${orderDetail.price.current.currency}`,
            protocolAddress: protocolAddress,
            protocolData: orderDetail.protocol_data,
            taker: taker,
            completed: isCompleted,
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
        if (params.get('orderHash') && params.get('protocolAddress')) {
            setOrderHash(params.get('orderHash') as `0x${string}`)
            setProtocolAddress(params.get('protocolAddress') as `0x${string}`)

        }
    }

    async function initSeaport(protocolAddress: string) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const checksummedProtocolAddress = ethers.getAddress(protocolAddress);
        const seaportInstance = new Seaport(await provider.getSigner(), {
            overrides: {
                contractAddress: checksummedProtocolAddress,
                seaportVersion: "1.6",
                defaultConduitKey: OPENSEA_CONDUIT_KEY,
            },
        });
        setSeaport(seaportInstance);
        return seaportInstance;
    }

    async function fulfilLsting(order: OrderType) {
        try {
            setConfirming(true);
            setError('')
            setSuccess(false);
           
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
        console.log()
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
                setLoading(false);
            }
        }
    }, [orderHash, protocolAddress]);

    function getButtonText(order: any) {
        if (order.completed) {
            return 'Order Completed';
        }
        if (order.endTime < (Math.floor(Date.now() / 1000))) {
            return 'Order expired';
        }
        if (order.taker && order.taker.toLowerCase() !== walletAddress?.toLowerCase()) {
            return `Reserved for ${addressPipe(order.taker)}`;
        }
        return 'Buy';
    }

    function isButtonDisabled(order: any) {
        return confirming ||
            order.completed ||
            (order.taker && order.taker.toLowerCase() !== walletAddress?.toLowerCase()) ||
            order.endTime < (Math.floor(Date.now() / 1000));
    }

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
                                    alt={token?.name}
                                    onError={(e) => {
                                        e.currentTarget.src = openseaSVG;
                                        e.currentTarget.className = "w-full h-full opacity-10";
                                    }} />
                            ) : (
                                <div className="relative w-full h-72 bg-gray-100 flex items-center justify-center">
                                    <div className="relative w-full h-full p-10">
                                        <img
                                            src={openseaSVG}
                                            alt='NFT' className="w-full h-full opacity-10" />
                                    </div>
                                </div>
                            )}
                        </div>
                        {token?.attributes && token.attributes.length > 0 && (
                            <div className="mt-4 border-t p-2">
                                <div className="grid grid-cols-2 gap-2">
                                    {token.attributes.map((attr, index) => (
                                        <div key={index} className="bg-gray-50 p-2 rounded">
                                            <p className="text-sm text-gray-500">{attr.trait_type}</p>
                                            <p className="text-sm font-medium">{attr.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="p-3 rounded font-bold text-lg text-sm">
                            <div className="flex justify-between items-center">
                                <p className="truncate">{token?.name || 'Unknown'}</p>
                                <p className="uppercase">{order.currentPrice}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500 mt-1">
                                    Expired at
                                </p>
                                <p>
                                {(() => {
                                                const now = Math.floor(Date.now() / 1000);
                                                const timeUntilEnd = order.endTime - now;
                                                
                                                if (timeUntilEnd > 0 && timeUntilEnd <= 24 * 3600) {
                                                    return <CountdownTimer endTime={order.endTime} />;
                                                }
                                                
                                                return new Date(order.endTime * 1000).toLocaleString();
                                            })()}
                                </p>
                            </div>
                        </div>

                    </div>

                    <div>
                        <button
                            onClick={() => fulfilLsting(order)}
                            disabled={
                                isButtonDisabled(order)
                            }
                            className={`w-full font-bold py-2 px-4 rounded-[8px] text-white ${isButtonDisabled(order)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-700'
                                }`}
                        >
                            {getButtonText(order)}
                        </button>
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
