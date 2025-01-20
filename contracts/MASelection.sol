//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0; //version of solidity that will be use
// Group Name : Ilyas team
// ABDULLAH ALWAFI BIN MOHD AMINUDIN 2219713
// AHMAD FAHMI BIN MOHD ZAKI 2219373
// MUHAMMAD 'ILYAS AMIERRULLAH BIN AB KARIM 2119297
contract MASelection{ //smart contract of election, everything is in this one contract
    struct Candidate{ //structure for candidate have data that a candidate need
        string name;
        string description;
        uint256 voteCount;
        string nationalID;
    }

    struct Voter{ //structure for voter
        string nationalID;
        bool hasVoted;
    }

    address public admin;
    uint256 public candidateCount;
    uint256 public voterCount;
    uint256 public voterLimit;
    bool public votingOpen; //every data that will be use in function

    mapping(uint256 => Candidate)public candidates;
    mapping(address => Voter)public voters;
    mapping(string => bool)public registeredNationalID; //map use to store data that user enter in the function
   
    
    modifier onlyAdmin(){ //modifier use to change function behavior, certain function can only be access by admin
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyDuringVoting(){ //certain function can only be access during voting
        require(votingOpen, "Voting is not currently open");
        _;
    }

    modifier onlyAfterVoting(){ //certain function can only be access after voting
        require(!votingOpen,"Voting is still open");
        _;
    }

    constructor(){
        admin = msg.sender; //the admin will be the first that execute this code
        candidateCount = 0;
        voterCount = 0;
        votingOpen = false;
        voterLimit = 100;
        //default value and data in the constructor    
    }
    function setVoterLimit(uint256 _limit)public  onlyAdmin {
        require(_limit > 0 , "limit must be greater than zero"); //admin cannot set the limit below zero
        voterLimit = _limit; //the data admin enter will be store as new value of voterLimit
    }

    function validateNationalID(string memory _nationalID) internal pure returns (bool){ //function to validate nationalID, will receive nationalID as input
        bytes memory nationalIDBytes = bytes(_nationalID); //the national ID will be store as byte to check for validation
        if(nationalIDBytes.length != 7 ){ //if national ID is less than 7 or not enough character, the national ID is invlaid
            return false;
        }
        return (nationalIDBytes[0] == '2' && nationalIDBytes[1] == '2'); //national ID must start 22 at the front
    }

    function registerVoter(address _voterAddress, string memory _nationalID) public onlyAdmin{ //admin can register voter, need voter account address and their nationalID
        require(voterCount < voterLimit, "Registration of voter for this place has reach limit"); //if voter has reach limit, cannot register new voter
        require(!registeredNationalID[_nationalID], "Voter is already registered"); //voter cannot register twice
        require(bytes(voters[_voterAddress].nationalID).length == 0, "This address is already associated with a voter"); //one account can only be register one nationalID
        require(validateNationalID(_nationalID), "Invalid national ID, you are not eligible for voting"); //if national ID is not valid, cannot register voter
        voters[_voterAddress]= Voter({ nationalID: _nationalID, hasVoted: false }); //voters data will be store to voter struct
        registeredNationalID[_nationalID]=true; //after register, cannot register twice
        voterCount++; //after registration, will +1 voter count to know how many voter and to check for the limit
    }

    function registerCandidate(address _candidateAddress, string memory _name, string memory _description, string memory _nationalID) public onlyAdmin { //admin can register candidate
        require(!registeredNationalID[_nationalID], "Candidate is already registered"); //candidate cannot register twice, or using same id
        require(bytes(voters[_candidateAddress].nationalID).length == 0, "This address is already associated with a candidate"); //one account can only be register one nationalID
        require(validateNationalID(_nationalID), "Invalid national ID, you are not eligible for candidate");//candidate need valid national id to register

        candidateCount ++; //count how many candidate have register
        candidates[candidateCount] = Candidate ({ //store data of candidate
            name: _name,
            description: _description,
            voteCount: 0,
            nationalID: _nationalID
        });
        voters[_candidateAddress]= Voter({nationalID: _nationalID, hasVoted: false}); //store data of candidate in voters because candidate also can vote
        registeredNationalID[_nationalID]=true; //cannot register candidate using same nationalid
    } 

    function startVoting()public onlyAdmin{ //admin can open the voting
        require(candidateCount >= 2, "At least two candidates are required to start voting");//if admin want to open the voting, need at least 2 candidates
        votingOpen = true; 
    }

    function endVoting()public onlyAdmin{//admin can closed voting
        require(votingOpen, "Voting is already closed");
        votingOpen = false;
    }

    function vote(uint256 _candidateID, string memory _nationalID) public onlyDuringVoting{ //function for voter to vote
        require (_candidateID > 0 && _candidateID <= candidateCount , "Invalid candidate ID"); //candidate ID must correct
        require(keccak256(abi.encodePacked(voters[msg.sender].nationalID)) == keccak256(abi.encodePacked(_nationalID)), 
        "National ID not match registered ID"); //if user enter the wrong nationalID as being registered earlier, voter cannot vote
        require(!voters[msg.sender].hasVoted,"Soz, you can only vote one time"); //voter can only vote once
        

        candidates[_candidateID].voteCount ++; //will count for each candidate how many vote they get
        voters[msg.sender].hasVoted = true; 
    } 

    function getWinner()public view onlyAfterVoting returns (string memory winnerName, uint256 totalVotes){ //funciton to get winner of the election
        require (candidateCount > 0 , "No winner because no candidate"); //if no candidate cannot know who is the winner

        uint256 highestVotes;
        uint256 winningID;
        bool isTie = false;

        for (uint256 i = 1; i <= candidateCount; i++){ //calculate the votes
            if (candidates[i].voteCount > highestVotes){
                highestVotes = candidates[i].voteCount;
                winningID = i;
                isTie = false;
            }
            else if (candidates[i].voteCount == highestVotes){
                isTie = true;
            }
        }

        if (highestVotes == 0){
            winnerName = "No one has voted yet";
            totalVotes = 0;
        }
        else if(isTie){
            winnerName = "Result is tie, the election committe will determine whether to do election back or not" ;
            totalVotes = highestVotes;
        }
        else {
        winnerName = candidates[winningID].name;
        totalVotes = candidates[winningID].voteCount; //display the winner and totalvotes
        }
    }
}


