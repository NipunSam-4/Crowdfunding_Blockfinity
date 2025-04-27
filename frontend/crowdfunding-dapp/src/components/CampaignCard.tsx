import { useState } from 'react';
import { ethers } from 'ethers';
import '../styles.css';

interface Campaign {
  id: number;
  title: string;
  goal: string;
  deadline: Date;
  totalContributed: string;
  creator: string;
  isFunded: boolean;
  isRefunded: boolean;
  userContribution: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  contract: ethers.Contract | null;
  account: string;
  refreshCampaigns: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ 
  campaign, 
  contract, 
  account,
  refreshCampaigns 
}) => {
  const [contributionAmount, setContributionAmount] = useState<string>('');
  const [isContributing, setIsContributing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const isActive = campaign.deadline > new Date();
  const progress = (parseFloat(campaign.totalContributed) / parseFloat(campaign.goal)) * 100;
  const isCreator = campaign.creator.toLowerCase() === account.toLowerCase();
  const isGoalMet = parseFloat(campaign.totalContributed) >= parseFloat(campaign.goal);
  const hasContributed = parseFloat(campaign.userContribution) > 0;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleContribute = async () => {
    if (!contract || !contributionAmount) return;

    try {
      setLoading(true);
      setError('');

      const tx = await contract.contribute(campaign.id, {
        value: ethers.parseEther(contributionAmount)
      });
      
      await tx.wait();
      setContributionAmount('');
      setIsContributing(false);
      refreshCampaigns();
    } catch (error: any) {
      console.error('Contribution error:', error);
      setError(error.message ? error.message.substring(0, 100) : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseFunds = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      setError('');

      const tx = await contract.releaseFunds(campaign.id);
      await tx.wait();
      refreshCampaigns();
    } catch (error: any) {
      console.error('Release funds error:', error);
      setError(error.message ? error.message.substring(0, 100) : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      setError('');

      const tx = await contract.refundContribution(campaign.id);
      await tx.wait();
      refreshCampaigns();
    } catch (error: any) {
      console.error('Refund error:', error);
      setError(error.message ? error.message.substring(0, 100) : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`campaign-card ${!isActive ? 'ended' : ''}`}>
      <div className="campaign-header">
        <h3>{campaign.title}</h3>
        <span className={`status ${isActive ? 'active' : 'ended'}`}>
          {isActive ? 'Active' : 'Ended'}
        </span>
      </div>

      <div className="campaign-details">
        <div className="goal-info">
          <span>Goal: {campaign.goal} ETH</span>
          <span>Raised: {campaign.totalContributed} ETH</span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${progress > 100 ? 100 : progress}%` }}
          />
        </div>
        
        <div className="campaign-meta">
          <p>Deadline: {formatDate(campaign.deadline)}</p>
          <p className="creator">
            Creator: {isCreator ? 'You' : `${campaign.creator.substring(0, 6)}...${campaign.creator.substring(campaign.creator.length - 4)}`}
          </p>
          {hasContributed && (
            <p className="your-contribution">Your contribution: {campaign.userContribution} ETH</p>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="campaign-actions">
        {isActive ? (
          isContributing ? (
            <div className="contribution-form">
              <input
                type="number"
                step="0.01"
                placeholder="ETH amount"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
              />
              <div className="contribution-buttons">
                <button 
                  onClick={handleContribute}
                  disabled={loading || !contributionAmount}
                >
                  {loading ? 'Processing...' : 'Contribute'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setIsContributing(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="contribute-btn"
              onClick={() => setIsContributing(true)}
            >
              Contribute
            </button>
          )
        ) : (
          <>
            {isCreator && !campaign.isFunded && isGoalMet && (
              <button 
                className="release-btn"
                onClick={handleReleaseFunds}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Release Funds'}
              </button>
            )}
            
            {!isCreator && hasContributed && !isGoalMet && !campaign.isRefunded && (
              <button 
                className="refund-btn"
                onClick={handleRefund}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Claim Refund'}
              </button>
            )}
            
            {(campaign.isFunded || campaign.isRefunded) && (
              <div className="campaign-completed">
                {campaign.isFunded ? 'Funds released to creator' : 'Campaign unsuccessful'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignCard;