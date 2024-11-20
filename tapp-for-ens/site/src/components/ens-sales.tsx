'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search, Share2, Wallet } from 'lucide-react'
import { useState } from 'react'

export function EnsSales() {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-blue-600 mb-4">
            Sell Your ENS Domain
          </h1>
          <p className="text-xl text-gray-700">
            Easily sell your ENS domain or subdomain in the web3 marketplace
          </p>
        </div>

        <Card className="mb-8 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle className="text-2xl">How to Use</CardTitle>
            <CardDescription className="text-blue-100">
              Follow these steps to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">
                    1. Buy ENS domain or create subdomain
                  </h3>
                  <p
                    className="text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: `Visit the <a href="https://app.ens.domains/" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-700 inline-flex items-center">ENS website<svg class="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a> to purchase a domain or create a subdomain`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">
                    2. List on OpenSea
                  </h3>
                  <p
                    className="text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: `Visit <a href="https://opensea.io/" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-700 inline-flex items-center">OpenSea<svg class="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>, list your ENS domain NFT, and set a price`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">
                    3. Connect wallet
                  </h3>
                  <p className="text-gray-600">
                    After connecting your wallet, your listed domain NFTs will
                    appear here
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Share2 className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">
                    4. Share
                  </h3>
                  <p className="text-gray-600">
                    Click the button to share your ENS domain
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardTitle className="text-2xl">Your ENS Domains</CardTitle>
            <CardDescription className="text-blue-100">
              {isConnected
                ? 'Here are your domains for sale'
                : 'Please connect your wallet to view your domains'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {!isConnected ? (
              <div className="text-center py-12">
                <Button
                  onClick={() => setIsConnected(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <Input
                    placeholder="Search your domains"
                    className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-gray-300 focus:border-blue-500 transition-colors duration-300"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <div className="text-center text-gray-500 py-8 animate-pulse">
                  Your domains will appear here after connecting your wallet
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
