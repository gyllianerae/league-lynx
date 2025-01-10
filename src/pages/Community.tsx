import React, { useState } from 'react';

interface LeagueOpening {
  commissionerInfo: {
    leagueLynxUsername: string;
    sleeperUsername: string;
    email: string;
  };
  teamInfo: {
    teamName: string;
    keyPlayers: string;
    teamNumber?: number;
  };
  leagueInfo: {
    leagueName: string;
    leagueId: string;
    leagueFee: number;
    leagueType: 'Dynasty' | 'Keeper' | 'C2C' | 'Redraft';
    platform: string;
  };
  comments: string;
}

export default function Community() {
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-forest-light/30 border-mint/10 border rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">League Openings</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setIsCommissioner(!isCommissioner)}
              className="text-sm text-gray-300 hover:text-gray-500"
            >
              Switch to {isCommissioner ? 'User' : 'Commissioner'} View
            </button>
            {isCommissioner && (
              <button
                onClick={() => setShowPostForm(!showPostForm)}
                className="bg-mint text-forest-light text-sm px-4 py-2 rounded-md hover:bg-mint/80"
              >
                Post New Opening
              </button>
            )}
          </div>
        </div>

        {showPostForm && (
          <div className="mb-8 p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Post League Opening</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white">LeagueLynx Username</label>
                  <input type="text" className="mt-1 py-2 block w-full rounded-md bg-forest-light/30 border border-mint/10 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white">Sleeper Username</label>
                  <input type="text" className="mt-1 py-2 block w-full rounded-md bg-forest-light/30 border border-mint/10 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white">Team Name</label>
                  <input type="text" className="mt-1 py-2 block w-full rounded-md bg-forest-light/30 border border-mint/10 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white">Key Players</label>
                  <input type="text" className="mt-1 py-2 block w-full rounded-md bg-forest-light/30 border border-mint/10 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white">Comments</label>
                <textarea className="mt-1 py-2 block w-full rounded-md bg-forest-light/30 border border-mint/10 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" rows={3}></textarea>
              </div>
              <button type="submit" className="bg-mint text-forest-light px-6 py-2 rounded-md hover:bg-mint/80">
                Post Opening
              </button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search leagues..."
              className="flex-1 rounded-md bg-forest-light/30 py-1 px-2 border-mint/10 border shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <select className="rounded-md border-gray-300 shadow-sm bg-forest-light/30 border border-mint/10 text-sm p-2 focus:border-blue-500 focus:ring-blue-500">
              <option value="">All League Types</option>
              <option value="Dynasty">Dynasty</option>
              <option value="Keeper">Keeper</option>
              <option value="C2C">C2C</option>
              <option value="Redraft">Redraft</option>
            </select>
          </div>

          {/* Example League Opening Card */}
          <div className="border border-mint/10 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Fantasy Champions League</h3>
                <p className="text-sm text-gray-600">Dynasty League • Sleeper</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Open</span>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">Team #4 • Key Players: Justin Jefferson, Trevor Lawrence</p>
              <p className="text-sm text-gray-500 mt-1">League Fee: $50</p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Posted by: FantasyPro123
              </div>
              <button className="text-gray-300 hover:text-gray-500 text-sm font-medium">
                Request to Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">League Mates on LeagueLynx</h2>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Generate invite link..."
              className="flex-1 rounded-md border bg-forest-light/30 py-1 px-2 border-mint/10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button className="bg-mint text-forest-light text-sm px-4 py-2 rounded-md hover:bg-mint/80">
              Generate Link
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Example League Mate Card */}
            <div className="border border-mint/10 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-500">@johndoe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}