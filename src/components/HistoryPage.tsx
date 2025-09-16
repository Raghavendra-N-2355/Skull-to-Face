import React, { useState } from 'react';
import { Calendar, Download, Eye, Trash2, Filter, Search, RotateCcw } from 'lucide-react';

interface HistoryEntry {
  id: string;
  date: Date;
  originalImage: string;
  skullCompleteness: number;
  species: string;
  confidence: number;
  characteristics: string[];
  processingTime: string;
  iterations?: Array<{
    id: string;
    prompt: string;
    timestamp: Date;
    changes: string[];
  }>;
}

export function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() => {
    // Load from localStorage and merge with mock data
    const savedHistory = JSON.parse(localStorage.getItem('reconstructionHistory') || '[]');
    const mockData: HistoryEntry[] = [
      {
        id: '1',
        date: new Date('2024-01-15'),
        originalImage: 'skull-sample-1.jpg',
        skullCompleteness: 89,
        species: 'Homo sapiens',
        confidence: 94,
        characteristics: ['Thick eyebrows', 'Olive skin tone', 'Thin face shape'],
        processingTime: '2.3s'
      },
      {
        id: '2',
        date: new Date('2024-01-14'),
        originalImage: 'skull-sample-2.jpg',
        skullCompleteness: 76,
        species: 'Homo sapiens',
        confidence: 87,
        characteristics: ['Light skin tone', 'Fuller face shape', 'Narrow nose'],
        processingTime: '3.1s'
      }
    ];
    
    return [...savedHistory.map((entry: any) => ({
      ...entry,
      date: new Date(entry.date),
      characteristics: entry.finalCharacteristics || entry.characteristics || []
    })), ...mockData];
  });


  const filteredEntries = historyEntries.filter(entry => {
    const matchesSearch = entry.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.characteristics.some(char => char.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'high-confidence' && entry.confidence >= 90) ||
                         (filterBy === 'incomplete' && entry.skullCompleteness < 80);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reconstruction History</h1>
        <p className="text-gray-600">View and manage your previous facial reconstructions</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reconstructions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Results</option>
              <option value="high-confidence">High Confidence (≥90%)</option>
              <option value="incomplete">Incomplete Skulls (&lt;80%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Grid */}
      <div className="grid gap-6">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-2xl">🦴</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{entry.originalImage}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{entry.date.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{entry.processingTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Completeness</p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-12 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          entry.skullCompleteness >= 80 ? 'bg-green-500' : 
                          entry.skullCompleteness >= 60 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${entry.skullCompleteness}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{entry.skullCompleteness}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Species</p>
                  <p className="font-semibold text-gray-900">{entry.species}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Confidence</p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-12 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          entry.confidence >= 90 ? 'bg-green-500' : 
                          entry.confidence >= 75 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${entry.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{entry.confidence}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Modifications</p>
                  <div className="flex items-center justify-center space-x-1">
                    <p className="font-semibold text-gray-900">{entry.characteristics.length}</p>
                    {entry.iterations && entry.iterations.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <RotateCcw className="w-3 h-3 text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium">{entry.iterations.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Iterations Summary */}
              {entry.iterations && entry.iterations.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Reconstruction Iterations ({entry.iterations.length})
                  </p>
                  <div className="space-y-2">
                    {entry.iterations.map((iteration, index) => (
                      <div key={iteration.id} className="text-xs text-blue-800">
                        <span className="font-medium">Iteration {index + 1}:</span> "{iteration.prompt}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {entry.characteristics.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Applied Characteristics:</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.characteristics.map((char, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
}