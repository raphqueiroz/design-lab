/**
 * @screen Coverage
 * @description Nexus Mutual-style green certificate card with coverage details.
 */
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import BaseLayout from '../../../library/layout/BaseLayout'
import Stack from '../../../library/layout/Stack'
import Header from '../../../library/navigation/Header'
import InsurancePolicyCard from '../../../library/display/InsurancePolicyCard'
import Summary from '../../../library/display/Summary'
import GroupHeader from '../../../library/navigation/GroupHeader'
import DataList from '../../../library/display/DataList'
import { RiCodeLine, RiLineChartLine, RiShieldCheckLine, RiGovernmentLine } from '@remixicon/react'

export default function Screen3_InsuranceCard({ onBack }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header
        title="Certificado de cobertura"
        description="Sua caixinha já vem com seguro incluso. Sem contratação, sem custo extra."
        onBack={onBack}
      />

      <Stack gap="lg">

        <InsurancePolicyCard
          providerName="Nexus Mutual"
          coverItems={[
            { label: 'Tipo', value: 'Smart Contract Cover' },
            { label: 'Protocolo', value: 'Aave v3 + Compound' },
            { label: 'Dedutível', value: '5%' },
            { label: 'Carência', value: '14 dias' },
            { label: 'Prazo do sinistro', value: '30 dias' },
            { label: 'Custo', value: 'Incluso' },
          ]}
        />

        <Stack gap="none">
          <GroupHeader text="O que está coberto" />
          <Summary
            data={[
              { icon: <RiCodeLine size={20} />, title: 'Bugs em smart contracts', description: 'Falhas no código que resultem em uso não intencional e perda de fundos' },
              { icon: <RiLineChartLine size={20} />, title: 'Falha e manipulação de oráculos', description: 'Dados de preço incorretos ou deliberadamente corrompidos' },
              { icon: <RiShieldCheckLine size={20} />, title: 'Falha de liquidação', description: 'Problemas na liquidação de garantias que gerem dívida socializada' },
              { icon: <RiGovernmentLine size={20} />, title: 'Tomada de governança', description: 'Ataques maliciosos que forcem atualizações indevidas nos smart contracts' },
            ]}
          />
        </Stack>

        <Stack gap="none">
          <GroupHeader text="Detalhes da cobertura" />
          <DataList data={[
            { label: 'Provedor', value: 'OpenCover × Nexus Mutual' },
            { label: 'Dedutível', value: '5% do valor coberto' },
            { label: 'Carência após evento', value: '14 dias' },
            { label: 'Prazo para resgate', value: '30 dias após aprovação' },
            { label: 'Custo para você', value: 'Incluso no rendimento' },
          ]} />
        </Stack>
      </Stack>
    </BaseLayout>
  )
}
