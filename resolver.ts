import { CeramicClient } from '@ceramicnetwork/http-client'
import { DID } from 'dids'
import { getResolver } from 'key-did-resolver'
import { getResolver as getResolverForPKH } from 'pkh-did-resolver'

import { Resolver } from 'did-resolver'
import { getResolver as getResolverFor3ID } from '@ceramicnetwork/3id-did-resolver'

//const keydid = 'did:key:z6MktKq2yRPDsFTELNrVTsGMtV2aERSHhNMmoYoUc9VJRHwB';
// const did = new DID({ resolver: getResolverForPKH() })
// const doc1 = await did.resolve(keydid)
// console.log(doc1.didDocument);

const keydid = 'did:pkh:eip155:11155111:0x25a928dbf631e3de4487b6caadce9c81702418ba';
const pkhResolver = getResolverForPKH()
const resolver = new Resolver(pkhResolver)
const didResolutionResult = await resolver.resolve(keydid)
console.log(didResolutionResult.didDocument)


// const ceramic = new CeramicClient()
// const threeIdResolver = getResolverFor3ID(ceramic)
// const threeidv1 = 'did:3:kjzl6cwe1jw147iim90pko8lwq6dfajgozmkna193odbc01gg795nreay3e6k6e';
// const didResolver = new Resolver(threeIdResolver)
// const doc2 = await didResolver.resolve(threeidv1)
// console.log(doc2)
