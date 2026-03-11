import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import BaseLayout from '@/library/layout/BaseLayout'
import Stack from '@/library/layout/Stack'
import Header from '@/library/navigation/Header'
import Button from '@/library/inputs/Button'
import Banner from '@/library/display/Banner'
import Summary from '@/library/display/Summary'
import GroupHeader from '@/library/navigation/GroupHeader'
import DataList from '@/library/display/DataList'
import { RiCodeLine, RiLineChartLine, RiShieldCheckLine, RiGovernmentLine } from '@remixicon/react'

export default function Screen2_InsuranceAbout({ onBack }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header title="Sobre o seguro" onBack={onBack} />

      <Stack gap="lg">
        <Banner
          variant="neutral"
          title="Proteção para seu rendimento"
          description="Seu saldo é protegido por um seguro automático que cobre riscos operacionais dos smart contracts. Você não precisa contratar nada — a proteção já está inclusa."
        />

        <Stack gap="none">
          <GroupHeader text="O que está coberto" />
          <Summary
            data={[
              { icon: <RiCodeLine size={20} />, title: 'Bugs em smart contracts', description: 'Falhas no código que resultem em uso não intencional e perda de fundos' },
              { icon: <RiLineChartLine size={20} />, title: 'Falha e manipulação de oráculos', description: 'Dados de preço incorretos ou deliberadamente corrompidos usados pelos contratos' },
              { icon: <RiShieldCheckLine size={20} />, title: 'Falha de liquidação', description: 'Problemas na liquidação de garantias que gerem dívida socializada entre os usuários' },
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

        <Button variant="ghost" fullWidth onPress={() => onBack?.()}>
          Consultar a apólice de seguro
        </Button>
      </Stack>
    </BaseLayout>
  )
}
