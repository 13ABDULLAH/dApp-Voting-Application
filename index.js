require('dotenv').config();
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const path = require('path');
const ethers = require('ethers');

app.use(fileUpload({ extended: true }));
app.use(express.static(__dirname));
app.use(express.json());

const { API_URL, PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;

if (!API_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    throw new Error("Please set API_URL, PRIVATE_KEY, and CONTRACT_ADDRESS in your .env file");
}

const abi = require('./artifacts/contracts/MASelection.sol/MASelection.json').abi;
const provider = new ethers.providers.JsonRpcProvider(API_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

const port = 3000;

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/startVoting', async (req, res) => {
    try {
        const tx = await contract.startVoting();
        await tx.wait();
        res.send({ message: 'Voting started successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.post('/endVoting', async (req, res) => {
    try {
        const adminAddress = await contract.admin();
        const signerAddress = await signer.getAddress();

        if (adminAddress.toLowerCase() !== signerAddress.toLowerCase()) {
            return res.status(403).send({ error: 'Only the admin can end the voting' });
        }

        const tx = await contract.endVoting();
        await tx.wait();
        res.send({ message: 'Voting ended successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.post('/vote', async (req, res) => {
    const { candidateId } = req.body;
    try {
        const tx = await contract.vote(candidateId);
        await tx.wait();
        res.send({ message: 'Vote cast successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.post('/registerCandidate', async (req, res) => {
    const { candidateAddress, candidateName, candidateDescription, nationalId } = req.body;
    try {
        const tx = await contract.registerCandidate(candidateAddress, candidateName, candidateDescription, nationalId);
        await tx.wait();
        res.send({ message: 'Candidate registered successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.post('/registerVoter', async (req, res) => {
    const { nationalId, voterAddress } = req.body;
    try {
        const tx = await contract.registerVoter(nationalId, voterAddress);
        await tx.wait();
        res.send({ message: 'Voter registered successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.get('/getWinner', async (req, res) => {
    try {
        const winner = await contract.getWinner();
        res.send({ winner });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.get('/getAllCandidates', async (req, res) => {
    try {
        const candidates = await contract.getAllCandidates();
        res.send({ candidates });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.post('/setVoterLimit', async (req, res) => {
    const { voterLimit } = req.body;

    if (!voterLimit || isNaN(voterLimit) || voterLimit <= 0) {
        return res.status(400).send({ error: 'Invalid voter limit' });
    }

    try {
        const adminAddress = await contract.admin();
        const signerAddress = await signer.getAddress();

        if (adminAddress.toLowerCase() !== signerAddress.toLowerCase()) {
            return res.status(403).send({ error: 'Only the admin can set the voter limit' });
        }

        const tx = await contract.setVoterLimit(voterLimit);
        await tx.wait();

        res.status(200).send({ message: 'Voter limit set successfully', transactionHash: tx.hash });
    } catch (error) {
        console.error('Error setting voter limit:', error);
        res.status(500).send({ error: 'Failed to set voter limit', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});