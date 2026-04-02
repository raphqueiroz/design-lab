import { useState } from 'react'
import { RiArrowLeftSLine, RiFileCopyLine, RiPercentLine, RiTimeLine, RiCalendarEventLine, RiUserSmileLine, RiGroupLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import BottomSheet from '../../library/layout/BottomSheet'
import Button from '../../library/inputs/Button'
import IconButton from '../../library/inputs/IconButton'
import ListItem from '../../library/display/ListItem'
import DataList from '../../library/display/DataList'
import GroupHeader from '../../library/navigation/GroupHeader'
import Summary from '../../library/display/Summary'
import Text from '../../library/foundations/Text'
import Toast from '../../library/feedback/Toast'

const ACCOUNT_DATA = [
  { label: 'Tipo de Transferência', value: 'ACH ou Wire' },
  { label: 'Titular', value: 'André de Souza Thiessen', copyable: true },
  { label: 'Banco', value: 'Lead Bank', copyable: true },
  { label: 'Routing Number', value: '0260734582', copyable: true },
  { label: 'Número da conta', value: '101019644', copyable: true },
  { label: 'Tipo de conta', value: 'Conta Corrente' },
  { label: 'Endereço do Banco', value: '1801 Main St, MO, Kansas City 64108', copyable: true },
]

export default function Screen1_AccountData({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const [limitsOpen, setLimitsOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  const handleShare = () => {
    setShareOpen(true)
    if (onElementTap) {
      onElementTap('Button: Compartilhar')
    }
  }

  return (
    <BaseLayout>
      <Stack gap="sm">
        <IconButton
          variant="base"
          icon={<RiArrowLeftSLine size={24} className="text-content-primary" />}
          onPress={onBack}
        />
      </Stack>

      <Stack gap="sm">
        <Text variant="heading-lg">Receba dólares</Text>
        <Text variant="body-md" color="content-secondary">
          Use os dados abaixo para receber dólar de qualquer banco
        </Text>
      </Stack>

      <ListItem
        title="Prazos, limites e taxas"
        left={
          <IconButton
            variant="base"
            icon={<RiPercentLine size={24} className="text-content-primary" />}
          />
        }
        onPress={() => setLimitsOpen(true)}
      />

      <DataList data={ACCOUNT_DATA} />

      <StickyFooter>
        <Stack gap="sm">
          <Button fullWidth onPress={handleShare}>
            Compartilhar
          </Button>
          <Button fullWidth variant="primary" onPress={onNext}>
            Pronto
          </Button>
        </Stack>
      </StickyFooter>

      {/* Limits & Fees BottomSheet */}
      <BottomSheet
        open={limitsOpen}
        onClose={() => setLimitsOpen(false)}
        title=""
      >
        <Stack gap="default">
          <Summary
            header="Taxas"
            data={[
              {
                icon: <RiPercentLine size={24} className="text-content-primary" />,
                title: 'Taxa Zero',
                description: 'Você não paga nada ao receber',
              },
            ]}
          />
          <Summary
            header="Prazo estimado"
            data={[
              {
                icon: <RiTimeLine size={24} className="text-content-primary" />,
                title: 'Até 3 dias úteis',
                description: 'Pode variar de acordo com o banco',
              },
            ]}
          />
          <Stack gap="none">
            <GroupHeader text="Seus limites" />
            <Summary
              data={[
                {
                  icon: <RiCalendarEventLine size={24} className="text-content-primary" />,
                  title: 'US$ 20.000',
                  description: 'Limite mensal total',
                },
                {
                  icon: <RiUserSmileLine size={24} className="text-content-primary" />,
                  title: 'US$10.000 por transação',
                  description: 'entre contas em seu nome',
                },
                {
                  icon: <RiGroupLine size={24} className="text-content-primary" />,
                  title: 'US$5.000 por transação',
                  description: 'de ou para contas de terceiros',
                },
              ]}
            />
          </Stack>
        </Stack>
      </BottomSheet>

      {/* iOS Share Sheet simulation */}
      <BottomSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title=""
      >
        <Stack gap="default">
          <ListItem
            title="itau_extrato_102025"
            subtitle="Documento PDF · 174 KB"
            left={
              <IconButton
                variant="base"
                icon={<RiFileCopyLine size={24} className="text-content-primary" />}
              />
            }
            trailing={null}
          />
          <Stack gap="sm">
            <Text variant="caption" color="content-tertiary">Compartilhar via</Text>
            <Stack gap="sm">
              <ListItem
                title="Copiar"
                left={
                  <IconButton
                    variant="base"
                    icon={<RiFileCopyLine size={20} className="text-content-primary" />}
                  />
                }
                onPress={() => {
                  setShareOpen(false)
                  setToastVisible(true)
                  setTimeout(() => setToastVisible(false), 2500)
                }}
                trailing={null}
              />
              <ListItem
                title="Salvar em Arquivos"
                left={
                  <IconButton
                    variant="base"
                    icon={<RiFileCopyLine size={20} className="text-content-primary" />}
                  />
                }
                onPress={() => setShareOpen(false)}
                trailing={null}
              />
            </Stack>
          </Stack>
        </Stack>
      </BottomSheet>

      <Toast message="Dados copiados" visible={toastVisible} />
    </BaseLayout>
  )
}
