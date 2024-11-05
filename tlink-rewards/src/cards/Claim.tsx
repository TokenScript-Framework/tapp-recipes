import React, { useState, useEffect } from "react";
import Loader from "../components/loader/loader";

// @ts-ignore
export const Claim: React.FC = ({ token }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | JSX.Element>("")
    const [success, setSuccess] = useState(false)
    const [count, setCount] = useState(0)
    const BASE_CHAIN = 8453
    useEffect(() => {
        const fetchCount = async () => {
            const response = await fetch('https://api.smarttokenlabs.com/tlink-rewards/count', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setCount(data.count);
        };

        setLoading(false);
        fetchCount();
    }, []);

    function getProvider() {
        return new ethers.BrowserProvider(window.ethereum);
    }

    async function addNetwork(provider: any) {
        try {
            await provider.send("wallet_addEthereumChain", [{
                chainId: "0x" + Number(BASE_CHAIN).toString(16),
                chainName: "Base",
                nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18
                },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"]
            }]);
        } catch (error) {
            console.log(error)
            if (String(error).includes("ACTION_REJECTED")) {
                throw new Error("User rejected the transaction.");
            } else {
                throw new Error("Add Base error, please add it by manually.");
            }
        }
    }

    const handleClaimClick = async () => {

        setError('');
        setLoading(true);

        try {

            const provider = getProvider();

            console.log("chainID", chainID, Number(chainID) !== BASE_CHAIN)

            if (Number(chainID) !== BASE_CHAIN) {
                await addNetwork(provider)
                await provider.send("wallet_switchEthereumChain", [{ chainId: "0x" + Number(BASE_CHAIN).toString(16) }]);
            }

            const { handle, API_KEY } = await tokenscript.tlink.request({ method: "getTlinkContext", payload: [] })

            const signature = await tokenscript.personal.sign({ data: handle });

            const requestBody = {
                twitterId: handle,
                wallet: walletAddress,
                signature: signature
            };

            const response = await fetch('https://api.smarttokenlabs.com/tlink-rewards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "x-stl-key": API_KEY,
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                console.log(response)
                const responseData = await response.json()
                if (responseData.error === 'Twitter account has participated in the campaign.') {
                    setSuccess(true)
                    throw new Error(responseData.error)
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

            }
            console.log('Success:', response);
            setSuccess(true)
        } catch (error: unknown) {
            console.log(error)
            if (error instanceof Response) {
                const errorData = await error.json();
                console.log('Response error')
                setError(parseError(errorData.message || "Error for post."));
            } else {
                console.log('nomal error')
                setError(parseError(String(error)));
            }
        } finally {
            setLoading(false);
        }
    };

    function parseError(error: string) {
        if (error.includes("rejected")) {
            return "User rejected the transaction."
        } else if (error.includes("Tlink adapter is not available")) {
            return <>Install <a href="https://chrome.google.com/webstore/detail/tlink/mgjhlnekhekkfoepkfolngkpdcgogoih" target="_blank" rel="noopener noreferrer">Tlink</a> and claim rewards from 𝕏</>
        } else {
            return error
        }
    }

    return (
        <div>
            {token && (
                <div className="claim-container">
                    <img src="https://resources.smartlayer.network/images/tlinks-rewards-box.png" />
                    <div className="count-display">
                        {10_000 - count} / 10,000 Claims Left
                    </div>
                    <div className="button-container">
                        {!success && <button onClick={handleClaimClick} disabled={loading}>Claim $SLN</button>}

                        {error && (
                            <div className="error">
                                {typeof error === 'string' ? error : error}
                            </div>
                        )}
                        {success && !error && (
                            <div className="success">Claim Success! 🎉 <br />Your SLN tokens will hit your wallet in next 48 hours.</div>
                        )}
                    </div>
                </div>
            )}
            <Loader show={loading} />

        </div>

    );
};
