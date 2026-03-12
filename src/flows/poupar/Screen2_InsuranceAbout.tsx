import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import Banner from '../../library/display/Banner'
import Summary from '../../library/display/Summary'
import GroupHeader from '../../library/navigation/GroupHeader'
import DataList from '../../library/display/DataList'
import { RiBugLine, RiAlertLine, RiRefundLine, RiShieldCheckLine } from '@remixicon/react'

export default function Screen2_InsuranceAbout({ onBack }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header
        title="Seu dinheiro protegido"
        description="Toda caixinha já vem com seguro incluso. Sem contratação, sem custo extra. A proteção ativa no momento em que você guarda."
        onBack={onBack}
      />

      <Stack gap="lg">

        <Stack gap="none">
          <GroupHeader text="O que o seguro cobre" />
          <Summary
            data={[
              { icon: <RiBugLine size={20} />, title: 'Falha técnica no sistema', description: 'Um erro na tecnologia afeta seu saldo? Você é reembolsado.' },
              { icon: <RiAlertLine size={20} />, title: 'Dados de preço incorretos', description: 'Se uma informação errada causar perda, a cobertura entra em ação.' },
              { icon: <RiRefundLine size={20} />, title: 'Problema na liquidação', description: 'Algo trava na hora de processar? O seguro garante a devolução.' },
              { icon: <RiShieldCheckLine size={20} />, title: 'Atualização indevida', description: 'Mudança forçada que prejudique seu saldo é coberta automaticamente.' },
            ]}
          />
        </Stack>

        <Stack gap="none">
          <GroupHeader text="Detalhes" />
          <DataList data={[
            { label: 'Custo', value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span> },
            { label: 'Cobertura', value: '97% do valor investido' },
            { label: 'Prazo de análise', value: 'Até 14 dias' },
            { label: 'Reembolso após aprovação', value: 'Até 30 dias' },
          ]} />
        </Stack>

        <Banner
          variant="neutral"
          title="O que não é coberto?"
          description="Quedas normais de mercado, decisões pessoais de resgate e perdas por acesso indevido à sua conta (como phishing)."
        />
      </Stack>

    </BaseLayout>
  )
}
