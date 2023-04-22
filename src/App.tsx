import React, { useMemo, useState } from 'react';
import type { WalletError } from '@tronweb3/tronwallet-abstract-adapter';
import { WalletDisconnectedError, WalletNotFoundError } from '@tronweb3/tronwallet-abstract-adapter';
import { useWallet, WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import {
    WalletActionButton,
    WalletConnectButton,
    WalletDisconnectButton,
    WalletModalProvider,
    WalletSelectButton,
} from '@tronweb3/tronwallet-adapter-react-ui';
import toast from 'react-hot-toast';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Alert } from '@mui/material';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
import { WalletConnectAdapter } from '@tronweb3/tronwallet-adapter-walletconnect';
import { LedgerAdapter } from '@tronweb3/tronwallet-adapter-ledger';
import { tronWeb } from './tronweb';
import { Button } from '@tronweb3/tronwallet-adapter-react-ui';

const rows = [
    { name: '', reactUI: WalletActionButton },
];
/**
 * wrap your app content with WalletProvider and WalletModalProvider
 * WalletProvider provide some useful properties and methods
 * WalletModalProvider provide a Modal in which you can select wallet you want use.
 *
 * Also you can provide a onError callback to process any error such as ConnectionError
 */
export function App() {
    function onError(e: WalletError) {
        console.log(e);
        if (e instanceof WalletNotFoundError) {
            toast.error(e.message);
        } else if (e instanceof WalletDisconnectedError) {
            toast.error(e.message);
        } else toast.error(e.message);
    }
    const adapters = useMemo(function () {
        const tronLink1 = new TronLinkAdapter();
        const walletConnect1 = new WalletConnectAdapter({
            network: 'Mainnet',
            options: {
                relayUrl: 'wss://relay.walletconnect.com',
                // example WC app project ID
                projectId: '958076615d7a7a0f54cdc18bd68104fd',
                metadata: {
                    name: 'Test DApp',
                    description: 'JustLend WalletConnect',
                    url: 'https://your-dapp-url.org/',
                    icons: ['https://your-dapp-url.org/mainLogo.svg'],
                },
            },
        });
        const ledger = new LedgerAdapter({
            accountNumber: 2,
        });
        return [tronLink1, walletConnect1, ledger];
    }, []);

    return (
        <WalletProvider onError={onError} autoConnect={false} adapters={adapters}>
            <WalletModalProvider>
                <UIComponent></UIComponent>
                <SignDemo></SignDemo>
            </WalletModalProvider>
        </WalletProvider>
    );
}

function UIComponent() {
    return (
        <div>
            
            <TableContainer style={{ overflow: 'visible' }} component="div">
                <Table sx={{}} aria-label="simple table">

                    <TableBody>
                        {rows.map((row) => (
                            <TableRow  key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                     
                                    <row.reactUI className='Buttone'></row.reactUI>                          
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}



function SignDemo() {
    const { signMessage, signTransaction, address } = useWallet();
    const [message, setMessage] = useState('');
    const [signedMessage, setSignedMessage] = useState('');
    const receiver = 'TMDKznuDWaZwfZHcM61FVFstyYNmK6Njk1';
    const [open, setOpen] = useState(false);

    const { connected } = useWallet();
    const [mintButtonDisabled, setMintButtonDisabled] = useState(true);

    const [Price, setPrice] = useState(50000000);

    async function onSignMessage() {
        const res = await signMessage(message);
        setSignedMessage(res);
    }
    let tokenAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
    let nftContractAddress = 'TS147fsaiAutrxQ4KYMAu1VEosisvj1PFF'

    async function onSignTransaction() {
         const transaction = await tronWeb.transactionBuilder.sendTrx(receiver, tronWeb.toSun(0.1), address);
         
        const signedTransaction = await tronWeb.trx.sign(transaction);
         const res = await tronWeb.trx.sendRawTransaction(signedTransaction);
         setOpen(true);
        
       
    }

    // const USDTApprove = async () => {

    // }

    const NFTMint = async () => {
        // Get the contract instance
        const contract = await window.tronWeb.contract().at(nftContractAddress)

        // Call the mint function to create new tokens
        const result = await contract.mint(1, Price).send({
            // shouldPollResponse: true,
            // callValue: inputValue * 1000000,
        })

        console.log('New tokens minted:', result)
    }

    const decrementPrice = () => {
        let newPrice = Price - 25000000;
        if (newPrice < 50000000) {
            newPrice = 50000000;
        }
        setPrice(newPrice);
    };

    const incrementPrice = () => {
        let newPrice = Price + 25000000;
        if (newPrice > 50000000000) {
            newPrice = 50000000;
        }
        setPrice(newPrice);
    };


    return (
        <div style={{ marginBottom: 40 }}>



            <div className='Contenedor'>
              <div className='div-1'


                onClick={(e) => {
                  e.preventDefault();
                  decrementPrice();
                }}
              >
                -
              </div>

              <div className='div-2' >
                {Price / 1000000} $USDT
              </div>

              <div className='div-3'
                onClick={(e) => {
                  e.preventDefault();
                  incrementPrice();
                }}
              >
                +
              </div>
            </div>
            
            <Button disabled={!connected} className='Buttone' onClick={onSignTransaction}>Mint NFT</Button>
            
        </div>
    );
}
