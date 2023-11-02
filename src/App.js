import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { ethers } from 'ethers'
import { Button, Form, Container, InputGroup, FormControl } from 'react-bootstrap';
import Tasks from './artifacts/contracts/Tasks.sol/Tasks.json'
import {EthereumWebAuth, getAccountId} from "@didtools/pkh-ethereum";
import {DIDSession} from "did-session";
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ComposeClient } from "@composedb/client";
import { definition } from "../src/__generated__/definition.js";


// Update with the contract address logged out to the CLI when it was deployed 
const contractAddress = "0x1E7400D16823eC7d3Fd16ea7393504A445359294"

const endpoint = "https://ceramic-clay.3boxlabs.com"

function App() {
  const [mydid, setMyDID] = useState("-")
  const [did, setDID] = useState("")
  const [dids, setDIDs] = useState()

  function ListQuery() {
    return `query {
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
    }`;
  }

  function mutationCreateQuery(title, status, hours, description) {
    return `mutation {
      createTasks(
        input: {content: {title: "${title}", status: ${status}, hours: ${hours}, description: "${description}"}}
      ) {
        document {
          id
          hours
          description
          status
          title
        }
      }
    }`
  }

  async function authenticate(ceramic, compose) {
    const sessionStr = localStorage.getItem('did')
    
    let session
    
    if (sessionStr) {
      session = await DIDSession.fromSession(sessionStr)
    }

    if (!session || (session.hasSession && session.isExpired)) {

      if (window.ethereum === null || window.ethereum === undefined) {
        throw new Error("No injected Ethereum provider found.");
      }
  
      const ethProvider = window.ethereum;
      const addresses = await requestAccount();
      const accountId = await getAccountId(ethProvider, addresses[0])
      const authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId)    
      
      // session = await DIDSession.authorize(authMethod, { resources: compose.resources })
      session = await DIDSession.authorize(authMethod, {resources: ["ceramic://*"]})

      localStorage.setItem('did', session.serialize());
    }
  
    return session
  }

  async function query() {
    const ceramic = new CeramicClient(endpoint)
    const compose = new ComposeClient({ ceramic, definition });

    const doc = await compose.executeQuery(ListQuery());
    console.log(doc)
  }

  async function create() {
    const ceramic = new CeramicClient(endpoint)
    const compose = new ComposeClient({ ceramic, definition });
    const session = await authenticate(ceramic, compose)

    console.log('Auth: ', session.did)

    compose.setDID(session.did)
    ceramic.did = session.did

    const mutationQuery = mutationCreateQuery("task new2", "STARTED", 16, "New task");
    // console.log(mutationQuery);
    const doc = await compose.executeQuery(mutationQuery);
    console.log(doc)
  }

  async function showMyDID() {
    const ethProvider = window.ethereum;
    const addresses = await requestAccount();
    const accountId = await getAccountId(ethProvider, addresses[0])
    const myDID = "did:pkh:" + accountId.chainId.namespace + ":" + accountId.chainId.reference + ":" + accountId.address;
    setMyDID(myDID)
  }

  async function getDIDs() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, Tasks.abi, signer)

      try {
        const data = await contract.fetchAllDIDs()
        const didList = JSON.parse(JSON.stringify(data))
        const items = didList.map((did, index) => <li key={index}>{did}</li>);
        setDIDs(items);
        console.log('dids: ', didList)
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  async function addDID() {
    if (!did) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, Tasks.abi, signer)
      const transaction = await contract.addDID(did)
      await transaction.wait()
      console.log('added')
    }
  }

  const handleInput = (event) => {
    setDID(event.target.value)
  }

  // request access to the user's MetaMask account
  async function requestAccount() {
    return await window.ethereum.request({
      method: "eth_requestAccounts",
    });
  }

  return (
    <Container>
      <br/><br/>
      My DID: {mydid!=="-" && <b>{mydid}</b>} {mydid==="-" && <Button onClick={showMyDID} variant="warning">Show</Button>}
      <br/><br/>
      <Form>
        <InputGroup size="lg">
          <InputGroup.Text>DID URI</InputGroup.Text>
          <FormControl 
            value={did}
            onChange={handleInput}
            placeholder="your DID URI here"
            aria-label="Large" 
            aria-describedby="inputGroup-sizing-sm" 
          />
        </InputGroup>
      </Form>
      <br/>
      <Button onClick={getDIDs} variant="success">Get list</Button>
      &nbsp;&nbsp;&nbsp; or &nbsp;&nbsp;&nbsp;
      <Button onClick={addDID}>Add DID URI</Button>

      <br/><br/>
      <hr/>
      {dids}
      <br/><br/>
      <hr/>
      <Button onClick={query}>List</Button>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <Button onClick={create}>Create</Button>
    </Container>
  );
}

export default App;