// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract Crowdfunding is ReentrancyGuard {
    
    // Struct for campaign data
    struct Campaign {
        string title;
        uint256 goal;
        uint256 deadline;
        uint256 totalContributed;
        address creator;
        bool isFunded;
        bool isRefunded;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    uint256 public campaignCount;

    // Events
    event CampaignCreated(uint256 campaignId, string title, uint256 goal, uint256 deadline, address creator);
    event ContributionMade(uint256 campaignId, address backer, uint256 amount);
    event FundsReleased(uint256 campaignId, address creator, uint256 amount);
    event RefundIssued(uint256 campaignId, address backer, uint256 amount);

    // Create a new campaign
    function createCampaign(string memory _title, uint256 _goal, uint256 _deadline) external {
        require(_goal > 0, "Goal must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            title: _title,
            goal: _goal,
            deadline: _deadline,
            totalContributed: 0,
            creator: msg.sender,
            isFunded: false,
            isRefunded: false
        });

        emit CampaignCreated(campaignCount, _title, _goal, _deadline, msg.sender);
    }

    // Contribute to a campaign
    function contribute(uint256 _campaignId) external payable {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution must be greater than 0");

        contributions[_campaignId][msg.sender] += msg.value;
        campaign.totalContributed += msg.value;

        emit ContributionMade(_campaignId, msg.sender, msg.value);
    }

    // Release funds to the creator if goal met
    function releaseFunds(uint256 _campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp > campaign.deadline, "Campaign still active");
        require(campaign.totalContributed >= campaign.goal, "Funding goal not met");
        require(!campaign.isFunded, "Funds already released");
        require(campaign.creator == msg.sender, "Only creator can release funds");

        campaign.isFunded = true;
        uint256 amount = campaign.totalContributed;
        (bool sent, ) = payable(campaign.creator).call{value: amount}("");
        require(sent, "Failed to send Ether");

        emit FundsReleased(_campaignId, campaign.creator, amount);
    }

    // Backer can claim their refund if goal not met
    function refundContribution(uint256 _campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp > campaign.deadline, "Campaign still active");
        require(campaign.totalContributed < campaign.goal, "Funding goal was met");
        require(!campaign.isRefunded, "Refunds already processed");

        uint256 contributedAmount = contributions[_campaignId][msg.sender];
        require(contributedAmount > 0, "No contributions found for sender");

        contributions[_campaignId][msg.sender] = 0; // Update before sending to prevent reentrancy
        (bool refunded, ) = payable(msg.sender).call{value: contributedAmount}("");
        require(refunded, "Refund failed");

        emit RefundIssued(_campaignId, msg.sender, contributedAmount);
    }

    // View functions
    function getCampaignCount() external view returns (uint256) {
        return campaignCount;
    }

    function getCampaignDetails(uint256 _campaignId) external view returns (
        string memory title,
        uint256 goal,
        uint256 deadline,
        uint256 totalContributed,
        address creator,
        bool isFunded,
        bool isRefunded
    ) {
        Campaign memory campaign = campaigns[_campaignId];
        return (
            campaign.title,
            campaign.goal,
            campaign.deadline,
            campaign.totalContributed,
            campaign.creator,
            campaign.isFunded,
            campaign.isRefunded
        );
    }

    function getContributions(uint256 _campaignId, address backer) external view returns (uint256) {
        return contributions[_campaignId][backer];
    }
}
