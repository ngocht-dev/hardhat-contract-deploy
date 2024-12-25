const FileSystem = require("fs");

const CONTRACT_FOLDER = "../artifacts/contracts";
const OUTPUT_FOLDER = "./abis";
/**
 *
 * @param {string} contract
 * @param {string} OUTPUT_FOLDER
 */
const exportAbi = function (contract) {
  const paths = contract.split('/');
  let filePath = `${CONTRACT_FOLDER}`;
  if (paths.length > 1) {
    for (let index = 0; index < paths.length - 1; index++) {
      filePath += `/${paths[index]}`
    }
  }
  const contractName = paths[paths.length - 1];
  filePath += `/${contractName}.sol/${contractName}.json`

  console.log('file: ', filePath)
  const artifact = require(filePath);
  console.log("Contract name: ", artifact.contractName);
  const abiPath = OUTPUT_FOLDER + "/" + artifact.contractName + ".json";
  console.log("\tWriting ABI file: ", abiPath);
  FileSystem.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, "  "));
};
/**
 *
 * @param {string[]} contracts
 * @param {string} OUTPUT_FOLDER
 */
const exportAbis = function (contracts) {
  contracts.forEach((contract) => exportAbi(contract));
};

exportAbis([
  "DmtpTech",
]);
