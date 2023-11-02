// Import ComposeDB client
import { ComposeClient }from '@composedb/client'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { Composite } from '@composedb/devtools'
import { readEncodedComposite } from '@composedb/devtools-node'
import { DID } from 'dids'
import { Web3Provider } from "@ethersproject/providers"
import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { fromString } from "uint8arrays";
import { getResolver } from 'key-did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'

const ceramic = new CeramicClient('http://localhost:7007')
// const ceramic = new CeramicClient()

// const web3Provider = new Web3Provider(...) // connect to a provider
// const address = "0x25a928dbf631e3de4487b6caadce9c81702418ba" // get the signer address
// const provider = new EthereumAuthProvider(web3Provider.provider, address) // Note: we pass the underlying RPC provider, not the ethers.js wrapped version
// const did = new DID({ provider, resolver: getResolver() })

// Authenticate the DID with the provider
// await did.authenticate()
// console.log(did.id)
// // The Ceramic client can create and update streams using the authenticated DID
// ceramic.did = did

const seed = fromString("5e7433e6c938ef8594503f3efc48102e16e0d0e48312c5eeb91634d87a26d940", "base16");

// Authenticate
const provider = new Ed25519Provider(seed)
const did = new DID({ provider, resolver: getResolver() })
// Authenticate the DID with the provider
await did.authenticate()
console.log(did.id)
// The Ceramic client can create and update streams using the authenticated DID
ceramic.did = did

const composite = await readEncodedComposite(ceramic, 'tasks-composite.json')
await composite.startIndexingOn(ceramic)

const definition = composite.toRuntime()
const compose = new ComposeClient({ ceramic, definition })
// const res = await compose.executeQuery(`
// query {
//     node(id: "kjzl6kcym7w8y7153spzzr9ll98cls82gjxqf8n7m5oe5rtqsp8bu873sg6ow41") {
//       ... on Tasks {
//         id
//         hours
//         description
//         status
//         title
//       }
//     }
//   }
// `)

const res = await compose.executeQuery(`
query {
  tasksIndex(first: 10) {
    edges {
      node {
        hours
        id
        status
        title
        description
      }
    }
  }
}
`);

console.log(res?.data?.tasksIndex)
