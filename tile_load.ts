// Import the Ceramic and Tile document clients
import { CeramicClient } from '@ceramicnetwork/http-client'
// import { TileDocument } from '@ceramicnetwork/stream-tile'

// glaze tile:show <id>

// The `id` argument can be a stream ID (to load the latest version)
// or a commit ID (to load a specific version)
// const id = "kjzl6cwe1jw147iim90pko8lwq6dfajgozmkna193odbc01gg795nreay3e6k6e";
// const doc = await TileDocument.load(ceramic, id)
// console.log(doc.content);
// console.log(doc.metadata);

const id = 'kjzl6kcym7w8y9rse9fjchgm4u4dxcmfnwbmb5iem62o6hl2s0grewwpdykv82b';
const id2 = 'kjzl6kcym7w8y7153spzzr9ll98cls82gjxqf8n7m5oe5rtqsp8bu873sg6ow41';

const ceramic = new CeramicClient()
const doc = await ceramic.loadStream(id2)

console.log(doc.content);
console.log(doc?.metadata?.controller);
