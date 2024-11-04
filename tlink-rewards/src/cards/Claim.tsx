import React, { useState, useEffect } from "react";
import Loader from "../components/loader/loader";

// @ts-ignore
export const Claim: React.FC = ({ token }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [count, setCount] = useState(0) 
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



    const handleClaimClick = async () => {

        setError('');
        setLoading(true);

        try {
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
            return "Install Tlink and claim rewards from 𝕏"
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
                         {10_000-count} / 10,000 Claims Left
                    </div>
                    <div className="button-container">
                        {!success && <button onClick={handleClaimClick} disabled={loading}>Claim $SLN</button>}

                        {error && (
                            <div className="error">{error}</div>
                        )}
                        {success && !error && (
                            <div className="success">Claim Success! 🎉 <br/>Your SLN tokens will hit your wallet in next 48 hours.</div>
                        )}
                    </div>
                </div>
            )}
            <Loader show={loading} />

        </div>

    );
};
