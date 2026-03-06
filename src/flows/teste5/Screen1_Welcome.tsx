/**
 * @screen Welcome
 * @description Landing screen with hero image, value propositions, and auth entry points
 */
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeatureLayout from '../../library/layout/FeatureLayout'
import Stack from '../../library/layout/Stack'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'
import Summary from '../../library/display/Summary'
import GroupHeader from '../../library/navigation/GroupHeader'
import Link from '../../library/foundations/Link'
import { RiShieldCheckLine, RiFlashlightLine, RiSmartphoneLine } from '@remixicon/react'

export default function Screen1_Welcome({ onNext, onElementTap }: FlowScreenProps) {
  return (
    <FeatureLayout
      imageSrc="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&q=80"
      imageAlt="Welcome to Picnic"
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <Text variant="display">Sua vida financeira começa aqui</Text>
          <Text variant="body-md" color="content-secondary">
            Conta digital completa, sem taxas escondidas. Abra sua conta em minutos e comece a usar agora.
          </Text>
        </Stack>

        <Stack gap="none">
          <GroupHeader text="Por que escolher a Picnic" />
          <Summary
            data={[
              { icon: <RiFlashlightLine size={20} />, title: 'Abertura instantânea', description: 'Conta aberta em menos de 3 minutos, sem burocracia' },
              { icon: <RiShieldCheckLine size={20} />, title: 'Segurança total', description: 'Seus dados protegidos com criptografia de ponta' },
              { icon: <RiSmartphoneLine size={20} />, title: 'Tudo pelo app', description: 'Pix, transferências, pagamentos e investimentos na palma da mão' },
            ]}
          />
        </Stack>

        <Stack gap="sm">
          <Button fullWidth onPress={() => {
            const handled = onElementTap?.('Button: Criar conta')
            if (!handled) onNext()
          }}>
            Criar conta
          </Button>
          <Link
            linkText="Já tenho conta"
            size="base"
            onLinkPress={() => {
              const handled = onElementTap?.('Link: Já tenho conta')
              if (!handled) onNext()
            }}
          />
        </Stack>
      </Stack>
    </FeatureLayout>
  )
}
