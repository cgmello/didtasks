//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract Tasks {
    /* the owner of the contract */
    address public owner;

    /* DID documents */
    struct Task {
        address caller;
        string did;
        string didDocument;
        string[] uris;
    }

    /* map DID to the Task document */
    mapping(string => Task) public didToTask;

    /* we can create listeners for events in the client and use them in The Graph  */
    event TaskCreated(string did, string uri, string title, string description, string status, uint thours);
    event DocumentUpdated(string did, string didDocument);

    constructor() {
        owner = msg.sender;
    }

    function getDocument(string memory _did) public view returns (string memory) {        
        return didToTask[_did].didDocument;
    }

    function getURIs(string memory _did) public view returns (string[] memory) {
        return didToTask[_did].uris;
    }

    function setDocument(string memory _did, string memory _document) public {
        didToTask[_did].didDocument = _document;
        emit DocumentUpdated(_did, _document);
    }

    function addURI(string memory _did, string memory _uri) public {
        didToTask[_did].uris.push(_uri);
    }

    function emitTaskCreated(string memory _did, string memory _uri, string memory _title, string memory _description, string memory _status, uint _thours) public { 
        emit TaskCreated(_did, _uri, _title, _description, _status, _thours);
    }
}
