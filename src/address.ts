const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);
const bitcoin = require('bitcoinjs-lib');

export function createAddress (params: any): any {
    const {seedHex, receiveOrChange, addressIndex, network, method } = params
    const root = bip32.fromSeed(Buffer.from(seedHex, 'hex'));
    let path = "m/44'/0'/0'/0/" + addressIndex + '';
    if (receiveOrChange === '1') {
        path = "m/44'/0'/0'/1/" + addressIndex + '';
    }
    const child = root.derivePath(path);
    let address: string
    switch(method) {
        case "p2pkh":
            const p2pkhAddress = bitcoin.payments.p2pkh({
                pubkey: child.publicKey,
                network: bitcoin.networks[network]
            });
            address = p2pkhAddress.address
            break
        case "p2wpkh":
            const p2wpkhAddress = bitcoin.payments.p2wpkh({
                pubkey: child.publicKey,
                network: bitcoin.networks[network]
            });
            address = p2wpkhAddress.address
            break
        case "p2sh":
            const p2shAddress = bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2wpkh({
                    pubkey: child.publicKey,
                    network: bitcoin.networks[network]
                }),
            });
            address = p2shAddress.address
            break
        default:
            console.log("This way can not support")
    }

    return {
        privateKey: Buffer.from(child.privateKey).toString('hex'),
        publicKey: Buffer.from(child.publicKey).toString('hex'),
        address
    };
}


export function createMultiSignAddress (params: any): string {
    const {pubkeys, network, method, threshold } = params
    switch(method) {
        case "p2pkh":
            return bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2ms({
                    m: threshold,
                    network: bitcoin.networks[network],
                    pubkeys
                }),
            }).address
        case "p2wpkh":
            return  bitcoin.payments.p2wsh({
                redeem: bitcoin.payments.p2ms({
                    m: threshold,
                    network: bitcoin.networks[network],
                    pubkeys
                }),
            }).address;
        case "p2sh":
           return bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2wsh({
                    redeem: bitcoin.payments.p2ms({
                        m: threshold,
                        network: bitcoin.networks[network],
                        pubkeys
                    }),
                }),
            }).address;
        default:
            console.log("This way can not support")
            return "0x00"
    }
}

