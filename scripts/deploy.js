const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/swisstronik.js");

const sendShieldedTransaction = async (signer, destination, data, value) => {
  // Get the RPC link from the network configuration
  const rpclink = hre.network.config.url;

  // Encrypt transaction data
  const [encryptedData] = await encryptDataField(rpclink, data);

  // Construct and sign transaction with encrypted data
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  /**
   * @dev make sure the first argument has the same name as your contract in the Hello_swtr.sol file
   * @dev the second argument must be the message we want to set in the contract during the deployment process
   */
  const contract = await hre.ethers.deployContract("Swisstronik");

  await contract.waitForDeployment();

  console.log(`Swisstronik contract deployed to ${contract.target}`);

  const [signer] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory("Swisstronik");
  const Contract = contractFactory.attach(contract.target);
  // Send a shielded query to retrieve data from the contract
  const functionName = "mint";
  console.log("address:", signer.address)
  const setMessageTx = await sendShieldedTransaction(signer, contract.target, Contract.interface.encodeFunctionData(functionName, [signer.address, 10]));
  await setMessageTx.wait();

  //It should return a TransactionResponse object
  console.log("Transaction Receipt: ", setMessageTx);
}

//DEFAULT BY HARDHAT:
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});