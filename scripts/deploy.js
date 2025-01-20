const hre = require("hardhat");

async function main() {
    const MASelection = await hre.ethers.getContractFactory("MASelection");
    const maSelection = await MASelection.deploy();

    await maSelection.deployed();

    console.log("MASelection contract deployed to:", maSelection.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});