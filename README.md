# Voting dApp System

This project is a decentralized voting application built on the Ethereum blockchain. It allows users to register candidates and voters, start and end voting, and cast votes in a secure and transparent manner.

## Features

- **Admin Functions**:
  - Register candidates with name, description, and national ID.
  - Set voter limit.
  - Start and end voting.

- **Voter Functions**:
  - Register as a voter with a national ID and Ethereum address.
  - Cast a vote for a registered candidate.

- **General Functions**:
  - View all registered candidates.
  - View election results.

## Smart Contract

The smart contract `MASelection.sol` contains the core logic for the voting system. It includes the following key components:

- **Structures**:
  - `Candidate`: Contains candidate details such as name, description, vote count, and national ID.
  - `Voter`: Contains voter details such as national ID and voting status.

- **State Variables**:
  - `admin`: The address of the contract administrator.
  - `candidateCount`: The total number of registered candidates.
  - `voterCount`: The total number of registered voters.
  - `voterLimit`: The maximum number of voters allowed.
  - `votingOpen`: A boolean indicating whether voting is currently open.

- **Mappings**:
  - `candidates`: Maps candidate IDs to `Candidate` structures.
  - `voters`: Maps voter addresses to `Voter` structures.
  - `registeredNationalID`: Maps national IDs to a boolean indicating registration status.

- **Modifiers**:
  - `onlyAdmin`: Restricts function access to the admin.
  - `onlyDuringVoting`: Restricts function access to when voting is open.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/your-repository-name.git
   cd your-repository-name