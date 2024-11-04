import React, { useState, useEffect } from "react";
import Loader from "../components/loader/loader";

// @ts-ignore
export const Info: React.FC = ({ token }) => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(false);
	}, []);
    console.log("token",token)

	return (
		<div>
			{token && <pre>{JSON.stringify(token, null, 2)}</pre>}
			<Loader show={loading} />
		</div>
	);
};