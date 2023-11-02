//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract Tasks {
    /* the owner of the contract */
    address owner;

    /* list of DID URIs referencing some off-chain data */
    string[] dids;

    /* this is just for testing */    
    struct Task {
      string title;
      string description;
      string status;
      uint thours;
    }
    Task[] public taskList;

    /* we can create listeners for events in the client and use them in The Graph  */
    event TaskCreated(string title, string description, string status, uint thours);

    constructor() {
        /* the creator becomes the owner */
        owner = msg.sender;
    }

    function addDID(string memory _did) public onlyOwner {
        /* append a new DID URI to the list */
        dids.push(_did);
    }

    function addTask(
        string memory _title,
        string memory _description,
        string memory _status,
        uint _thours
    ) public onlyOwner {
        /* just for testing */
        Task memory task = Task({
            title: _title,
            description: _description,
            status: _status,
            thours: _thours
        });
        taskList.push(task);

        /* emit creation event */
        emit TaskCreated(_title, _description, _status, _thours);        
    }

    function fetchAllDIDs() public view returns (string[] memory) {
        return dids;
    }

    function fetchAllTasks() public view returns (Task[] memory) {
        return taskList;
    }

    modifier onlyOwner() {
        /* only the owner can invoke the call */
        require(msg.sender == owner);
        _;
    } 
}
