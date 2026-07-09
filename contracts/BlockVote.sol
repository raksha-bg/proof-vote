// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title BlockVote — On-chain voting contract
/// @notice Enforces one-vote-per-voter, immutable tallies, per-election lifecycle.
/// @dev Deploy one instance per BlockVote environment. Elections are created by the owner.
contract BlockVote {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string title;
        uint256 startTime;
        uint256 endTime;
        bool active;
        uint256 candidateCount;
        mapping(uint256 => Candidate) candidates;
        mapping(address => bool) hasVoted;
        mapping(address => bool) approvedVoters;
    }

    address public owner;
    uint256 public electionCount;
    mapping(uint256 => Election) private elections;

    event ElectionCreated(uint256 indexed id, string title, uint256 startTime, uint256 endTime);
    event ElectionStatusChanged(uint256 indexed id, bool active);
    event CandidateAdded(uint256 indexed electionId, uint256 indexed candidateId, string name);
    event VoterApproved(uint256 indexed electionId, address indexed voter);
    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createElection(string calldata title, uint256 startTime, uint256 endTime) external onlyOwner returns (uint256) {
        require(endTime > startTime, "Invalid window");
        electionCount += 1;
        Election storage e = elections[electionCount];
        e.id = electionCount;
        e.title = title;
        e.startTime = startTime;
        e.endTime = endTime;
        emit ElectionCreated(electionCount, title, startTime, endTime);
        return electionCount;
    }

    function setElectionActive(uint256 electionId, bool active) external onlyOwner {
        elections[electionId].active = active;
        emit ElectionStatusChanged(electionId, active);
    }

    function addCandidate(uint256 electionId, string calldata name) external onlyOwner returns (uint256) {
        Election storage e = elections[electionId];
        e.candidateCount += 1;
        e.candidates[e.candidateCount] = Candidate({ id: e.candidateCount, name: name, voteCount: 0 });
        emit CandidateAdded(electionId, e.candidateCount, name);
        return e.candidateCount;
    }

    function approveVoter(uint256 electionId, address voter) external onlyOwner {
        elections[electionId].approvedVoters[voter] = true;
        emit VoterApproved(electionId, voter);
    }

    /// @notice Cast a single vote. Reverts on double-voting, unapproved voter, or closed election.
    function vote(uint256 electionId, uint256 candidateId) external {
        Election storage e = elections[electionId];
        require(e.active, "Election closed");
        require(block.timestamp >= e.startTime && block.timestamp <= e.endTime, "Out of window");
        require(e.approvedVoters[msg.sender], "Not approved");
        require(!e.hasVoted[msg.sender], "Already voted");
        require(candidateId > 0 && candidateId <= e.candidateCount, "Bad candidate");

        e.hasVoted[msg.sender] = true;
        e.candidates[candidateId].voteCount += 1;
        emit VoteCast(electionId, candidateId, msg.sender);
    }

    function getCandidate(uint256 electionId, uint256 candidateId) external view returns (uint256, string memory, uint256) {
        Candidate storage c = elections[electionId].candidates[candidateId];
        return (c.id, c.name, c.voteCount);
    }

    function candidateCount(uint256 electionId) external view returns (uint256) {
        return elections[electionId].candidateCount;
    }

    function hasVoted(uint256 electionId, address voter) external view returns (bool) {
        return elections[electionId].hasVoted[voter];
    }
}
