import express from 'express';
// import { DynamoDBClient, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
// import { unmarshall } from '@aws-sdk/util-dynamodb';
// import { String } from 'aws-sdk/clients/appstream';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

/*
http://localhost:4000/items
http://localhost:4000/items/did:pkh:eip155:11155111:0xcc7c019e8ab0d72b5676811c8c1ec6fae16228c0
http://localhost:4000/item/did:pkh:eip155:11155111:0xcc7c019e8ab0d72b5676811c8c1ec6fae16228c0/name/Claus
http://localhost:4000/item/did:pkh:eip155:11155111:0xcc7c019e8ab0d72b5676811c8c1ec6fae16228c0/title/task
*/

const PORT = 4000;
const HOSTNAME = 'http://localhost';

async function main() {
    const app = express();

    const table = 'task';

    // List all items  
    app.get('/items', async (req, res) => {
        console.log('Get all items from');        
        const command = new ScanCommand({
            TableName: table,
            ProjectionExpression: 'did, uri'
        });
        const items = await get_items(table, command);
        console.log(items);
        res.send(items);
    })

    // List all items with owner DID
    app.get('/items/:did', async (req, res) => {
        const did: string = req.params.did;
        console.log('Get items from: ', did);        
        const command = new QueryCommand({
            TableName: table,
            KeyConditionExpression: 'did = :did',
            ExpressionAttributeValues: {
                ':did': did
            },
        });
        const items = await get_items(table, command);
        console.log(items);
        res.send(items);
    })

    // List all items from a DID and filter by title
    app.get('/item/:did/title/:title', async (req, res) => {
        const did: string = req.params.did;
        const title: string = req.params.title;
        console.log('Get items from: ', did);
        console.log('Title: ', title);
        const command = new QueryCommand({
            TableName: table,
            KeyConditionExpression: 'did = :did AND begins_with (title, :title)',
            ExpressionAttributeValues: {
                ':did': did,
                ':title': title,
            },
        });
        const items = await get_items(table, command);
        console.log(items);
        res.send(items);
    })

    // List all items from a DID and filter by name
    app.get('/item/:did/name/:name', async (req, res) => {
        const did: string = req.params.did;
        const name: string = req.params.name;
        console.log('Get items from: ', did);
        console.log('Name: ', name);
        const command = new QueryCommand({
            TableName: table,
            KeyConditionExpression: 'did = :did',
            ExpressionAttributeValues: {
                ':did': did,
                ':name': name,
                },
            ExpressionAttributeNames: { 
                '#name': 'name' 
            },
            FilterExpression: 'contains (#name, :name)',
        });
        const items = await get_items(table, command);
        console.log(items);
        res.send(items);
    })    
    
    // Run the Express server, listening on port 4000
    app.listen(PORT, () => {
        console.log(`HTTP API running at ${HOSTNAME}:${PORT}`)
    })
}

// Make some queries on DynamoDB
async function get_items(table: string, command: any): Promise<any> {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    try {
        const response = await docClient.send(command);
        const json = JSON.parse(JSON.stringify(response, null, 4));
        return {
            'status': 'success',
            'count': json?.Count,
            'items': json?.Items
        }
    }
    catch (err: any) {
        console.log("Error", err);
    }
}

main();






// async function test(table: string, key:any) {
//     const items = await get_item(table, key);
//     console.log(items);    
// }

// const table = 'task';
// const did = 'did:pkh:eip155:11155111:0xcc7c019e8ab0d72b5676811c8c1ec6fae16228c0';
// const key = {
//     ':did': {S: did}
// };
// test(table, key);
