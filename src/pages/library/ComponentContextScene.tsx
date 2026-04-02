import { type ReactNode } from 'react'
import type { ComponentMeta } from '../../library/registry'
import { LayoutProvider } from '../../library/layout/LayoutProvider'
import ListItem from '../../library/display/ListItem'
import Text from '../../library/foundations/Text'
import Avatar from '../../library/display/Avatar'
import LoadingSpinner from '../../library/feedback/LoadingSpinner'
import { RiHomeLine, RiWalletLine, RiUserLine, RiSendPlaneLine, RiAddLine, RiInformationLine } from '@remixicon/react'

interface Props {
  meta: ComponentMeta
}

/* ─── Skeleton helpers ─── */

function Bar({ width = '100%', height = '14px' }: { width?: string; height?: string }) {
  return <div className="bg-neutral-200" style={{ width, height }} />
}

function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-[8px]">
      {Array.from({ length: count }).map((_, i) => (
        <Bar key={i} width={i === count - 1 ? '60%' : '100%'} />
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-neutral-100 p-[16px] flex flex-col gap-[8px]">
      <Bar width="40%" />
      <Bar width="100%" />
      <Bar width="70%" />
    </div>
  )
}

function SkeletonListItems({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-[12px] py-[12px] border-b border-neutral-200">
          <div className="w-[36px] h-[36px] rounded-full bg-neutral-200 shrink-0" />
          <div className="flex-1 flex flex-col gap-[4px]">
            <Bar width={i % 2 === 0 ? '50%' : '65%'} />
            <Bar width="30%" height="10px" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Scene wrapper ─── */

function SkeletonHeader() {
  return (
    <div className="flex items-center gap-[12px] py-[12px]">
      <Bar width="100px" height="20px" />
    </div>
  )
}

function Scene({ children }: { children: ReactNode }) {
  return (
    <LayoutProvider isDesktop={false}>
      <div className="bg-surface-primary min-h-full flex flex-col relative" style={{ paddingTop: 'var(--safe-area-top, 62px)', color: '#171717', '--color-content-primary': '#171717' } as React.CSSProperties}>
        <div className="flex-1 px-[var(--token-spacing-6)] pt-[var(--token-spacing-4)] pb-[48px] flex flex-col gap-[var(--token-spacing-6)]">
          <SkeletonHeader />
          {children}
        </div>
      </div>
    </LayoutProvider>
  )
}

/* ─── Per-component hero scenes ─── */

function getScene(meta: ComponentMeta): ReactNode {
  const C = meta.component
  const name = meta.name

  switch (name) {
    // ── Inputs ──
    case 'Button':
      return (
        <Scene>
          <SkeletonLines count={2} />
          <SkeletonCard />
          <div className="mt-auto pt-[16px]">
            <C variant="accent" fullWidth>Confirmar</C>
          </div>
        </Scene>
      )
    case 'TextInput':
      return (
        <Scene>
          <SkeletonLines count={1} />
          <C label="Email" placeholder="seu@email.com" />
          <C label="Nome completo" placeholder="João Silva" />
          <Bar width="100%" height="44px" />
        </Scene>
      )
    case 'CurrencyInput':
      return (
        <Scene>
          <Text variant="body-sm" color="content-secondary">Quanto você quer depositar?</Text>
          <C />
          <Bar width="100%" height="44px" />
        </Scene>
      )
    case 'PinInput':
      return (
        <Scene>
          <Text variant="body-sm" color="content-secondary">Digite o código enviado por SMS</Text>
          <div className="flex justify-center py-[16px]">
            <C />
          </div>
        </Scene>
      )
    case 'Toggle':
      return (
        <Scene>
          <ListItem title="Notificações" right={<C checked />} />
          <ListItem title="Biometria" right={<C />} />
          <ListItem title="Modo escuro" right={<C checked />} />
        </Scene>
      )
    case 'Checkbox':
      return (
        <Scene>
          <C label="Li e aceito os termos" checked />
          <C label="Receber novidades por email" />
          <Bar width="100%" height="44px" />
        </Scene>
      )
    case 'Select':
      return (
        <Scene>
          <SkeletonLines count={1} />
          <C label="País" options={[{ label: 'Brasil', value: 'br' }, { label: 'EUA', value: 'us' }]} value="br" onChange={() => {}} />
          <Bar width="100%" height="44px" />
        </Scene>
      )
    case 'SearchBar':
      return (
        <Scene>
          <C placeholder="Pesquisar..." />
          <SkeletonListItems count={3} />
        </Scene>
      )
    case 'IconButton':
      return (
        <Scene>
          <SkeletonLines count={2} />
          <div className="flex gap-[12px] justify-center py-[8px]">
            <C icon={<RiSendPlaneLine size={20} />} />
            <C icon={<RiAddLine size={20} />} />
            <C icon={<RiInformationLine size={20} />} />
          </div>
        </Scene>
      )
    case 'ShortcutButton':
      return (
        <Scene>
          <SkeletonLines count={1} />
          <div className="flex gap-[12px]">
            <C icon={<RiSendPlaneLine size={20} />} label="Enviar" />
            <C icon={<RiAddLine size={20} />} label="Depositar" />
          </div>
          <SkeletonCard />
        </Scene>
      )
    case 'Slider':
      return (
        <Scene>
          <Text variant="body-sm" color="content-secondary">Selecione o valor</Text>
          <C value={65} minimumValue={0} maximumValue={100} onValueChange={() => {}} />
          <Bar width="100%" height="44px" />
        </Scene>
      )
    case 'RadioGroup':
      return (
        <Scene>
          <C options={[{ label: 'Pix', value: 'pix' }, { label: 'Cartão', value: 'card' }, { label: 'Boleto', value: 'boleto' }]} value="pix" onChange={() => {}} />
        </Scene>
      )

    // ── Presentation / Display ──
    case 'Card':
      return (
        <Scene>
          <C variant="elevated">
            <Text variant="body-sm" color="content-secondary">Saldo disponível</Text>
            <Text variant="heading-md">US$ 2.450,00</Text>
          </C>
          <SkeletonCard />
        </Scene>
      )
    case 'ListItem':
      return (
        <Scene>
          <C title="Café Starbucks" subtitle="Hoje, 14:30" right={<Text variant="body-sm" color="content-primary">-US$ 5,40</Text>} left={<Avatar size="sm" initials="CS" />} />
          <C title="Depósito Pix" subtitle="Ontem" right={<Text variant="body-sm" color="content-primary">+R$ 500,00</Text>} left={<Avatar size="sm" initials="DP" />} />
          <C title="Mercado Livre" subtitle="28 mar" right={<Text variant="body-sm" color="content-primary">-US$ 32,00</Text>} left={<Avatar size="sm" initials="ML" />} />
        </Scene>
      )
    case 'Badge':
      return (
        <Scene>
          <ListItem title="Cartão físico" right={<C variant="success">Ativo</C>} />
          <ListItem title="Verificação" right={<C variant="warning">Pendente</C>} />
          <ListItem title="Conta virtual" right={<C variant="info">Novo</C>} />
        </Scene>
      )
    case 'Avatar':
      return (
        <Scene>
          <div className="flex gap-[12px] items-center">
            <C size="lg" initials="JP" />
            <div><Text variant="body-md">João Pedro</Text><Text variant="caption" color="content-secondary">joao@email.com</Text></div>
          </div>
          <SkeletonListItems count={2} />
        </Scene>
      )
    case 'Tag':
      return (
        <Scene>
          <div className="flex flex-wrap gap-[8px]">
            <C>Viagem</C>
            <C>Alimentação</C>
            <C>Transporte</C>
            <C>Lazer</C>
          </div>
          <SkeletonLines count={2} />
        </Scene>
      )
    case 'DataList':
      return (
        <Scene>
          <C data={[
            { label: 'Valor', value: 'US$ 500,00' },
            { label: 'Câmbio', value: 'R$ 5,12' },
            { label: 'Taxa', value: 'Zero' },
            { label: 'Total', value: 'R$ 2.560,00' },
          ]} />
          <Bar width="100%" height="44px" />
        </Scene>
      )
    case 'Summary':
      return (
        <Scene>
          <C data={[
            { icon: <RiSendPlaneLine size={20} />, title: 'Transferência enviada', status: 'done' as const },
            { icon: <RiWalletLine size={20} />, title: 'Conversão em andamento', status: 'pending' as const },
          ]} />
        </Scene>
      )
    case 'ProgressBar':
      return (
        <Scene>
          <Text variant="body-sm" color="content-secondary">Progresso da meta</Text>
          <C value={72} />
          <SkeletonLines count={2} />
        </Scene>
      )
    case 'Amount':
      return (
        <Scene>
          <div className="text-center py-[16px]">
            <C value={245000} currency="USD" />
          </div>
          <SkeletonCard />
        </Scene>
      )
    case 'Banner':
      return (
        <Scene>
          <C variant="neutral" title="Novidade" description="Agora você pode enviar dólares para outros países." />
          <SkeletonCard />
        </Scene>
      )
    case 'LineChart':
      return (
        <Scene>
          <SkeletonLines count={1} />
          <div className="h-[120px]"><Bar width="100%" height="120px" /></div>
        </Scene>
      )

    // ── Feedback ──
    case 'Toast':
      return (
        <Scene>
          <SkeletonLines count={2} />
          <SkeletonCard />
          <C message="Copiado com sucesso!" variant="success" visible />
        </Scene>
      )
    case 'EmptyState':
      return (
        <Scene>
          <C title="Nenhuma transação" description="Suas transações aparecerão aqui." />
        </Scene>
      )
    case 'LoadingSpinner':
      return (
        <Scene>
          <div className="flex-1 flex items-center justify-center">
            <C />
          </div>
        </Scene>
      )
    case 'Skeleton':
      return (
        <Scene>
          <SkeletonCard />
          <SkeletonListItems count={3} />
        </Scene>
      )
    case 'Tooltip':
      return (
        <Scene>
          <SkeletonLines count={2} />
          <div className="flex justify-center py-[8px]">
            <C visible>Informação adicional sobre este campo</C>
          </div>
        </Scene>
      )
    case 'Countdown':
    case 'LoadingScreen':
      return (
        <Scene>
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </Scene>
      )

    // ── Navigation ──
    case 'Header':
      return (
        <Scene>
          <C title="Minha Conta" onBack={() => {}} />
          <SkeletonLines count={4} />
        </Scene>
      )
    case 'TabBar':
      return (
        <LayoutProvider isDesktop={false}>
          <div className="bg-surface-primary min-h-full flex flex-col" style={{ paddingTop: 'var(--safe-area-top, 62px)' }}>
            <div className="flex-1 px-[var(--token-spacing-6)] pt-[var(--token-spacing-4)] flex flex-col gap-[var(--token-spacing-6)]">
              <SkeletonHeader />
              <SkeletonLines count={4} />
            </div>
            <C items={[
              { label: 'Início', icon: <RiHomeLine size={20} />, active: true },
              { label: 'Carteira', icon: <RiWalletLine size={20} /> },
              { label: 'Perfil', icon: <RiUserLine size={20} /> },
            ]} />
          </div>
        </LayoutProvider>
      )
    case 'SegmentedControl':
      return (
        <Scene>
          <C segments={['Todos', 'Renda fixa', 'Ações']} activeIndex={0} onChange={() => {}} />
          <SkeletonListItems count={3} />
        </Scene>
      )
    case 'GroupHeader':
      return (
        <Scene>
          <C text="Segurança" />
          <SkeletonListItems count={2} />
          <C text="Notificações" />
          <SkeletonListItems count={2} />
        </Scene>
      )
    case 'Subheader':
      return (
        <Scene>
          <C title="Informações pessoais" />
          <SkeletonLines count={3} />
        </Scene>
      )
    case 'Sidebar':
    case 'Breadcrumb':
      return (
        <Scene>
          <SkeletonLines count={2} />
          <SkeletonCard />
        </Scene>
      )

    // ── Layout ──
    case 'Stack':
      return (
        <Scene>
          <C gap="sm">
            <Bar width="100%" height="40px" />
            <Bar width="100%" height="40px" />
            <Bar width="100%" height="40px" />
          </C>
        </Scene>
      )
    case 'Section':
      return (
        <Scene>
          <C title="Dados pessoais">
            <Bar width="100%" height="44px" />
            <Bar width="100%" height="44px" />
          </C>
          <C title="Endereço">
            <Bar width="100%" height="44px" />
          </C>
        </Scene>
      )
    case 'Modal':
      return (
        <Scene>
          <SkeletonLines count={2} />
          <SkeletonCard />
          <C isVisible title="Confirmar ação" message="Tem certeza que deseja continuar?" buttonOneText="Confirmar" />
        </Scene>
      )
    case 'BottomSheet':
      return (
        <Scene>
          <SkeletonLines count={2} />
          <SkeletonCard />
          <C open title="Selecione uma opção" onClose={() => {}}>
            <div className="flex flex-col gap-[12px] p-[16px]">
              <Bar width="100%" height="44px" />
              <Bar width="100%" height="44px" />
              <Bar width="80%" height="44px" />
            </div>
          </C>
        </Scene>
      )
    case 'BaseLayout':
    case 'StickyFooter':
    case 'FeedbackLayout':
    case 'FeatureLayout':
    case 'AppShell':
      return (
        <Scene>
          <SkeletonCard />
          <SkeletonLines count={3} />
          <Bar width="100%" height="44px" />
        </Scene>
      )

    // ── Foundations ──
    case 'Text':
      return (
        <Scene>
          <C variant="heading-md">Título principal</C>
          <C variant="body-md" color="content-secondary">Texto de descrição com mais detalhes sobre o conteúdo.</C>
          <C variant="caption" color="content-tertiary">Legenda ou informação secundária</C>
        </Scene>
      )
    case 'Divider':
      return (
        <Scene>
          <SkeletonLines count={2} />
          <C />
          <SkeletonLines count={2} />
        </Scene>
      )
    case 'Link':
      return (
        <Scene>
          <SkeletonLines count={2} />
          <C href="#">Ver termos de uso</C>
        </Scene>
      )

    // ── Fallback ──
    default:
      return (
        <Scene>
          <SkeletonLines count={2} />
          <SkeletonCard />
          <SkeletonLines count={1} />
        </Scene>
      )
  }
}

/* ─── Main export ─── */

export default function ComponentContextScene({ meta }: Props) {
  return getScene(meta)
}
