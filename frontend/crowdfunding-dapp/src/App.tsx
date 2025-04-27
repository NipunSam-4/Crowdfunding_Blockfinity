import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Header from './components/Header';
import CampaignList from './components/CampaignList';
import CreateCampaign from './components/CreateCampaign';
import CrowdfundingABI from './contracts/Crowdfunding.json';
import './styles.css';

const App = () => {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Contract address - replace with your deployed contract address
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // Initialize provider
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          // Setup contract
          const signer = await provider.getSigner();
          const crowdfundingContract = new ethers.Contract(
            contractAddress,
            CrowdfundingABI.abi,
            signer
          );
          setContract(crowdfundingContract);

          // Get accounts
          const accounts = await provider.send('eth_requestAccounts', []);
          setAccount(accounts[0]);

          // Load campaigns
          await loadCampaigns(crowdfundingContract);

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            setAccount(accounts[0]);
          });

          // Listen for chain changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
        } catch (error) {
          console.error('Error initializing app:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.error('MetaMask is not installed');
        setLoading(false);
      }
    };

    init();

    return () => {
      // Clean up event listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const loadCampaigns = async (contractInstance: ethers.Contract) => {
    try {
      const count = await contractInstance.getCampaignCount();
      const campaignCount = Number(count);
      const campaignsData = [];

      for (let i = 1; i <= campaignCount; i++) {
        const campaign = await contractInstance.getCampaignDetails(i);
        const contributionAmount = account 
          ? await contractInstance.getContributions(i, account)
          : ethers.parseEther("0");
          
        campaignsData.push({
          id: i,
          title: campaign[0],
          goal: ethers.formatEther(campaign[1]),
          deadline: new Date(Number(campaign[2]) * 1000),
          totalContributed: ethers.formatEther(campaign[3]),
          creator: campaign[4],
          isFunded: campaign[5],
          isRefunded: campaign[6],
          userContribution: ethers.formatEther(contributionAmount)
        });
      }

      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const refreshCampaigns = () => {
    if (contract) {
      loadCampaigns(contract);
    }
  };

  const toggleCreateModal = () => {
    setIsCreateModalOpen(!isCreateModalOpen);
  };

  return (
    <div className="app">
      <Header 
        account={account} 
        openCreateModal={toggleCreateModal} 
      />
      
      <main className="container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : !account ? (
          <div className="connect-wallet-prompt">
            <h2>Please connect your wallet to use the application</h2>
          </div>
        ) : (
          <>
            <CampaignList 
              campaigns={campaigns} 
              contract={contract}
              account={account}
              refreshCampaigns={refreshCampaigns}
            />
            
            {isCreateModalOpen && (
              <CreateCampaign 
                contract={contract}
                onClose={toggleCreateModal}
                refreshCampaigns={refreshCampaigns}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;