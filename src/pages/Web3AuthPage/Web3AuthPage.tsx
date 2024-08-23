import { Placeholder, Text } from "@telegram-apps/telegram-ui";
import type { FC } from "react";

import "./Web3AuthPage.css";

export const Web3AuthPage: FC = () => {
  return (
    <Placeholder
      className="web3auth-page__placeholder"
      header="Web3Auth Connect"
      description={
        <>
          <Text>
            To display the data related to the Web3Auth Connect, it is required
            to connect your wallet
          </Text>
        </>
      }
    />
  );
};
