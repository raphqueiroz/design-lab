import { useState, useEffect, useRef, useMemo } from 'react'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import Header from '../../../library/navigation/Header'
import BaseLayout from '../../../library/layout/BaseLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Stack from '../../../library/layout/Stack'
import BottomSheet from '../../../library/layout/BottomSheet'
import Button from '../../../library/inputs/Button'
import CurrencyInput from '../../../library/inputs/CurrencyInput'
import Divider from '../../../library/foundations/Divider'
import ListItem from '../../../library/display/ListItem'
import Avatar from '../../../library/display/Avatar'
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import SearchBar from '../../../library/inputs/SearchBar'
import { DataListSkeleton, BannerSkeleton } from '../../../library/feedback/Skeleton'
import {
  MOCK_RATE,
  USD_ICON,
  BRL_ICON,
  DESTINATIONS,
  SAVED_RECIPIENTS,
  rawDigitsFromAmount,
} from '../shared/data'
import type { Recipient } from '../shared/data'

type CalcState = 'idle' | 'loading' | 'ready'

export default function C_Screen1_Withdraw({ onNext, onBack }: FlowScreenProps) {
  const [usdValue, setUsdValue] = useState('')
  const [destSheetOpen, setDestSheetOpen] = useState(false)
  const [recipientSheetOpen, setRecipientSheetOpen] = useState(false)
  const [selectedDest, setSelectedDest] = useState<string | null>(null)
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [recipientSearch, setRecipientSearch] = useState('')
  const [calcState, setCalcState] = useState<CalcState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const usdAmount = parseInt(usdValue || '0', 10) / 100
  const isValid = usdAmount >= 1
  const brlDisplay = rawDigitsFromAmount(usdAmount * MOCK_RATE)

  const currentDest = useMemo(
    () => DESTINATIONS.find((d) => d.id === selectedDest) ?? null,
    [selectedDest],
  )

  const filteredRecipients = SAVED_RECIPIENTS.filter(
    (r) =>
      r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      r.detail.toLowerCase().includes(recipientSearch.toLowerCase()),
  )

  const allFieldsSet = isValid && selectedDest && selectedRecipient

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (isValid) {
      setCalcState('loading')
      timerRef.current = setTimeout(() => setCalcState('ready'), 1200)
    } else {
      setCalcState('idle')
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isValid, usdValue])

  return (
    <BaseLayout>
      <Header title="" onClose={onBack} />

      <ListItem
        title="Destino"
        subtitle={currentDest ? currentDest.title : 'Selecionar destino'}
        left={
          currentDest ? (
            currentDest.icon.startsWith('http') ? (
              <Avatar src={currentDest.icon} size="md" />
            ) : (
              <Avatar initials={currentDest.icon} size="md" />
            )
          ) : undefined
        }
        onPress={() => setDestSheetOpen(true)}
      />

      <ListItem
        title="Destinatário"
        subtitle={selectedRecipient ? selectedRecipient.name : 'Selecionar destinatário'}
        left={
          selectedRecipient ? (
            <Avatar initials={selectedRecipient.name.charAt(0)} size="md" />
          ) : undefined
        }
        onPress={() => setRecipientSheetOpen(true)}
      />

      <CurrencyInput
        label="Você envia"
        value={usdValue}
        onChange={setUsdValue}
        tokenIcon={USD_ICON}
        currencySymbol="US$"
      />

      <Divider />

      <CurrencyInput
        label="Destinatário recebe"
        value={brlDisplay}
        onChange={() => {}}
        tokenIcon={BRL_ICON}
        currencySymbol="R$"
        readOnly
      />

      {calcState === 'loading' && (
        <Stack gap="none">
          <DataListSkeleton rows={3} />
          <BannerSkeleton />
        </Stack>
      )}

      {calcState === 'ready' && (
        <Stack gap="none">
          <DataList
            data={[
              { label: 'Câmbio', value: `US$ 1 ⇄ R$ ${MOCK_RATE.toFixed(4).replace('.', ',')}` },
              { label: 'Taxa de saque', value: 'Grátis' },
              { label: 'Prazo estimado', value: '1-2 dias úteis' },
            ]}
          />

          <Banner variant="neutral" title="Prazo estimado: 1-2 dias úteis" />
        </Stack>
      )}

      <StickyFooter>
        <Button
          fullWidth
          disabled={!allFieldsSet || calcState !== 'ready'}
          onPress={onNext}
        >
          Confirmar saque
        </Button>
      </StickyFooter>

      <BottomSheet
        open={destSheetOpen}
        onClose={() => setDestSheetOpen(false)}
        title="Para onde deseja sacar?"
      >
        <Stack gap="none">
          {DESTINATIONS.map((dest) => (
            <ListItem
              key={dest.id}
              title={dest.title}
              subtitle={dest.subtitle}
              left={
                dest.icon.startsWith('http') ? (
                  <Avatar src={dest.icon} size="md" />
                ) : (
                  <Avatar initials={dest.icon} size="md" />
                )
              }
              onPress={() => {
                setSelectedDest(dest.id)
                setDestSheetOpen(false)
              }}
            />
          ))}
        </Stack>
      </BottomSheet>

      <BottomSheet
        open={recipientSheetOpen}
        onClose={() => setRecipientSheetOpen(false)}
        title="Escolher destinatário"
      >
        <Stack gap="default">
          <SearchBar
            placeholder="Buscar destinatário..."
            value={recipientSearch}
            onChange={(e) => setRecipientSearch(e.target.value)}
          />
          <Stack gap="none">
            {filteredRecipients.map((recipient) => (
              <ListItem
                key={recipient.id}
                title={recipient.name}
                subtitle={recipient.detail}
                left={<Avatar initials={recipient.name.charAt(0)} size="md" />}
                onPress={() => {
                  setSelectedRecipient(recipient)
                  setRecipientSheetOpen(false)
                  setRecipientSearch('')
                }}
              />
            ))}
            <ListItem
              title="Adicionar novo destinatário"
              subtitle="Insira os dados manualmente"
              left={<Avatar initials="+" size="md" />}
              onPress={() => {
                setSelectedRecipient({
                  id: 'new',
                  name: 'Novo destinatário',
                  detail: 'Dados manuais',
                  type: 'pix',
                })
                setRecipientSheetOpen(false)
                setRecipientSearch('')
              }}
            />
          </Stack>
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
