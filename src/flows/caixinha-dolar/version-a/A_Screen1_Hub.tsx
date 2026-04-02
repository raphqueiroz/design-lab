import { useState } from 'react'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import Header from '../../../library/navigation/Header'
import BaseLayout from '../../../library/layout/BaseLayout'
import Stack from '../../../library/layout/Stack'
import BottomSheet from '../../../library/layout/BottomSheet'
import Button from '../../../library/inputs/Button'
import CurrencyInput from '../../../library/inputs/CurrencyInput'
import ListItem from '../../../library/display/ListItem'
import Avatar from '../../../library/display/Avatar'
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import LineChart from '../../../library/display/LineChart'
import Text from '../../../library/foundations/Text'

import { BalanceHero, HubActions, NewUserPromo } from './A_Screen1_Hub.parts'
import {
  MOCK_BALANCE, YIELD_TODAY, USD_ICON,
  FUNDING_SOURCES, WITHDRAW_QUICK_PICKS, TAX_DESCRIPTION,
  generateYieldChartData, formatUsd, rawDigitsFromAmount,
} from '../shared/data'

const chartData = generateYieldChartData(30)

export default function A_Screen1_Hub({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { isNewUser } = useScreenData<{ isNewUser?: boolean }>()

  const [depositSheetOpen, setDepositSheetOpen] = useState(false)
  const [withdrawSheetOpen, setWithdrawSheetOpen] = useState(false)
  const [depositValue, setDepositValue] = useState('')
  const [selectedSource, setSelectedSource] = useState('usd-balance')
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false)

  const depositAmount = parseInt(depositValue || '0', 10) / 100
  const isDepositValid = depositAmount >= 1

  const currentSource = FUNDING_SOURCES.find((s) => s.id === selectedSource) ?? FUNDING_SOURCES[0]

  const handleDeposit = () => {
    if (isDepositValid) onNext()
  }

  const handleWithdraw = () => {
    onNext()
  }

  if (isNewUser) {
    return (
      <BaseLayout>
        <Header title="Investir" onBack={onBack} />
        <Stack gap="default">
          <NewUserPromo onActivate={() => setDepositSheetOpen(true)} />

          <DataList
            data={[
              { label: 'Rendimento anual', value: '5,00% a.a.' },
              { label: 'Depósito mínimo', value: 'US$ 1,00' },
              { label: 'Prazo mínimo', value: 'Nenhum' },
              { label: 'Resgate', value: 'Imediato' },
            ]}
          />

          <Banner
            variant="neutral"
            title="Seus fundos são protegidos"
            description="Depósitos são mantidos por nosso parceiro regulado e lastreados em títulos do Tesouro americano."
          />
        </Stack>

        {/* Deposit BottomSheet */}
        <BottomSheet open={depositSheetOpen} onClose={() => setDepositSheetOpen(false)} title="Depositar">
          <Stack gap="default">
            <CurrencyInput label="Valor" value={depositValue} onChange={setDepositValue} tokenIcon={USD_ICON} currencySymbol="US$" />

            <ListItem
              title="Fonte"
              subtitle={currentSource.title}
              left={<Avatar src={currentSource.icon} size="sm" />}
              inverted
              right={
                <Button variant="primary" size="sm" onPress={() => setSourceSheetOpen(true)}>
                  Mudar
                </Button>
              }
              trailing={null}
            />

            <Button fullWidth disabled={!isDepositValid} onPress={handleDeposit}>
              Continuar
            </Button>
          </Stack>
        </BottomSheet>

        {/* Source BottomSheet */}
        <BottomSheet open={sourceSheetOpen} onClose={() => setSourceSheetOpen(false)} title="Fonte de recursos">
          <Stack gap="none">
            {FUNDING_SOURCES.map((source) => (
              <ListItem
                key={source.id}
                title={source.title}
                subtitle={source.subtitle}
                left={<Avatar src={source.icon} size="md" />}
                onPress={() => {
                  setSelectedSource(source.id)
                  setSourceSheetOpen(false)
                }}
              />
            ))}
          </Stack>
        </BottomSheet>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <Header title="Caixinha do Dólar" onBack={onBack} />

      <Stack gap="default">
        {/* Balance hero */}
        <BalanceHero balance={MOCK_BALANCE} yieldToday={YIELD_TODAY} />

        {/* Quick actions */}
        <HubActions
          onDeposit={() => setDepositSheetOpen(true)}
          onWithdraw={() => setWithdrawSheetOpen(true)}
          onElementTap={onElementTap}
        />

        {/* Yield chart */}
        <Stack gap="sm">
          <Text variant="caption" color="content-secondary">Rendimento (últimos 30 dias)</Text>
          <LineChart data={chartData} variant="area" height={140} />
        </Stack>

        {/* How it works */}
        <DataList
          data={[
            { label: 'Rendimento anual', value: '5,00% a.a.' },
            { label: 'Rendimento diário (est.)', value: formatUsd(MOCK_BALANCE * 0.05 / 365) },
            { label: 'Rendimento mensal (est.)', value: formatUsd(MOCK_BALANCE * 0.05 / 12) },
            { label: 'Resgate', value: 'Imediato' },
          ]}
        />

        {/* Tax info */}
        <Banner
          variant="neutral"
          title="Informações fiscais"
          description={TAX_DESCRIPTION}
          collapsable
          defaultExpanded={false}
        />

        {/* Trust signal */}
        <Banner
          variant="neutral"
          title="Seus fundos são protegidos"
          description="Depósitos lastreados em títulos do Tesouro americano."
        />
      </Stack>

      {/* Deposit BottomSheet */}
      <BottomSheet open={depositSheetOpen} onClose={() => setDepositSheetOpen(false)} title="Depositar">
        <Stack gap="default">
          <CurrencyInput label="Valor" value={depositValue} onChange={setDepositValue} tokenIcon={USD_ICON} currencySymbol="US$" />

          <ListItem
            title="Fonte"
            subtitle={currentSource.title}
            left={<Avatar src={currentSource.icon} size="sm" />}
            inverted
            right={
              <Button variant="primary" size="sm" onPress={() => setSourceSheetOpen(true)}>
                Mudar
              </Button>
            }
            trailing={null}
          />

          <Button fullWidth disabled={!isDepositValid} onPress={handleDeposit}>
            Continuar
          </Button>
        </Stack>
      </BottomSheet>

      {/* Withdraw BottomSheet */}
      <BottomSheet open={withdrawSheetOpen} onClose={() => setWithdrawSheetOpen(false)} title="Resgatar">
        <Stack gap="default">
          <CurrencyInput
            label="Valor"
            value={rawDigitsFromAmount(MOCK_BALANCE)}
            onChange={() => {}}
            tokenIcon={USD_ICON}
            currencySymbol="US$"
          />

          <Stack direction="row" gap="sm">
            {WITHDRAW_QUICK_PICKS.map((pick) => (
              <Button key={pick.label} variant="primary" size="sm" onPress={() => {}}>
                {pick.label}
              </Button>
            ))}
            <Button variant="primary" size="sm" onPress={() => {}}>
              Outro
            </Button>
          </Stack>

          <Button fullWidth onPress={handleWithdraw}>
            Continuar
          </Button>
        </Stack>
      </BottomSheet>

      {/* Source BottomSheet */}
      <BottomSheet open={sourceSheetOpen} onClose={() => setSourceSheetOpen(false)} title="Fonte de recursos">
        <Stack gap="none">
          {FUNDING_SOURCES.map((source) => (
            <ListItem
              key={source.id}
              title={source.title}
              subtitle={source.subtitle}
              left={<Avatar src={source.icon} size="md" />}
              onPress={() => {
                setSelectedSource(source.id)
                setSourceSheetOpen(false)
              }}
            />
          ))}
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
