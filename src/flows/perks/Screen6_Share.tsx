import { Share2, Copy, MessageCircle, Instagram, Mail, Link } from 'lucide-react'
import { useState } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import Header from '../../library/navigation/Header'
import ScreenLayout from '../../library/layout/ScreenLayout'
import Text from '../../library/foundations/Text'
import Spacer from '../../library/foundations/Spacer'
import Card from '../../library/display/Card'
import Badge from '../../library/display/Badge'
import Toast from '../../library/feedback/Toast'
import Amount from '../../library/display/Amount'

const shareChannels = [
  { icon: <MessageCircle size={22} />, label: 'WhatsApp', color: '#25D366' },
  { icon: <Instagram size={22} />, label: 'Instagram', color: '#E1306C' },
  { icon: <Mail size={22} />, label: 'E-mail', color: '#4A90D9' },
  { icon: <Link size={22} />, label: 'Copiar link', color: 'var(--token-text-secondary)' },
]

export default function Screen6_Share({ onBack }: FlowScreenProps) {
  const [showToast, setShowToast] = useState(false)

  const handleShare = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <ScreenLayout header={<Header title="Compartilhar" onBack={onBack} />}>
      <div className="px-[var(--token-spacing-md)] py-[var(--token-spacing-lg)]">
        {/* Savings card */}
        <Card variant="outlined" className="text-center">
          <div className="flex items-center justify-center gap-[var(--token-spacing-2)] mb-[var(--token-spacing-3)]">
            <Share2 size={20} className="text-interactive-foreground" />
            <Badge variant="success" size="md">Economia</Badge>
          </div>
          <Amount value={1250} size="display" />
          <Text variant="body-sm" color="text-secondary" className="mt-[var(--token-spacing-2)]">
            de economia
          </Text>
          <Spacer size="sm" />
          <Text variant="caption" color="text-tertiary">
            Comparado com a média do mercado financeiro
          </Text>
        </Card>

        <Spacer size="xl" />

        {/* Share options */}
        <Text variant="heading-sm">Compartilhar via</Text>
        <Spacer size="md" />

        <div className="grid grid-cols-4 gap-[var(--token-spacing-md)]">
          {shareChannels.map((ch) => (
            <button
              key={ch.label}
              type="button"
              onClick={handleShare}
              className="flex flex-col items-center gap-[var(--token-spacing-2)] cursor-pointer"
            >
              <div
                className="w-[48px] h-[48px] rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${ch.color}20`, color: ch.color }}
              >
                {ch.icon}
              </div>
              <Text variant="caption">{ch.label}</Text>
            </button>
          ))}
        </div>

        <Spacer size="xl" />

        {/* Referral code */}
        <Card variant="flat">
          <div className="flex items-center justify-between">
            <div>
              <Text variant="body-sm" color="text-secondary">Seu código de indicação</Text>
              <Text variant="body-md" className="font-mono mt-[var(--token-spacing-1)]">
                PICNIC-AB12
              </Text>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="w-[40px] h-[40px] flex items-center justify-center rounded-[var(--token-radius-md)] bg-surface-secondary cursor-pointer"
            >
              <Copy size={18} className="text-interactive-foreground" />
            </button>
          </div>
        </Card>

        <Spacer size="md" />
        <Text variant="caption" color="text-tertiary" align="center">
          Ganhe $5 a cada amigo que se cadastrar com seu código.
        </Text>
      </div>

      <div className="fixed top-[var(--token-spacing-lg)] left-1/2 -translate-x-1/2 z-50">
        <Toast variant="success" message="Link copiado!" visible={showToast} />
      </div>
    </ScreenLayout>
  )
}
