import React, { useState, useEffect } from "react";
import Loader from "../components/loader/loader";
import { ethers } from "ethers";
import axios from "axios";
import { Seaport } from "@opensea/seaport-js";
import { OPENSEA_CONDUIT_KEY } from "@opensea/seaport-js/lib/constants";
import { tokenData } from "@token-kit/onchain";

import openseaSVG from "../assets/opensea.svg"
import { addressPipe, getChainConfig, isTestChain, walletClient } from "../components/lib/utils";
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
    const [targetChain, setTargetChain] = useState(0);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [order, setOrder] = useState<any>();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState<Token | null>(null)
    const [transactionHash, setTransactionHash] = useState<string>('');
    const [seaport, setSeaport] = useState<any>();
    const [isExpired, setIsExpired] = useState(false);
    const isMainnet = !isTestChain(targetChain)

    const headers = isMainnet
        ? { 'X-API-KEY': 'f49e9c8319c344d4b287b0061f5716be' }
        : {};
    const OPENSEA_API = isMainnet ? "https://api.opensea.io" : "https://testnets-api.opensea.io"
    const { chainName, publicClient, displayName, scanUrl, openseaUrl } = getChainConfig(targetChain)

    //detect expired
    useEffect(() => {
        if (!order) return;

        let interval: NodeJS.Timeout | null = null;

        const checkExpiration = () => {
            const now = Math.floor(Date.now() / 1000);
            const expired = order.endTime < now;
            setIsExpired(expired);
            if (expired && interval) {
                clearInterval(interval);
            }
        };

        checkExpiration();
        if (!isExpired) {
            interval = setInterval(checkExpiration, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isExpired, order]);

    async function loadOrder(orderHash: `0x${string}`, protocolAddress: `0x${string}`) {

        try {
            const { data: { order: orderDetail } } = await axios.get(
                `${OPENSEA_API}/api/v2/orders/chain/${chainName}/protocol/${protocolAddress}/${orderHash}`,
                { headers }
            );

            const {
                protocol_data: {
                    parameters: {
                        offer: [{ token: tokenContract, identifierOrCriteria: tokenId }],
                        offerer: maker,
                        startTime,
                        endTime
                    }
                },
                price: { current: { value: priceValue, currency } }
            } = orderDetail;

            const { data: { orders: listinsData } } = await axios.get(
                `${OPENSEA_API}/api/v2/orders/${chainName}/seaport/listings`,
                {
                    headers,
                    params: {
                        asset_contract_address: tokenContract,
                        maker,
                        token_ids: tokenId
                    }
                }
            );

            const matchedOrder = listinsData.find(order => order.order_hash === orderHash);
            const taker = matchedOrder?.taker?.address ?? null;

            const seaportInstance = await initSeaport(protocolAddress);
            const { totalFilled } = await seaportInstance.getOrderStatus(orderHash);

            return {
                orderHash,
                currentPrice: `${ethers.formatEther(priceValue)} ${currency}`,
                protocolAddress,
                protocolData: orderDetail.protocol_data,
                taker: taker,
                completed: totalFilled > 0,
                asset: { tokenContract, tokenId },
                startTime,
                endTime,
                maker
            };
        } catch (error) {
            console.error('Error loading order:', error);
            throw error;
        }
    }

    async function getMetadata(contract: `0x${string}`, tokenId: string) {
        try {

            const result = await tokenData(
                publicClient,
                contract,
                Number(tokenId), { includeTokenMetadata: true },
            );

            if (!('tokenMetadata' in result)) {
                throw new Error('Token metadata not available');
            }

            return result.tokenMetadata;
        } catch (error) {
            throw error instanceof Error ? error : new Error('Unknown error occurred');

        }
    }

    async function getParams() {
        const params = new URLSearchParams(document.location.hash.replace('#', ''));
        if (params.get('orderHash') && params.get('protocolAddress') && params.get('targetChain')) {
            setOrderHash(params.get('orderHash') as `0x${string}`)
            setProtocolAddress(params.get('protocolAddress') as `0x${string}`)
            setTargetChain(Number(params.get('targetChain')))

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
                            chain: chainName,
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
        if (targetChain) {
            walletClient(targetChain).switchChain({ id: targetChain })
                .catch(error => console.error('Failed to switch chain:', error));
        }
    }, [targetChain]);

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
        if (order.completed || success) {
            return 'Order Completed';
        }
        if (isExpired) {
            return 'Order expired';
        }
        if (order.taker && order.taker.toLowerCase() !== walletAddress?.toLowerCase()) {
            return `Reserved for ${addressPipe(order.taker)}`;
        }
        return 'Buy';
    }

    function isButtonDisabled(order: any) {
        return confirming ||
            success ||
            order.completed ||
            (order.taker && order.taker.toLowerCase() !== walletAddress?.toLowerCase()) ||
            isExpired;
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
                            <div className="border-t p-2">
                                <div className="grid grid-cols-3 gap-2">
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
                                 <a 
                                    href={`${openseaUrl}/assets/${chainName.replace("_","-")}/${order.asset.tokenContract}/${order.asset.tokenId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    {token?.name || 'Unknown'}
                                </a>
                                <p className="uppercase">{order.currentPrice}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm mt-1">
                                    Chain
                                </p>
                                <p>{displayName}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm mt-1">
                                    Seller
                                </p>
                                <p><a 
                                        href={`${openseaUrl}/${order.maker}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        {addressPipe(order.maker)}
                                    </a>
                                </p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm mt-1">
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
                                Success! 🎉 Please access <a href={`${scanUrl}/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">Transaction Scan</a> to view the transaction details.
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
