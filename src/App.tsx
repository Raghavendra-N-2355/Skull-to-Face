import React, { useState } from 'react';
import { Header } from './components/Header';
import { ReconstructionWorkflow } from './components/ReconstructionWorkflow';
import { ChatBot } from './components/ChatBot';
import { HistoryPage } from './components/HistoryPage';

function App() {
  const [activeTab, setActiveTab] = useState('reconstruction');
  const [characteristics, setCharacteristics] = useState<Record<string, string>>({});

  const handleCharacteristicUpdate = (characteristic: string, value: string) => {
    setCharacteristics(prev => ({
      ...prev,
      [characteristic]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="pb-8">
        {activeTab === 'reconstruction' && <ReconstructionWorkflow />}
        
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-[600px]">
              <ChatBot onCharacteristicUpdate={handleCharacteristicUpdate} />
            </div>
          </div>
        )}
        
        {activeTab === 'history' && <HistoryPage />}
      </main>
    </div>
  );
}

export default App;