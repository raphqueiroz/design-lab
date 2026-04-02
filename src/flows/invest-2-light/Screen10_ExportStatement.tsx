/**
 * Export Statement — form to configure PDF export parameters.
 * Date range, reference currency, language.
 * Button shows loading for 10s then success toast.
 */
import { useState, useCallback } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Header from '@/library/navigation/Header'
import Button from '@/library/inputs/Button'
import TextInput from '@/library/inputs/TextInput'
import Select from '@/library/inputs/Select'
import Stack from '@/library/layout/Stack'
import Toast from '@/library/feedback/Toast'

const CURRENCY_OPTIONS = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
]

const LANGUAGE_OPTIONS = [
  { label: 'Português (Brasil)', value: 'pt-BR' },
  { label: 'English', value: 'en' },
]

export default function Screen10_ExportStatement({ onBack, onElementTap }: FlowScreenProps) {
  const [loading, setLoading] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  const handleExport = useCallback(() => {
    onElementTap?.('Button: Gerar extrato')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 4000)
    }, 10000)
  }, [onElementTap])

  return (
    <BaseLayout>
      <Header
        title="Exportar extrato de transações"
        description="Gere um relatório em PDF com o detalhamento de todas as suas transações no período selecionado."
        onBack={onBack}
      />

      <Stack gap="default">
        <TextInput label="Data de início" placeholder="DD/MM/YYYY" value="01/01/2026" />
        <TextInput label="Data final" placeholder="DD/MM/YYYY" value="30/03/2026" />
        <Select label="Moeda de referência" options={CURRENCY_OPTIONS} value="BRL" />
        <Select label="Idioma" options={LANGUAGE_OPTIONS} value="pt-BR" />
      </Stack>

      <StickyFooter>
        <Button variant="accent" size="lg" fullWidth loading={loading} onPress={handleExport}>
          Gerar extrato
        </Button>
      </StickyFooter>

      <Toast
        variant="success"
        message="Extrato gerado com sucesso! Verifique seu e-mail."
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </BaseLayout>
  )
}
