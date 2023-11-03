import { DynamoDB } from "@aws-sdk/client-dynamodb";
const fetch = require("node-fetch");
const ethers = require("ethers");

// Get off-chain data: DID Subject from 3ID URI
async function get_off_chain_subject(d3id: string): Promise<any> {
    const url = `https://ceramic-clay.3boxlabs.com/api/v0/streams/${d3id.substring(6)}`;
    const res = await fetch(url);
    const json = await res.json();
    const content = json?.state?.content;
    return content;
}

// Get extra info from external centralized DB
function get_off_chain_centralizeddb_mock(d3id: string) {
    return {
        'name': 'Claus',
        'email': 'cgmello@gmail.com',
    }
}

// Store on-chain & off-chain
function insert_singulardb(table: string, item: any) {
    const ddb = new DynamoDB({
      apiVersion: '2012-08-10',
      region: 'us-east-1'
    });
    const params = {
      TableName: table,
      Item: item,
    };
    ddb.putItem(params, function(err: any, data: any) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
        }
    });    
}

// Listen for on-chain events, collect DID URI, DID Subject, and store on NoSQL DB
async function get_on_chain_events() {
    let abi = ["event TaskCreated(string did, string uri, string title, string description, string status, uint thours)"];
    const infura = "wss://sepolia.infura.io/ws/v3/4b4d5e12505f4248ab2ba918fdcec22c"
    const address = "0x61877Ff89bE94A05C9128d3791aabE5ac99AA917";
    const provider = new ethers.providers.WebSocketProvider(infura);
    const contract = new ethers.Contract(address, abi, provider);
    console.log("Start listening for on-chain events...");
    contract.on("TaskCreated", async (did: string, uri: string) => {

        // Event on-chain received (DID URI)
        console.log("Event received from DID: ", did);
        console.log('DID URI: ', uri)

        // Get off-chain data (DID Subject)
        const subject = await get_off_chain_subject(uri);
        console.log('DID Subject: ', JSON.stringify(subject, null, 4));

        // Get off-chain from some centralized db
        const extra = get_off_chain_centralizeddb_mock(did);
        console.log('Extra info for the DID: ', .stringify(extra, null, 4));

        // Aggregated item
        const item = {
            'did' : {S: did},
            'uri': {S: uri},
            'title': {S: subject.title},
            'description': {S: subject.description},
            'status': {S: subject.status},
            'name': {S: extra.name},
            'email': {S: extra.email},
        };
        console.log('Store item: ', JSON.stringify(item, null, 4));

        // NoSQL table
        const table = 'task';

        // Insert on-chain + off-chain data
        insert_singulardb(table, item);
        console.log('Data stored')
    });
}

// Keep listening
get_on_chain_events();




// async function print(did: string, uri: string) {
//     const subject = await get_off_chain_subject(uri);
//     const item = {
//         'did' : {S: did},
//         'uri': {S: uri},
//         'title': {S: subject.title},
//         'description': {S: subject.description},
//         'status': {S: subject.status},
//     };
//     console.log('Item: ', item);
// }
// const did = 'did:pkh:eip155:11155111:0xcc7c019e8ab0d72b5676811c8c1ec6fae16228c0';
// const uri = 'did:3:kjzl6kcym7w8yad7vp87x1lrrvbt0m7gl3rxfqokjnkulo5lca2en7jdxcmyvd3';
// print(did, uri);

// async function test(did: string, uri: string) {
//     console.log('did: ', did)
//     console.log('uri: ', uri)

//     const subject = await get_off_chain_subject(uri);
//     console.log('subject: ', JSON.stringify(subject, null, 4));

//     const extra = get_off_chain_centralizeddb_mock(did);
//     console.log('extra: ', JSON.stringify(extra, null, 4));

//     const item = {
//         'did' : {S: did},
//         'uri': {S: uri},
//         'title': {S: subject.title},
//         'description': {S: subject.description},
//         'status': {S: subject.status},
//         'name': {S: extra.name},
//         'email': {S: extra.email},
//     };
//     console.log('item: ', JSON.stringify(item, null, 4));

//     const table = 'task';
//     insert_singulardb(table, item);
// }
// const did = 'did:pkh:eip155:11155111:0xcc7c019e8ab0d72b5676811c8c1ec6fae16228c0';
// const uri = 'did:3:kjzl6kcym7w8yad7vp87x1lrrvbt0m7gl3rxfqokjnkulo5lca2en7jdxcmyvd3';
// test(did, uri);
