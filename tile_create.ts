import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from "uint8arrays";

const ceramic = new CeramicClient()

const seed = fromString("5e7433e6c938ef8594503f3efc48102e16e0d0e48312c5eeb91634d87a26d940", "base16");

// Authenticate
const provider = new Ed25519Provider(seed)
const did = new DID({ provider, resolver: getResolver() })
// Authenticate the DID with the provider
await did.authenticate()
console.log(did.id)
// The Ceramic client can create and update streams using the authenticated DID
ceramic.did = did

// Create Tile Document
const content = "{ title: 'A first post', text: 'First post content' }";
// The following call will fail if the Ceramic instance does not have an authenticated DID
const doc = await TileDocument.create(ceramic, content)
// The stream ID of the created document can then be accessed as the `id` property
console.log(doc.id)
