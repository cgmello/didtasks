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
    event NewUserCreated(string did, string didDocument);
    event TaskCreated(string did, string uri, string title, string description, string status, uint thours);

    constructor() {
        owner = msg.sender;
    }

    function hasTask(string memory _did) public view returns (bool) {
        return compareStr(didToTask[_did].did, "");
    }

    function getDocument(string memory _did) public view returns (string memory) {        
        return didToTask[_did].didDocument;
    }

    function getURIs(string memory _did) public view returns (string[] memory) {
        return didToTask[_did].uris;
    }

    function addTask(string memory _did, string memory _document) public {
        Task memory task;
        task.caller = msg.sender;
        task.did = _did;
        task.didDocument = _document;
        didToTask[_did] = task;
        emit NewUserCreated(_did, _document);
    }    

    function emitTaskCreated(string memory _did, string memory _uri, string memory _title, string memory _description, string memory _status, uint _thours) public { 
        emit TaskCreated(_did, _uri, _title, _description, _status, _thours);
    }

    function addURI(string memory _did, string memory _uri) public {
        didToTask[_did].uris.push(_uri);
    }

    function compareStr(string memory _s1, string memory _s2) private pure returns (bool) {
        return (keccak256(abi.encodePacked(_s1)) == keccak256(abi.encodePacked(_s2)));
    }
}
