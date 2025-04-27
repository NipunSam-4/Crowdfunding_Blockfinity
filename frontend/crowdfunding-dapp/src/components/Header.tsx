import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import '../styles.css';

interface HeaderProps {
  account: string;
  openCreateModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ account, openCreateModal }) => {
  const [balance, setBalance] = useState<string>('');

  useEffect(() => {
    const getBalance = async () => {
      if (account && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balanceWei = await provider.getBalance(account);
          setBalance(ethers.formatEther(balanceWei).substring(0, 6));
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };

    getBalance();
  }, [account]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      alert('Please install MetaMask to use this application');
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <h1>Crowd<span>Fund</span></h1>
      </div>
      
      <div className="header-actions">
        {account ? (
          <>
            <button className="create-btn" onClick={openCreateModal}>
              Create Campaign
            </button>
            <div className="account-info">
              <span className="balance">{balance} ETH</span>
              <span className="account-address">
                {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
              </span>
            </div>
          </>
        ) : (
          <button className="connect-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;