/**
 * Select Chain — list of available networks with web3icons SVG logos.
 */
import type { ReactNode } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import {
  NetworkEthereum, NetworkSolana, NetworkBase, NetworkPolygon,
  NetworkArbitrumOne, NetworkOptimism, NetworkAvalanche,
} from '@web3icons/react'
import BaseLayout from '@/library/layout/BaseLayout'
import Header from '@/library/navigation/Header'
import ListItem from '@/library/display/ListItem'
import { getAsset } from '../shared/data'
import type { AssetTicker } from '../shared/data'

interface Chain {
  id: string
  name: string
  icon: ReactNode
}

const CHAINS: Chain[] = [
  { id: 'ethereum', name: 'Ethereum', icon: <NetworkEthereum size={40} variant="branded" /> },
  { id: 'solana', name: 'Solana', icon: <NetworkSolana size={40} variant="branded" /> },
  { id: 'base', name: 'Base', icon: <NetworkBase size={40} variant="branded" /> },
  { id: 'polygon', name: 'Polygon', icon: <NetworkPolygon size={40} variant="branded" /> },
  { id: 'arbitrum', name: 'Arbitrum', icon: <NetworkArbitrumOne size={40} variant="branded" /> },
  { id: 'optimism', name: 'Optimism', icon: <NetworkOptimism size={40} variant="branded" /> },
  { id: 'avalanche', name: 'Avalanche', icon: <NetworkAvalanche size={40} variant="branded" /> },
]

export default function Screen3_SelectChain({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { assetTicker = 'BTC' } = useScreenData<{ assetTicker?: AssetTicker }>()
  const asset = getAsset(assetTicker)

  const handleSelect = (name: string) => {
    const handled = onElementTap?.(`ListItem: ${name}`)
    if (!handled) onNext()
  }

  return (
    <BaseLayout>
      <Header title="Selecione uma rede" description={`Selecione uma rede para enviar ${asset.name}.`} onBack={onBack} />
      <div>
        {CHAINS.map(chain => (
          <ListItem
            key={chain.id}
            title={chain.name}
            left={<div className="flex-shrink-0">{chain.icon}</div>}
            onPress={() => handleSelect(chain.name)}
          />
        ))}
      </div>
    </BaseLayout>
  )
}
