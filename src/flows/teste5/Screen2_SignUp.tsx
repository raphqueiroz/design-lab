/**
 * @screen Sign Up
 * @description Account creation form with name, email, password and terms acceptance
 */
import { useState } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Header from '../../library/navigation/Header'
import Button from '../../library/inputs/Button'
import TextInput from '../../library/inputs/TextInput'
import Checkbox from '../../library/inputs/Checkbox'
import Text from '../../library/foundations/Text'
import Stack from '../../library/layout/Stack'
import Link from '../../library/foundations/Link'

export default function Screen2_SignUp({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const [name, setName] = useState('Maria Silva')
  const [email, setEmail] = useState('maria@email.com')
  const [password, setPassword] = useState('••••••••')
  const [termsAccepted, setTermsAccepted] = useState(false)

  return (
    <BaseLayout>
      <Header title="Criar conta" onBack={onBack} />

      <Stack gap="default">
        <TextInput
          label="Nome completo"
          placeholder="Seu nome"
          value={name}
          onChange={setName}
        />
        <TextInput
          label="E-mail"
          placeholder="seu@email.com"
          value={email}
          onChange={setEmail}
        />
        <TextInput
          label="Senha"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={setPassword}
        />

        <Stack direction="row" gap="sm" align="start">
          <Checkbox checked={termsAccepted} onChange={setTermsAccepted} />
          <Text variant="body-sm" color="content-secondary">
            Li e aceito os{' '}
            <Link
              linkText="Termos de Uso"
              size="xs"
              onLinkPress={() => onElementTap?.('Link: Termos de Uso')}
            />{' '}
            e a{' '}
            <Link
              linkText="Política de Privacidade"
              size="xs"
              onLinkPress={() => onElementTap?.('Link: Política de Privacidade')}
            />
          </Text>
        </Stack>
      </Stack>

      <StickyFooter>
        <Button
          variant="primary"
          fullWidth
          disabled={!termsAccepted}
          onPress={() => {
            const handled = onElementTap?.('Button: Criar conta')
            if (!handled) onNext()
          }}
        >
          Criar conta
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
