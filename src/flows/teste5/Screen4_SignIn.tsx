/**
 * @screen Sign In
 * @description Login screen with email and password fields
 */
import { useState } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Header from '../../library/navigation/Header'
import Button from '../../library/inputs/Button'
import TextInput from '../../library/inputs/TextInput'
import Text from '../../library/foundations/Text'
import Link from '../../library/foundations/Link'
import Stack from '../../library/layout/Stack'

export default function Screen4_SignIn({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const [email, setEmail] = useState('maria@email.com')
  const [password, setPassword] = useState('••••••••')

  return (
    <BaseLayout>
      <Header title="Entrar" onBack={onBack} />

      <Stack gap="default">
        <TextInput
          label="E-mail"
          placeholder="seu@email.com"
          value={email}
          onChange={setEmail}
        />
        <TextInput
          label="Senha"
          placeholder="Sua senha"
          value={password}
          onChange={setPassword}
        />

        <Link
          linkText="Esqueci minha senha"
          size="xs"
          onLinkPress={() => onElementTap?.('Link: Esqueci minha senha')}
        />
      </Stack>

      <StickyFooter>
        <Stack gap="sm">
          <Button
            variant="accent"
            fullWidth
            onPress={() => {
              const handled = onElementTap?.('Button: Entrar')
              if (!handled) onNext()
            }}
          >
            Entrar
          </Button>
          <Text variant="body-sm" color="content-secondary" align="center">
            Não tem conta?{' '}
            <Link
              linkText="Criar conta"
              size="xs"
              onLinkPress={() => {
                const handled = onElementTap?.('Link: Criar conta')
                if (!handled) onNext()
              }}
            />
          </Text>
        </Stack>
      </StickyFooter>
    </BaseLayout>
  )
}
