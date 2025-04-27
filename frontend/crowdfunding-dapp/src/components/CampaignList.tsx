import { useState } from 'react';
import { ethers } from 'ethers';
import CampaignCard from './CampaignCard.tsx';
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

interface CampaignListProps {
  campaigns: Campaign[];
  contract: ethers.Contract | null;
  account: string;
  refreshCampaigns: () => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ 
  campaigns, 
  contract, 
  account,
  refreshCampaigns 
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && campaign.deadline > new Date()) ||
      (filter === 'ended' && campaign.deadline <= new Date());
    
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="campaign-list-container">
      <div className="campaigns-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''} 
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={filter === 'ended' ? 'active' : ''} 
            onClick={() => setFilter('ended')}
          >
            Ended
          </button>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="no-campaigns">
          <p>No campaigns found</p>
        </div>
      ) : (
        <div className="campaigns-grid">
          {filteredCampaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              contract={contract}
              account={account}
              refreshCampaigns={refreshCampaigns}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList;