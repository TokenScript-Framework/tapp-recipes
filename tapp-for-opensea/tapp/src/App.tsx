import React, { useState, useEffect, FC } from "react";
import { NotFound } from "./cards/NotFound";
import { ITokenContextData } from "@tokenscript/card-sdk/dist/types";
import { Buy } from "./cards/Buy";

const App: FC = () => {
  // add TokenScript Card views here
  enum CardName {
    Buy = "#buy",
    NotFound = "#notFound",
  }

  const [CurrentPageName, setCurrentPageName] = useState<CardName>(
    CardName.Buy
  );
  const [token, setToken] = useState<ITokenContextData>();

  const mapCardName = (hashString: string | null): CardName => {
    console.log("hashString--",hashString)
    if (!hashString) return CardName.NotFound;
    
    const params = new URLSearchParams(hashString.replace('#', ''));
    const card = params.get('card');
    console.log('card--',card)

    switch (card) {
      case 'Buy':{
        return CardName.Buy;
      }
      default:
        return CardName.NotFound;
    }


  };

  const cardComponents: { [key in CardName]: React.FC } = {
    [CardName.Buy]: Buy,
    [CardName.NotFound]: NotFound,
  };

  const CurrentPage = cardComponents[CurrentPageName];

  useEffect(() => {
    const routeChange = () => {
      console.log('App',document.location)
      const mappedCardName = mapCardName(document.location.hash);
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
