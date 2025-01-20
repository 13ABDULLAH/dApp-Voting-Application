const { expect, assert } = require("chai");
const { ethers } = require("hardhat");


describe("MASelection", function () {
    let MASelection;
    let maSelection;
    let admin;
    let addr1;
    let addr2;

    beforeEach(async function () {  //make sure deploy the contract before each test
        MASelection = await ethers.getContractFactory("MASelection");
        [admin, addr1, addr2, _] = await ethers.getSigners();
        maSelection = await MASelection.deploy();
        await maSelection.deployed();
    });

    it("Should set the right admin", async function () { //test whether the admin is set correctly
        expect(await maSelection.admin()).to.equal(admin.address);
    });
    
    it("votingOpen should be false by default", async function () { //test whether the voting is open by default
        expect(await maSelection.votingOpen()).to.equal(false);
    });

    it("voterLimit should be 100 by defualt", async function () { //test whether the voter limit is set to 100 by default
        expect((await maSelection.voterLimit()).toNumber()).to.equal(3);
    });

    it("Voter Limit change succesfully", async function () { //test whether the voter limit can be changed
        await maSelection.connect(admin).setVoterLimit(200);
        expect((await maSelection.voterLimit()).toNumber()).to.equal(200);
    });
    
    
    
});