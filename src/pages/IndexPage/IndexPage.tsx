import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Button, Placeholder, Section } from "@telegram-apps/telegram-ui";
import { Icon20Copy } from "@telegram-apps/telegram-ui/dist/icons/20/copy";
import { SectionHeader } from "@telegram-apps/telegram-ui/dist/components/Blocks/Section/components/SectionHeader/SectionHeader";
import { useWeb3Auth } from "@web3auth/no-modal-react-hooks";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as jose from "jose";
import { WALLET_ADAPTERS } from "@web3auth/base";
import { AuthDataValidator } from "@telegram-auth/server";
import { objectToAuthDataMap } from "@telegram-auth/server/utils";

import { KEY_PREFIX, RPC_URL, getPrivateKey } from "@/components/Web3Provider";
//import { base64toJSON } from "@web3auth/openlogin-adapter";

const pk = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCqbMbFncm9/Kyg
tLjKR9yxiW9c8/mV+bPFSyiB82kNn0TjaYjxO90fBN4MkeepUkiZmo9usP1eae0S
v5UPsQ2hy7BQKN/n2DX+yXq242bThiiEzT7eqxlC63fN5lscmthrCywJ9zQzPtom
SffGgAsKyAmRPPBFtNhzlWvjUBeJfrv6M8VsI+w6g0yi26KbRFGzR289pUCP4dBe
N9ZfeJlRuqzBT0ns4w4JvW+23EMTb0gVQ0xrfo7BwAB9jC97JbZsfe7UG3wYMe6U
y+Yto3y7KTAqsAYVB4zcWTa1E41SBy6XbuShyyN5ni8WnEDWNkvWu1zwW9QIlwJc
5B9oNJ5rAgMBAAECggEABnqfLekbP9VIzM1CDzKfMcKrUKnXzbtR+cirMBGMZ1+s
M0cSVTV06RZ6yJiNaZL+vpQxKsCgyUOWpzVQWendvk5rlAiRxpMiLl8DgstvX9BE
XxQcdUOk8LXZ9qJwyUwbuSoSEQjsW5xil70NJec9RDopnvNloQjIh9Bg6yHi2y+9
yQcKpCZlwXYVxAsjh3S4E2G66nUcOsO6MRMj0oEkOEXJp9p8Exg1eNDRRD6AzXA1
sMMqnRPdV6isc6iQGRwzwgnrQiw1tf3cnHzs9ogBKfHi7pFZe3awmZcOCNS6dSVS
OIyyJA3wLiywAJrNe6l79ikVim+/35Xnr0jikEuU+QKBgQDmo14IAckT3j2uqqWU
HyhkfYGafHR/volxDo6PFX0qltTpRt0IGe+i0OQDg7LiI3K7zCBar3VSseUf/O5U
bY3swgXeH4nfd7VWAyt8OUfSnuG3uz4dNeAtVUIMeCcRdSfwYY2t2XCz1VzFunT4
kyJ2s5Oe0aQ98v6oSVEU7Y/dUwKBgQC9Kly8NtJ0gKldBM7JONWKQIewQmUi2n6M
VfI9t+18qVOcKYRMChke+sJLrGDOoN5Ga0OUduNUDS6OEDUTjCY2P0iDXTwwDTAj
z0W+HFS1eC7tD3/g4F593IK7Ey42ubP/zbNRHLPNzMCY2f10SzKyMAur4T5CQgFv
ydg08ol/iQKBgQC5HgMJNjWohsbHfRxtaRzIm5v83Uu8hLhYUDDIU50lI+88Va5v
JDIdYsDAuWJI897RMSP+5bmraDHZnO/GQDCcCZcgE/xbqv+XS/AJQwiM2w2cpONU
GrwWZsoerAnfj0NBQ2uuUEqPbP+LjP75zU7qK3SfEvFa78DKXh6AR7UjFQKBgCGk
zymKdpPR7k1k9YJEYXZdU8S9ik9QnQFIp/TiKZLqarxzhdwgT6d64eOjnPQjGGVd
3n8hRf1E+uq5Zzc6zfEIAFWc13+UWOOFkdnmIArGfVIcV5ofTa8E8RtkpeuFy8XL
SAE9IZ2QtRB6dOGiHjoi4XCIdxJBuw+uzo1cNahBAoGBAMO3pjop9588RbgotR8p
F15l8LAfbLFWasbz4W2Q+X7PbkdQ3gkSvB5dCUFGYRv7RyMgHwB5V8GZQHn04qSj
1Oijpijyhhh9z5RHcGdRoSFCeZBi20khQAJ4EhNeCZSF53uTKjoGhIJZPb2u3kcg
HI1ci7B6etIgEjOlOkhU9eP6
-----END PRIVATE KEY-----
`;

const privateKey = await jose.importPKCS8(pk, "RS256");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateJwtToken = async () => {
  const initData = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new URLSearchParams((window as any).Telegram.WebApp.initData)
  );
  const validator = new AuthDataValidator({
    botToken: "7411142733:AAHwKdl1FVOU_Dtw7UMRDi_4mG9aHr2FN0g",
  });
  const data = objectToAuthDataMap(initData || {});
  const user = await validator.validate(data);

  const payload = {
    telegram_id: user.id,
    username: user.username,
    avatar_url: user.photo_url,
    sub: user.id.toString(),
    name: user.first_name,
    iss: "https://api.telegram.org",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  return new jose.SignJWT(payload)
    .setProtectedHeader({
      alg: "RS256",
      keyid: "b183cbbf2eedc92b022998f",
    })
    .sign(privateKey);
};

const sessionIdParam = new URLSearchParams(
  window.location.hash.substring(1)
).get("b64Params");

if (sessionIdParam) {
  const sessionIdState = JSON.parse(
    Buffer.from(sessionIdParam, "base64").toString("utf-8")
  );

  localStorage.setItem("openlogin_store", sessionIdState);
}

// TODO: https://core.telegram.org/api/url-authorization

export const IndexPage: FC = () => {
  const web3Auth = useWeb3Auth();
  const ref = useRef(false);
  const [starting, setStarting] = useState(true);

  const [, setOfflineSigner] = useState<DirectSecp256k1Wallet>();
  const [address, setAddress] = useState<string>();
  const [, setSigner] = useState<SigningCosmWasmClient>();

  const [balance, setBalance] = useState<string>();

  const connect = useCallback(async () => {
    await web3Auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      loginProvider: "jwt",
      extraLoginOptions: {
        id_token: await generateJwtToken(),
        verifierIdField: "sub",
      },
    });
  }, [web3Auth.connectTo]);

  useEffect(() => {
    (async () => {
      if (web3Auth.provider) {
        console.log("building");
        const privateKey = await getPrivateKey(web3Auth.provider);
        const offlineSigner = await DirectSecp256k1Wallet.fromKey(
          privateKey,
          KEY_PREFIX
        );
        setOfflineSigner(offlineSigner);
        const account = (await offlineSigner.getAccounts())[0];
        setAddress(account.address);
        console.log(account.address);
        const signer = await SigningCosmWasmClient.connectWithSigner(
          RPC_URL,
          offlineSigner
        );
        setSigner(signer);
        const balance = await signer.getBalance(account.address, "uosmo");
        setBalance(balance.amount);
      }
    })();
  }, [web3Auth.provider]);

  useEffect(() => {
    (async () => {
      if (web3Auth.status !== null && !ref.current) {
        ref.current = true;
        try {
          console.log("init");
          await web3Auth.init();
          setStarting(false);
          console.log("initt");
        } catch (e) {
          console.log(e);
        }
      }
    })();
    console.log("S", web3Auth.status);
  }, [web3Auth.status]);

  return (
    <Section>
      <SectionHeader>Web3Auth Connection</SectionHeader>

      <Placeholder
        header="Web3Auth"
        description="Connect to your wallet using your Telegram credentials"
        action={
          <Button
            disabled={web3Auth.status === "connecting" || starting}
            onClick={() => {
              if (web3Auth.isConnected) {
                return web3Auth.logout();
              } else {
                return connect();
              }
            }}
          >
            {starting
              ? "Initializing"
              : web3Auth.status === "connecting"
              ? "Connecting"
              : web3Auth.isConnected
              ? "Disconnect"
              : "Connect"}
          </Button>
        }
      >
        <img
          alt="Web3Auth Logo"
          src="https://web3auth.io/images/BrandLogo.png"
          style={{ display: "block", width: "75px" }}
        />
      </Placeholder>

      {web3Auth.isConnected && (
        <Placeholder
          header={
            web3Auth.userInfo?.name
              ? `${web3Auth.userInfo?.name}, you're connected!`
              : "You're connected!"
          }
          description={
            <>
              <div>Your address is</div>
              <Button
                size="s"
                mode="bezeled"
                onClick={() => {
                  if (address) {
                    navigator.clipboard.writeText(address);
                  }
                }}
                before={<Icon20Copy />}
              >
                {address
                  ? `${address.slice(0, 8)}...${address.slice(-6)}`
                  : "..."}
              </Button>
              <div>
                {address} on chain {web3Auth.provider?.chainId}
              </div>
            </>
          }
        >
          {web3Auth.userInfo?.profileImage && (
            <img
              src={web3Auth.userInfo?.profileImage}
              alt="Your profile image"
            />
          )}
        </Placeholder>
      )}

      {balance !== undefined && (
        <Placeholder
          header="Your balance"
          description={<div>{balance} uOSMO</div>}
        />
      )}
    </Section>
  );
};
