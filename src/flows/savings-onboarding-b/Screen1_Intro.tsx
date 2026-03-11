import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import FeatureLayout from '@/library/layout/FeatureLayout'
import Stack from '@/library/layout/Stack'
import Button from '@/library/inputs/Button'
import Text from '@/library/foundations/Text'
import Badge from '@/library/display/Badge'
import Summary from '@/library/display/Summary'
import GroupHeader from '@/library/navigation/GroupHeader'
import Link from '@/library/foundations/Link'
import { RiExchangeDollarLine, RiTimeLine, RiShieldCheckLine } from '@remixicon/react'

export default function Screen1_Intro({ onNext, onElementTap }: FlowScreenProps) {
  return (
    <FeatureLayout
      imageSrc="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80"
      imageAlt="Growing savings"
      imageOverlay={<Badge variant="lime" size="md">5% a.a.</Badge>}
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
              { icon: <RiShieldCheckLine size={20} />, title: 'Protegido por seguro', description: (
                <Stack gap="sm">
                  <Text variant="body-sm" color="content-secondary">
                    Se uma falha técnica afetar seu saldo, você é reembolsado automaticamente
                  </Text>
                  <Link
                    linkText="Saiba mais"
                    size="xs"
                    onLinkPress={() => {
                      const handled = onElementTap?.('Link: Saiba mais')
                      if (!handled) onNext()
                    }}
                  />
                </Stack>
              ) },
            ]}
          />
        </Stack>

        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Ativar rendimento')
          if (!handled) onNext()
        }}>
          Ativar rendimento
        </Button>
      </Stack>
    </FeatureLayout>
  )
}
