let provider, signer, contract;

// Contract ABI (replace with your actual ABI)
const abi =[
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "candidateCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "candidates",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "voteCount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "nationalID",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWinner",
    "outputs": [
      {
        "internalType": "string",
        "name": "winnerName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "totalVotes",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_candidateAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_nationalID",
        "type": "string"
      }
    ],
    "name": "registerCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_voterAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_nationalID",
        "type": "string"
      }
    ],
    "name": "registerVoter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "registeredNationalID",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_limit",
        "type": "uint256"
      }
    ],
    "name": "setVoterLimit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateID",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_nationalID",
        "type": "string"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "voterCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "voterLimit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "voters",
    "outputs": [
      {
        "internalType": "string",
        "name": "nationalID",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "hasVoted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingOpen",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Replace with your deployed contract address
const contractAddress ="0xC6eAdAfc3eB75140c4062daE67DaeBA2255A6f47";


async function connectMetamask() { // Connect to MetaMask function
    if (typeof window.ethereum !== 'undefined') {
        await ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
        
        const account = await signer.getAddress();
        document.getElementById('metamasknotification').textContent = `Connected as: ${account}`;
        
        // Detect account change
        ethereum.on('accountsChanged', async (accounts) => {
            if (accounts.length === 0) {
                alert('Please connect to MetaMask.');
            } else {
                // Update the signer and UI when user changes the account
                signer = provider.getSigner();
                const newAccount = accounts[0];
                document.getElementById('metamasknotification').textContent = `Connected as: ${newAccount}`;
                await checkAdminPrivileges();  // Update admin check on account change
            }
            
        });
    } else {
        alert("MetaMask is not installed.");
    }
}


async function checkAdminPrivileges() { // Check if the connected account is the admin
    if (!contract) {
        alert("Please connect to MetaMask first.");
        return;
    }
    
    try {
        const adminAddress = await contract.admin();
        const signerAddress = await signer.getAddress();

        if (adminAddress.toLowerCase() === signerAddress.toLowerCase()) { //if it is admin, it can see the voting start button
            document.getElementById('votingStart').style.display = 'block';
        } else {
            document.getElementById('votingStart').style.display = 'none';
            
        }
    } catch (error) {
        console.error("Error checking admin privileges:", error);
        
    }
}

async function registerVoter() { // Register voter function
    event.preventDefault();  // Prevent form submission
    if (!contract) {
        alert("Please connect to MetaMask first.");
        return;
    }
    const nationalId = document.getElementById('nationalId').value;
    const voterAddress = document.getElementById('voterAddress').value;
    
    try {
        const adminAddress = await contract.admin();
        const signerAddress = await signer.getAddress();
        
        if (adminAddress.toLowerCase() !== signerAddress.toLowerCase()) { //if the connected account is not the admin, it cannot register voters
            alert("Only the admin can register voters."); 
            return;
        }

        const tx = await contract.registerVoter(voterAddress, nationalId);
        await tx.wait();  // Wait for the transaction to be mined
        alert("Voter registered successfully!");
    } catch (error) {
        alert(`Error registering voter: ${error.message}`);
    }
}

async function updateVoterCount() { // Update voter count function
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    try {
        const voterLimit = await contract.voterLimit();
        const voterLimitElement = document.getElementById('currentVoterLimit');
        if (voterLimitElement) { //if the voter limit element exists, it will display the voter limit
            voterLimitElement.textContent = voterLimit.toString();
        }
    } catch (error) { //if there is an error, it will display an error message
        console.error("Error fetching voter limit:", error);
        const voterLimitElement = document.getElementById('currentVoterLimit');
        if (voterLimitElement) {
            voterLimitElement.textContent = "Error fetching limit";
        }
    }
}

async function updateVoterLimit() { // Update voter limit function
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    try {
        const voterLimit = await contract.voterLimit();
        document.getElementById('currentVoterLimit').textContent = voterLimit.toString();
    } catch (error) {
        console.error("Error fetching voter limit:", error);
        document.getElementById('currentVoterLimit').textContent = "Error fetching limit";
    }
}

// Automatically fetch voter limit and count when page loads
window.addEventListener('load', () => { 
      if (contract) {
        updateVoterLimit();
        updateVoterCount();
    } else {
        connectMetamask().then(() => {
            updateVoterLimit();
            updateVoterCount();
        });
    }

    
});

async function setVoterLimit() { // Set voter limit function
    event.preventDefault();
    if (!contract) {
        alert("Please connect to MetaMask first.");
        return;
    }
    const voterLimit = document.getElementById('voterLimit').value;

    try {
        const adminAddress = await contract.admin();
        const signerAddress = await signer.getAddress();

        if (adminAddress.toLowerCase() !== signerAddress.toLowerCase()) {
            alert("Only the admin can register voters.");
            return;
        }
        const tx = await contract.setVoterLimit(parseInt(voterLimit));
        await tx.wait();
        alert("Voter limit set successfully!"); //if the voter limit is set successfully, it will display a success message
        await updateVoterLimit();
    } catch (error) {
        alert(`Error setting voter limit: ${error.message}`); //if there is an error, it will display an error message
    }
}

async function registerCandidate() { // Register candidate function
    event.preventDefault();  // Prevent form submission
    if (!contract) {
        alert("Please connect to MetaMask first.");
        return;
    }
    const nationalId = document.getElementById('nationalId').value;
    const candidateAddress = document.getElementById('candidateAddress').value;
    const candidateName = document.getElementById('candidateName').value;
    const candidateDescription = document.getElementById('candidateDescription').value;

    try {
        const adminAddress = await contract.admin();
        const signerAddress = await signer.getAddress();
        
        if (adminAddress.toLowerCase() !== signerAddress.toLowerCase()) {
            alert("Only the admin can register voters.");
            return;
        }

        const tx = await contract.registerCandidate(candidateAddress, candidateName,candidateDescription, nationalId);
        await tx.wait();  // Wait for the transaction to be mined
        alert("Candidate registered successfully!");
    } catch (error) {
        alert(`Error registering voter: ${error.message}`);
    }
}

async function getAllCandidates() { // Get all candidates function
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    try {
        // Get the total number of candidates
        const candidateCount = await contract.candidateCount();
        const candidateTableBody = document.getElementById('myTable').getElementsByTagName('tbody')[0];
        const adminAddress = await contract.admin();
        const signerAddress = await signer.getAddress();

        // Clear any existing candidates in the table
        candidateTableBody.innerHTML = '';
        const isIndexPage = window.location.pathname.includes('index.html');

      if(!isIndexPage){
        if (adminAddress.toLowerCase() !== signerAddress.toLowerCase()) {
          alert("Only the admin can see candidate info.");
          return;
      }
      }

        // Loop through all candidates and add them to the table
        for (let i = 1; i <= candidateCount; i++) {
            const candidate = await contract.candidates(i);

            // Create a new row for each candidate
            const row = candidateTableBody.insertRow();

            // Create cells for each piece of candidate data
            const cellIndex = row.insertCell(0);
            const cellName = row.insertCell(1);
            const cellDescription = row.insertCell(2);

            // Populate the cells with candidate data
            cellIndex.textContent = i;
            cellName.textContent = candidate.name;
            cellDescription.textContent = candidate.description;

          if(isIndexPage){ //if it is index page, it will not display nationalID and votes
            // Optionally, you can add hidden cells for nationalID and votes if needed
            const cellNationalID = row.insertCell(3);
            const cellVotes = row.insertCell(4);
            cellNationalID.style.display = 'none';
            cellVotes.style.display = 'none';
          }  
          else{
            // Display nationalID and votes for registercandidate.html
            const cellNationalID = row.insertCell(3);
            const cellVotes = row.insertCell(4);
            cellNationalID.textContent = candidate.nationalID;
            cellVotes.textContent = candidate.voteCount;
          }
        }
    } catch (error) {
        console.error(error);
        alert('Failed to load candidates');
    }
}


async function checkVotingStatus() { // Check voting status function
    if (!contract) {
        alert("Please connect to MetaMask first.");
        return;
    }
    try {
        const isVotingOpen = await contract.votingOpen();
        const votingStatusElement = document.getElementById('votingStatus');
        votingStatusElement.textContent = isVotingOpen ? "Voting is Open" : "Voting is Closed"; //if the voting is open, it will display "Voting is Open", otherwise it will display "Voting is Closed"
    } catch (error) {
        console.error("Error checking voting status:", error);
    }
}

async function startVoting() { // Start voting function
    if (!contract) {
        alert("Please connect to MetaMask first.");
        return;
    }
    try {
        const adminAddress = await contract.admin();
        const signerAddress = await signer.getAddress();
        
        if (adminAddress.toLowerCase() !== signerAddress.toLowerCase()) {
            alert("Only the admin can start the voting.");
            return;
        }

        const tx = await contract.startVoting();
        await tx.wait();
        alert("Voting started successfully!");
        await checkVotingStatus();  // Update voting status
    } catch (error) {
        alert(`Error starting voting: ${error.message}`);
    }
}

async function endVoting() { // End voting function
    if (!contract) {
        alert("Please connect to MetaMask first.");
        return;
    }
    try {
        const adminAddress = await contract.admin();
        const signerAddress = await signer.getAddress();
        
        if (adminAddress.toLowerCase() !== signerAddress.toLowerCase()) {
            alert("Only the admin can end the voting.");
            return;
        }

        const tx = await contract.endVoting();
        await tx.wait();
        alert("Voting ended successfully!");
        await checkVotingStatus();  // Update voting status
    } catch (error) {
        alert(`Error ending voting: ${error.message}`);
    }
}

async function vote() { // Vote function
    
    event.preventDefault(); // Prevent form submission
    if (!contract) {
        alert("Please connect to MetaMask first.");
        return;
    }

    const candidateId = document.getElementById('candidateId').value;
    const nationalId = prompt("Enter your National ID to vote:"); // Prompt the user to enter their National ID

    try {
        const tx = await contract.vote(candidateId, nationalId);
        await tx.wait();
        alert("Your vote has been submitted.");
    } catch (error) {
        alert(`Error voting: ${error.message}`);
    }
}

async function getWinner() { // Get winner function
    if (!contract) {
        alert("Please connect to MetaMask first.");
        return;
    }

    try {
        const winnerData = await contract.getWinner();
        const winnerName = winnerData[0];
        const totalVotes = winnerData[1];

        if (winnerName && totalVotes !== 0) { //if there is a winner and there are votes, it will display the winner and total votes
            document.getElementById('winner').innerHTML = `
                <p>Winner: <strong>${winnerName}</strong></p>
                <p>Total Votes: <strong>${totalVotes}</strong></p>
            `;
        } else { //if there is no winner or no votes, it will display a message
            document.getElementById('winner').innerHTML = `
                <p>No winner declared yet. Voting might still be ongoing or there are no votes.</p>
            `;
        }
    } catch (error) {
        alert(`Error fetching winner: ${error.message}`);
    }

    
}


