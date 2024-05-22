import { getPublicKeyAsync } from '@noble/ed25519';
import { Button, Card, Container, Flex, Heading, Text } from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { encodeBase58 } from 'ethers';
import { FC, useEffect, useState } from 'react';

import { SafeInstructions } from './SafeInstructions';
import {
  DelegateSignerResponse,
  addOrderlyKey
} from './helpers';

export const Account: FC<{
  brokerId: string;
  accountId: string;
  contractAddress: string;
  delegateSigner?: DelegateSignerResponse;
  setDelegateSigner: React.Dispatch<React.SetStateAction<DelegateSignerResponse | undefined>>;
  orderlyKey?: Uint8Array;
  setOrderlyKey: React.Dispatch<React.SetStateAction<Uint8Array | undefined>>;
}> = ({
  brokerId,
  accountId,
  delegateSigner,
  orderlyKey,
  setOrderlyKey
}) => {
    const [publicKey, setPublicKey] = useState<string>();

    const [{ wallet }] = useConnectWallet();
    const [{ connectedChain }] = useSetChain();

    useEffect(() => {
      async function run() {
        if (orderlyKey) {
          setPublicKey(`ed25519:${encodeBase58(await getPublicKeyAsync(orderlyKey))}`);
        } else {
          setPublicKey(undefined);
        }
      }
      run();
    }, [orderlyKey]);

    return (
      <Flex style={{ margin: '1.5rem' }} gap="4" align="center" justify="center" direction="column">
        <Heading>Account</Heading>

        <Card style={{ maxWidth: 240 }}>
          {wallet ? (
            <>
              <Flex gap="1" direction="column">
                <Container>
                  <Text as="div" size="2" weight="bold">
                    Address:
                  </Text>
                  <Text as="div" size="2">
                    {wallet.accounts[0].address}
                  </Text>
                </Container>
                <Container>
                  <Text as="div" size="2" weight="bold">
                    Orderly Account ID:
                  </Text>
                  <Text as="div" size="2">
                    {accountId ?? '-'}
                  </Text>
                </Container>
                <Container>
                  <Text as="div" size="2" weight="bold">
                    User ID:
                  </Text>
                  <Text as="div" size="2">
                    {delegateSigner ? delegateSigner.user_id : '-'}
                  </Text>
                </Container>
                <Container>
                  <Text as="div" size="2" weight="bold">
                    Valid Signer:
                  </Text>
                  <Text as="div" size="2">
                    {delegateSigner ? delegateSigner.valid_signer : '-'}
                  </Text>
                </Container>
                <Container>
                  <Text as="div" size="2" weight="bold">
                    Orderly Key:
                  </Text>
                  <Text as="div" size="2">
                    {publicKey ?? '-'}
                  </Text>
                </Container>
              </Flex>
            </>
          ) : (
            <Text as="div" size="3" weight="bold" color="red">
              Not connected!
            </Text>
          )}
        </Card>

        {connectedChain && <SafeInstructions brokerId={brokerId} chainId={connectedChain.id} />}

        <Button
          disabled={!wallet || !connectedChain || !brokerId}
          onClick={async () => {
            if (!wallet || !connectedChain || !brokerId) return;
            const key = await addOrderlyKey(
              wallet,
              connectedChain.id,
              brokerId,
              accountId
            );
            setOrderlyKey(key);
          }}
        >
          Create EOA Orderly Key
        </Button>

      </Flex>
    );
  };
