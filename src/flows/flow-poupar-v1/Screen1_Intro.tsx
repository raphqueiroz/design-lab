import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import FeatureLayout from '@/library/layout/FeatureLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Button from '@/library/inputs/Button'
import Text from '@/library/foundations/Text'
import Badge from '@/library/display/Badge'
import Summary from '@/library/display/Summary'
import GroupHeader from '@/library/navigation/GroupHeader'
import { RiExchangeDollarLine, RiTimeLine, RiShieldCheckLine, RiFlashlightFill } from '@remixicon/react'
import savingsPiggy from '@/assets/images/savings-piggy-3d.jpg'

export default function Screen1_Intro({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const handleSaibaMais = () => {
    const handled = onElementTap?.('Link: Saiba mais')
    if (!handled) onNext()
  }

  return (
    <FeatureLayout
      imageSrc={savingsPiggy}
      imageAlt="Piggy bank savings"
      imageOverlay={<Badge variant="lime" size="md" icon={<RiFlashlightFill size={16} />}>Novidade</Badge>}
      onClose={() => {
        const handled = onElementTap?.('IconButton: Fechar')
        if (!handled) onBack?.()
      }}
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <Text variant="display">Caixinha que faz seu dinheiro render</Text>
          <Text variant="body-md" color="content-secondary">
            Guarde qualquer valor e veja ele crescer todo dia. Seu dinheiro rende automaticamente — e você resgata quando quiser, sem taxas e sem burocracia.
          </Text>
        </Stack>

        <Stack gap="none">
          <GroupHeader text="Como funciona" />
          <Summary
            data={[
              { icon: <RiExchangeDollarLine size={20} />, title: 'Rendimento automático', description: 'Seu saldo rende todos os dias, sem precisar fazer nada' },
              { icon: <RiTimeLine size={20} />, title: 'Resgate quando quiser', description: 'Sem carência — retire seus fundos a qualquer momento' },
              { icon: <RiShieldCheckLine size={20} />, title: 'Protegido por seguro', description: 'Se uma falha técnica afetar seu saldo, você é reembolsado automaticamente', linkText: 'Saiba mais', onLinkPress: handleSaibaMais },
            ]}
          />
        </Stack>
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Ativar minha Caixinha')
          if (!handled) onNext()
        }}>
          Ativar minha Caixinha
        </Button>
      </StickyFooter>
    </FeatureLayout>
  )
}
