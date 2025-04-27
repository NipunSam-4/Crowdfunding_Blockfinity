import { useState } from 'react';
import { ethers } from 'ethers';
import '../styles.css';

interface CreateCampaignProps {
  contract: ethers.Contract | null;
  onClose: () => void;
  refreshCampaigns: () => void;
}

const CreateCampaign: React.FC<CreateCampaignProps> = ({ 
  contract, 
  onClose,
  refreshCampaigns
}) => {
  const [title, setTitle] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [durationDays, setDurationDays] = useState<string>('30');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract) return;
    
    try {
      setLoading(true);
      setError('');

      // Calculate deadline timestamp (current time + duration in days)
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + (parseInt(durationDays) * 24 * 60 * 60);
      
      // Convert goal to wei
      const goalInWei = ethers.parseEther(goal);
      
      // Create campaign
      const tx = await contract.createCampaign(
        title,
        goalInWei,
        deadlineTimestamp
      );
      
      await tx.wait();
      refreshCampaigns();
      onClose();
    } catch (error: any) {
      console.error('Create campaign error:', error);
      setError(error.message ? error.message.substring(0, 100) : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="create-campaign-modal">
        <div className="modal-header">
          <h2>Create New Campaign</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Campaign Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your campaign"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="goal">Funding Goal (ETH)</label>
            <input
              type="number"
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              step="0.01"
              min="0.01"
              placeholder="Enter funding goal in ETH"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="duration">Duration (days)</label>
            <input
              type="number"
              id="duration"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              min="1"
              max="365"
              placeholder="Campaign duration in days"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || !title || !goal || !durationDays}
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;