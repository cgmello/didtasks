# DID Tasks

## Motivation

**Stretch goal**: develop a very quick POC that shows how a user might go through the flow of 1) creating the suggested-required off-chain data, 2) grab the URI of that off-chain data and post it on-chain, and 3) have a singular DB that indexes and aggregates the important information from both the on-chain and off-chain data.

**Stretch goal 2**: Index information from another, centralized DB into the singular DB, and provide an endpoint that allows users to run very basic queries on the aggregated data set.

## Summary

This POC mais goal is to allow an user to create a DID (Decentralized Identifier) to save off-chain data and to refer it on-chain

## How it works

## Technologies

- Ceramic Newtork and ComposeDB as the off-chain decentralized database
- Ethereum Sepolia as the on-chain storage
- Web3 app based on React, Hardhat and Infura
- Metamask wallet
- The Graph
- Solidity smart contract

## Requirements

Install dependencies and run Wheel as described in [here](https://composedb.js.org/docs/0.5.x/set-up-your-environment). After running the wheel you have the CLI for ceramic and composeDB, and a new */ceramic-app* created:

- Node.js v16 (tip: use nvm to choose version 16)
- jq
- ./wheel

Use CLI to generate a random private key and the associated DID (e.g. **did\:key:z6M...icbamu**)
```
$ composedb did:generate-private-key
$ composedb did:from-private-key <private-key>
```

Add the DID to the */ceramic-app/daemon_config.json* file under the *admin-dids* list.

## Creating a custom composite

ComposeDB has some pre-defined models that you can use:
```
$ composedb model:list –table # list models
$ composedb composite:from-model <model> # using a pre-defined model
```

For this app we will create a simple composite in graphql. Run the following commands to create, deploy and compile the composite:

```
$ composedb composite:create tasks.graphql --output=tasks-composite.json --did-private-key=<private-key>
$ composedb composite:deploy tasks-composite.json --ceramic-url=http://localhost:7007 --did-private-key=<private-key>
$ composedb composite:compile tasks-composite.json runtime-tasks-composite.json
```

The *tasks.graphql* file:

```sql
type Tasks @createModel(accountRelation: LIST, description: "A simple list of Tasks")
@createIndex(fields: [{path: "title"}])
@createIndex(fields: [{path: "description"}])
@createIndex(fields: [{path: "status"}])
{
  title: String! @string(minLength: 1, maxLength: 100)
  description: String @string(minLength: 1, maxLength: 100)
  status: TaskStatus! @string(minLength: 1, maxLength: 100)
  hours: Int
}

enum TaskStatus {
  NOT_STARTED
  STARTED
  FINISHED
  BLOCKED
  CANCELED
}
```

Also generate a definition for the app:

```
$ composedb composite:compile tasks-composite.json definition.js --ceramic-url=http://localhost:7007 
```

## Setup the environment

Start a local Ceramic node connected to the Clay Testnet at https://localhost:7007
```
$ ceramic daemon --config daemon_config.json
```

Start a ComposeDB Yoda GraphiQL server at https://localhost:5005 using the private-key created and the *runtime-tasks-composite.json* composite
```
$ composedb graphql:server --ceramic-url=http://localhost:7007 --graphiql runtime-tasks-composite.json --did-private-key=<private-key> --port=5005
```

### Configuring for Sepolia testnet

1. Change Metamask network to Sepolia testnet
2. Give you some credits using a Sepolia [faucet](https://sepoliafaucet.com/)
3. Create an account on [Infura](https://infura.io) or [Alchemy](https://www.alchemy.com)

Create an account and a project on **Infura**, take note of project ID
```
Project: My POC
ID: 1f9**********20d
```

Add Sepolia network to file ```hardhat.config.js```
```
sepolia: {
      url: "https://sepolia.infura.io/v3/4b4d5e12505f4248ab2ba918fdcec22c",
      accounts: [`0x${process.env.PRIVATEKEY}`]
    }
```

Compile solidity source code 
```
$ npx hardhat compile
```

Export the Metamask private-key and set as an environment variable, so that Hardhat can deploy the contract on the accounter's behalf
```
$ export PRIVATEKEY="<private key of sepolia account on Metamask>"
```

Deploy the contract to Sepolia testnet:
```
$ npx hardhat run scripts/deploy.js --network sepolia
> Contract deployed to: 0xB8d**********************88C1
```

Update the contract address to the */src/App.js* file.

Check the contract at Etherscan for [Sepolia Testnet](https://sepolia.etherscan.io)

## Usage

```
$ npm start
```

Event listener

```
$ ts-node events.ts
```

REST HTTP API

```
$ ts-node api.ts
```