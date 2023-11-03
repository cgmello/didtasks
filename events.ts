const ethers = require("ethers");

async function main() {
    let abi = ["event TaskCreated(string did, string uri, string title, string description, string status, uint thours)"];
    const infura = "wss://sepolia.infura.io/ws/v3/4b4d5e12505f4248ab2ba918fdcec22c"
    const address = "0x61877Ff89bE94A05C9128d3791aabE5ac99AA917";
    const provider = new ethers.providers.WebSocketProvider(infura);
    const contract = new ethers.Contract(address, abi, provider);
    console.log("Start listening...");
    contract.on("TaskCreated", (did: string, uri: string, title: string, description: string, status: string, thours: number) => {
        let info = {
            did: did,
            uri: uri,
            title: title,
            description: description,
            status: status,
            thours: thours,
        };
        console.log(JSON.stringify(info, null, 4));
    });
}

main();