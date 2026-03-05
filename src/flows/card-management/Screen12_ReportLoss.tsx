import { RiAlarmWarningLine, RiShieldLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import Banner from '../../library/display/Banner'
import ListItem from '../../library/display/ListItem'
import Avatar from '../../library/display/Avatar'
import Text from '../../library/foundations/Text'

export default function Screen12_ReportLoss({ onBack, onNext, onElementTap }: FlowScreenProps) {
  const handleOption = (label: string) => {
    const handled = onElementTap?.(`ListItem: ${label}`)
    if (!handled) onNext()
  }

  return (
    <BaseLayout>
      <Header title="Reportar perda ou roubo" onBack={onBack} />

      <Stack>
        <Text variant="body-md" color="content-secondary">
          Seu cartão físico final 4521 será cancelado e enviaremos um novo para seu endereço.
          Você poderá movimentar o seu saldo normalmente e continuar usando cartões virtuais.
        </Text>
      </Stack>

      <Banner
        variant="warning"
        title="O cartão será desativado imediatamente"
        description="Não será possível reverter esta ação. Um novo cartão será enviado automaticamente."
      />

      <Stack gap="none">
        <ListItem
          title="Perdi meu cartão"
          subtitle="Não consigo encontrar meu cartão físico"
          left={<Avatar icon={<RiAlarmWarningLine size={20} />} size="md" />}
          onPress={() => handleOption('Perdi meu cartão')}
        />
        <ListItem
          title="Meu cartão foi roubado"
          subtitle="Meu cartão foi levado por outra pessoa"
          left={<Avatar icon={<RiShieldLine size={20} />} size="md" />}
          onPress={() => handleOption('Meu cartão foi roubado')}
        />
      </Stack>
    </BaseLayout>
  )
}
