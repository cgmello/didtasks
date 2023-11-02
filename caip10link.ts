// https://developers.ceramic.network/reference/stream-programs/caip10-link/
import { CeramicClient } from '@ceramicnetwork/http-client'
import { Caip10Link } from '@ceramicnetwork/stream-caip10-link'
import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'

const ceramic = new CeramicClient()

// First, we need to create an EthereumAuthProvider with the account currently selected
// The following assumes there is an injected `window.ethereum` provider
const addresses = await window.ethereum.request({
    method: 'eth_requestAccounts',
})

console.log(addresses);
console.log(addresses[0]);

const authProvider = new EthereumAuthProvider(window.ethereum, addresses[0])

// Retrieve the CAIP-10 account from the EthereumAuthProvider instance
const accountId = await authProvider.accountId()

// Load the account link based on the account ID
const accountLink = await Caip10Link.fromAccount(
    ceramic,
    accountId.toString(),
)

// Finally, link the DID to the account using the EthereumAuthProvider instance
await accountLink.setDid(
    'did:3:k2t6wyfsu4pg0t2n4j8ms3s33xsgqjhtto04mvq8w5a2v5xo48idyz38l7ydki',
    authProvider,
)
