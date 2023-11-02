import { DID, DIDProvider } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { Secp256k1Provider } from 'key-did-provider-secp256k1'
import { getResolver } from 'key-did-resolver'
import { fromString } from "uint8arrays";

const seed = fromString("5dbe16019f82113f1301afef9b785d11ce43ba353d34670d77fab871a5d1f6a0", "base16");

// Create a DID using CLI
// glaze did:create

// Create with secp256k1 key
const provider2 = new Secp256k1Provider(seed) as DIDProvider;
const did2 = new DID({ provider: provider2, resolver: getResolver() });
await did2.authenticate();
console.log('secp256k1', did2.id);

// Create with ed25519 key
const provider = new Ed25519Provider(seed);
const did = new DID({ provider: provider, resolver: getResolver() });
await did.authenticate();
console.log('ed25519', did.id);

// Create a JWS - this will throw an error if the DID instance is not authenticated
const jws = await did.createJWS({ hello: 'world' })
