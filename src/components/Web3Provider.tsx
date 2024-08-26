import { FC, PropsWithChildren } from "react";
import {
  CHAIN_NAMESPACES,
  CustomChainConfig,
  Web3AuthNoModalOptions,
  WEB3AUTH_NETWORK,
  IProvider,
} from "@web3auth/base";
import { CommonPrivateKeyProvider } from "@web3auth/base-provider";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Web3AuthProvider } from "@web3auth/no-modal-react-hooks";

export const WEB3_CLIENT_ID =
  "BLJQVcJYSIeVv_9xUzKkRdU3nOmDz_5Qzta_iuwuhLpRerNL8IvkvUCm13eoKGp8cqsMxmPB_iKwO7pXaAV1R9g";
const GET_PRIVATE_KEY_METHOD = "private_key";
export const RPC_URL = "https://rpc.osmotest5.osmosis.zone/";
export const KEY_PREFIX = "osmo";

const CHAIN: CustomChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.OTHER,
  chainId: "osmo-test-5",
  rpcTarget: RPC_URL,
  displayName: "Osmosis Testnet",
  isTestnet: true,
};

const privateKeyProvider = new CommonPrivateKeyProvider({
  config: { chainConfig: CHAIN },
});

const web3Options: Web3AuthNoModalOptions = {
  clientId: WEB3_CLIENT_ID,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider: privateKeyProvider,
};

const openloginAdapter = new OpenloginAdapter({
  adapterSettings: {
    uxMode: "redirect",
    replaceUrlOnRedirect: true,
    redirectUrl: "https://aledecicco.github.io/telegram-miniapp",
    loginConfig: {
      jwt: {
        verifier: "telegram-verifier-111",
        typeOfLogin: "jwt",
        clientId: WEB3_CLIENT_ID,
      },
    },
  },
});

export const Web3Provider: FC<PropsWithChildren> = (props) => {
  return (
    <Web3AuthProvider
      config={{
        web3AuthOptions: web3Options,
        adapters: [openloginAdapter],
      }}
    >
      {props.children}
    </Web3AuthProvider>
  );
};

export const getPrivateKey = async (provider: IProvider): Promise<Buffer> => {
  const pk = await provider.request({ method: GET_PRIVATE_KEY_METHOD });

  if (typeof pk === "string") {
    return Buffer.from(pk, "hex");
  } else {
    return Promise.reject();
  }
};
