import React, { useState, useEffect, FC } from "react";
import { NotFound } from "./cards/NotFound";
import {ITokenContextData} from "@tokenscript/card-sdk/dist/types";
import { Claim } from "./cards/Claim";

const App: FC = () => {
	// add TokenScript Card views here
	enum CardName {
        Claim = "#claim",
		NotFound = "#notFound",
	}

	const [CurrentPageName, setCurrentPageName] = useState<CardName>(
		CardName.Claim
	);
	const [token, setToken] = useState<ITokenContextData>();

	const mapCardName = (card: string | null): CardName => {
		switch (card) {
            case CardName.Claim:
                return CardName.Claim;
			default:
				return CardName.NotFound;
		}
	};

	const cardComponents: { [key in CardName]: React.FC } = {
        [CardName.Claim]: Claim,
		[CardName.NotFound]: NotFound,
	};

	const CurrentPage = cardComponents[CurrentPageName];

	useEffect(() => {
		const routeChange = () => {
			const card = document.location.hash;
			const mappedCardName = mapCardName(card);
			setCurrentPageName(mappedCardName);
		};

		tokenscript.tokens.dataChanged = (prevTokens, newTokens, id) => {
			setToken(newTokens.currentInstance);
		};

		if (tokenscript.tokens.data.currentInstance) {
			setToken(tokenscript.tokens.data.currentInstance);
		}

		window.addEventListener("hashchange", routeChange);
		routeChange(); // Handle initial load

		return () => {
			window.removeEventListener("hashchange", routeChange);
		};
	}, []);

	return <CurrentPage token={token} />;
};

export default App;
