import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { ethers } from 'ethers'
import { Button, Form, Container, InputGroup, FormControl } from 'react-bootstrap';
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { DIDSession } from "did-session";
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ComposeClient } from "@composedb/client";
import { getResolver } from 'pkh-did-resolver'
import { Resolver } from 'did-resolver'
import { definition } from "../src/__generated__/definition.js";
import Tasks from './artifacts/contracts/Tasks.sol/Tasks.json'

/******************************************************************************
* 
* Update with the contract address logged out to the CLI when it was deployed 
*
*******************************************************************************/
const contractAddress = "0x61877Ff89bE94A05C9128d3791aabE5ac99AA917"

function App() {

  // React use states
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [myDID, setMyDID] = useState("")
  const [uris, setURIs] = useState("")
  const [document, setDocument] = useState("")

  let pkhDID = "";

  // ---------------------------------- on-chain: MetaMask / Solidity ----------------------------------

  async function loginAndLoadData() {
    await authenticateMetamask();

    // Load DID Document
    await getDocument()

    // Load DID URIs
    await getURIs()
    
    setLoaded(true)
  }

  // Authenticate with MetaMask wallet and build PKH DID
  async function authenticateMetamask() {
    const ethProvider = window.ethereum;
    const addresses = await requestAccount();
    const accountId = await getAccountId(ethProvider, addresses[0])
    
    pkhDID = "did:pkh:" + accountId.chainId.namespace + ":" + accountId.chainId.reference + ":" + accountId.address;        
    setMyDID(pkhDID)    
    
    console.log("Authenticated: ", pkhDID)    
  }

  // Request access to the user's MetaMask account
  async function requestAccount() {
    return await window.ethereum.request({
      method: "eth_requestAccounts",
    });
  }

  // Retrieve the DID Document from on-chain
  async function getDocument() {
    await authenticateMetamask(); // check if authenticated

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, Tasks.abi, signer)

      try {
        console.log("Loading Document and URIs for ", pkhDID)
        let document = await contract.getDocument(pkhDID);

        // If the DID Document is empty, create one
        if (document==="") {
          console.log("No document, create one")
          document = await generateDIDDocument();
          document = JSON.stringify(document, null, " ");

          // Send transaction and wait
          const transaction = await contract.setDocument(pkhDID, document)
          console.log("Pending transaction for document: ", transaction)
          await transaction.wait()
          console.log("Document added")    
        }

        console.log("DID Document retrieved: ", document);
        setDocument(document)
      } catch (err) {
        console.log("Error: ", err)
      }
    }        
  }

  // Use resolver to generate a DID Document based on the DID
  async function generateDIDDocument() {
    const pkhResolver = getResolver()
    const resolver = new Resolver(pkhResolver)
    const didDocument = await resolver.resolve(pkhDID)
    console.log("Resolved DID Document", didDocument.didDocument)
    return didDocument.didDocument;
  }

  // Retrieve the DID URIs from on-chain
  async function getURIs() {
    await authenticateMetamask(); // check if authenticated

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, Tasks.abi, signer)

      try {
        const data = await contract.getURIs(pkhDID);
        const uris = JSON.parse(JSON.stringify(data))
        const items = renderURIs(uris);
        
        console.log('DID URIs retrieved: ', uris)
        setURIs(items);
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  // Add a new DID URI on-cain
  async function addURI(newURI) {
    await authenticateMetamask(); // check if authenticated

    console.log("Adding URI for ", pkhDID)

    if (pkhDID==="") return

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, Tasks.abi, signer)

      const transaction = await contract.addURI(pkhDID, newURI)
      console.log("Pending transaction for URI: ", transaction)
      await transaction.wait()
      console.log("URI added")    
    }
  }

  // Emit event on-chain for testing
  async function emitEventTaskAdded(uri) {
    await authenticateMetamask(); // check if authenticated

    console.log("Emit event task created for ", uri)

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, Tasks.abi, signer)

      const transaction = await contract.emitTaskCreated(pkhDID, uri, title, description, "NOT_STARTED", hours)
      console.log("Pending transaction for emit event: ", transaction)
      await transaction.wait()
      console.log("Event task created emitted")    
    }
  }

  // ---------------------------------- off-chain: Ceramic / ComposeDB ----------------------------------

  // Ceramic endpoint
  const endpoint = "https://ceramic-clay.3boxlabs.com"

  // Authenticate the user to access Ceramic
  async function authenticateCeramic(ceramic, compose) {
    console.log("Authenticate for Ceramic")

    // Check if we already have a DID Session on the local storage of the browser
    const sessionStr = localStorage.getItem('did')    
    let session    
    if (sessionStr) {
      session = await DIDSession.fromSession(sessionStr)
    }

    // If not, create a new DID Session
    if (!session || (session.hasSession && session.isExpired)) {
      if (window.ethereum === null || window.ethereum === undefined) {
        throw new Error("No injected Ethereum provider found.");
      }
  
      const ethProvider = window.ethereum;
      const addresses = await requestAccount();
      const accountId = await getAccountId(ethProvider, addresses[0])
      const authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId)    
      
      /* session = await DIDSession.authorize(authMethod, { resources: compose.resources }) */

      // Create the session and save on the local storage
      session = await DIDSession.authorize(authMethod, {resources: ["ceramic://*"]})
      localStorage.setItem('did', session.serialize());
    }
  
    return session
  }

  // Add a new task as a composite off-chain on the CompositeDB
  async function addTask() {
    const ceramic = new CeramicClient(endpoint)
    const compose = new ComposeClient({ ceramic, definition });
    const session = await authenticateCeramic(ceramic, compose)

    console.log('Auth DID Document ', session.did)

    compose.setDID(session.did)
    ceramic.did = session.did

    const mutationQuery = mutationCreateQuery();
    console.log("Mutation query: ", mutationQuery);
    const doc = await compose.executeQuery(mutationQuery);
    const subject = JSON.parse(JSON.stringify(doc))
    console.log("ComposeDB DID Subject: ", subject)

    // get the off-chain stream id from composer
    const streamId = subject?.data?.createTasks?.document?.id;
    console.log("Stream id for the new DID Subject: ", streamId)

    const newURI = `did:3:${streamId}`;
    console.log("3ID URI: ", newURI)

    // publish the URI on-chain
    await addURI(newURI)

    // emit event with the info (just for testing)
    await emitEventTaskAdded(newURI);

    // Reload page
    await loginAndLoadData();
  }  

  // Mutation query to run on the composite and create the new DID Subject
  function mutationCreateQuery() {
    return `mutation {
      createTasks(
        input: {content: {title: "${title}", status: NOT_STARTED, hours: ${hours}, description: "${description}"}}
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

  // async function query() {
  //   const ceramic = new CeramicClient(endpoint)
  //   const compose = new ComposeClient({ ceramic, definition });
  //   const doc = await compose.executeQuery(ListQuery());
  //   console.log(doc)
  // }

  // function ListQuery() {
  //   return `query {
  //     tasksIndex(first: 10) {
  //       edges {
  //         node {
  //           hours
  //           id
  //           status
  //           title
  //           description
  //         }
  //       }
  //     }
  //   }`;
  // }

  // ---------------------------------- Rendering ----------------------------------

  const handleTitle = (event) => { setTitle(event.target.value) }
  const handleDescription = (event) => { setDescription(event.target.value) }
  const handleHours = (event) => { setHours(event.target.value) }

  // The list of DID URIs pointing to Ceramic HTTP API endpoint for streams
  function renderURIs(uris) {
    return (
      <>
      {uris.map(function(uri) {
        return (
          <li key={uri}>
            <a href={`https://ceramic-clay.3boxlabs.com/api/v0/streams/${uri.substring(6)}`} target="_blank" rel="noreferrer">{uri}</a>
          </li>
        )
      })}
      </>
    )
  }  

  // The form
  const renderForm = (
    <><><h3>Add a new Task</h3>
    <Form>
      <InputGroup size="m">
        <InputGroup.Text>Title</InputGroup.Text>
        <FormControl
          value={title}
          onChange={handleTitle}
          placeholder="a small title"
          aria-label="Large"
          aria-describedby="inputGroup-sizing-sm" />
      </InputGroup>
      <InputGroup size="m">
        <InputGroup.Text>Description</InputGroup.Text>
        <FormControl
          value={description}
          onChange={handleDescription}
          placeholder="description of the task"
          aria-label="Large"
          aria-describedby="inputGroup-sizing-sm" />
      </InputGroup>
      <InputGroup size="m">
        <InputGroup.Text>Estimated hours</InputGroup.Text>
        <FormControl
          value={hours}
          onChange={handleHours}
          placeholder="estimation in hours"
          aria-label="Large"
          aria-describedby="inputGroup-sizing-sm" />
      </InputGroup>
    </Form>
    <br />
    </><Button onClick={addTask} variant="success">Store</Button></>
  );

  return (
    <Container>
      <br/><br/>
      <h1>DID for Tasks</h1>
      { !loaded && <Button onClick={loginAndLoadData} variant="warning">Login w/ Metamask</Button>}
      { loaded && <>DID: <b>{myDID}</b> <br/><br/> {renderForm} <br/><br/></>  }
      { loaded && <><b>DID Document:</b><br/><textarea defaultValue={document} rows="6" cols="80"></textarea></> }
      { loaded && <><b>URIs:</b><br/>{uris}</> }
      <br/><br/>
    </Container>
  );
}

export default App;