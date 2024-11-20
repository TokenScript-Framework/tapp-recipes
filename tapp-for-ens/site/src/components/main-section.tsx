'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { detectMainnet, getChainConfig } from '@/lib/constant'
import { addressPipe, getChainName, loadListings } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useAccount, useChainId } from 'wagmi'
import openseaSVG from '../public/images/opensea.svg'
import { CountdownTimer } from './timer'

export function MainSection() {
  // const [isLoadingListings, setIsLoadingListings] = useState(false)
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { isLoading, data: userListings } = useQuery({
    queryKey: ['listings'],
    queryFn: () => loadListings(OPENSEA_API, chainId, address),
    enabled: !!address && !!chainId,
  })

  console.log('###', userListings)

  const CONTRACT_ADDRESS = getChainConfig(chainId).CONTRACT_ADDRESS
  const SCRIT_ID = getChainConfig(chainId).SCRIT_ID
  const CHAIN_ID = getChainConfig(chainId).CHAIN_ID

  const isMainnet = detectMainnet(chainId)

  const VIEWER_URL = isMainnet
    ? 'https://viewer.tokenscript.org/'
    : 'https://viewer-staging.tokenscript.org/'

  const OPENSEA_BASE = isMainnet
    ? 'https://opensea.io'
    : 'https://testnets.opensea.io'
  const OPENSEA_API = isMainnet
    ? 'https://api.opensea.io'
    : 'https://testnets-api.opensea.io'

  const handleShareOnTwitter = (orderHash: string, protocolAddress: string) => {
    if (!chainId) {
      return
    }

    const tlink = `${VIEWER_URL}?chain=${CHAIN_ID}&contract=${CONTRACT_ADDRESS}&tokenId=1&scriptId=${SCRIT_ID}#card=Buy&originId=Token&tokenId=0&orderHash=${orderHash}&protocolAddress=${protocolAddress}&targetChain=${chainId}`
    console.log(tlink)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tlink,
    )}`
    window.open(twitterUrl, '_blank')
  }

  return (
    <div className="container mx-auto">
      {isConnected ? (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white border-gray-200">
                <CardHeader className="p-0">
                  <Skeleton className="w-full h-72 rounded-t-lg" />
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {userListings && userListings.length === 0 ? (
              <p className="text-gray-700 text-lg">
                No listing data. Please access{' '}
                <a
                  href={OPENSEA_BASE}
                  target="_blank"
                  className="text-blue-500 cursor underline"
                >
                  Opensea
                </a>{' '}
                to add.
              </p>
            ) : (
              userListings?.map((nft) => {
                return (
                  <Card
                    key={nft.orderHash}
                    className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardHeader className="p-0">
                      {nft.image ? (
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-full aspect-square object-cover rounded-t-lg"
                          onError={(e) => {
                            const target = e.currentTarget
                            target.src = openseaSVG.src
                            target.classList.remove('object-cover')
                            target.classList.add('p-8', 'opacity-20')
                          }}
                        />
                      ) : (
                        <div className="relative w-full h-72 bg-gray-100 flex items-center justify-center">
                          <div className="relative w-1/2 h-1/2">
                            <Image
                              src={openseaSVG}
                              alt="logo"
                              fill
                              className="rounded-t-lg opacity-20"
                            />
                          </div>
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="p-4">
                      <CardTitle className="text-sm mb-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Image
                            src={openseaSVG}
                            alt="logo"
                            width={32}
                            height={32}
                          />
                          <a
                            href={`${OPENSEA_BASE}/assets/${getChainName(
                              chainId,
                            ).replace('_', '-')}/${nft.contract}/${
                              nft.tokenId
                            }`}
                            target="blank"
                            className="cursor hover:underline"
                          >
                            {nft.name}
                          </a>
                        </div>
                      </CardTitle>
                      <CardTitle className="text-sm mb-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">Price</div>

                        {nft.currentPrice}
                      </CardTitle>

                      <CardTitle className="text-sm mb-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          Sale ends
                        </div>

                        {(() => {
                          const now = Math.floor(Date.now() / 1000)
                          const timeUntilEnd = nft.expireTime - now

                          if (timeUntilEnd > 0 && timeUntilEnd <= 24 * 3600) {
                            return <CountdownTimer endTime={nft.expireTime} />
                          }

                          return new Date(
                            nft.expireTime * 1000,
                          ).toLocaleString()
                        })()}
                      </CardTitle>

                      <CardTitle className="text-sm mb-2 flex items-center justify-between h-[20px]">
                        {nft.taker && (
                          <>
                            <div className="flex items-center space-x-2">
                              Reserved for
                            </div>

                            {addressPipe(nft.taker.address)}
                          </>
                        )}
                      </CardTitle>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() =>
                            handleShareOnTwitter(
                              nft.orderHash,
                              nft.protocolAddress,
                            )
                          }
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 font-bold text-xl"
                          disabled={Date.now() > nft.expireTime * 1000}
                        >
                          {' '}
                          {Date.now() > nft.expireTime * 1000
                            ? 'Expired'
                            : 'Sell on Twitter'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )
      ) : null}
    </div>
  )
}
