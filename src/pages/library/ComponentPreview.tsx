import { useState } from 'react'
import { RiHomeLine, RiWalletLine, RiArrowLeftRightLine, RiLineChartLine, RiUserLine, RiQrCodeLine, RiBankCardLine, RiSearchLine, RiNotificationLine, RiInboxLine, RiSettings3Line, RiShieldLine, RiStarLine, RiFlashlightLine, RiGlobalLine, RiSendPlaneLine, RiArrowRightUpLine, RiArrowLeftDownLine, RiExternalLinkLine, RiAddLine, RiCloseLine } from '@remixicon/react'
import { tokenIcons } from '../../library/display/tokenIcons'
import type { ComponentMeta } from '../../library/registry'

import Text from '../../library/foundations/Text'
import Divider from '../../library/foundations/Divider'
import Link from '../../library/foundations/Link'
import Button from '../../library/inputs/Button'
import TextInput from '../../library/inputs/TextInput'
import CurrencyInput from '../../library/inputs/CurrencyInput'
import PinInput from '../../library/inputs/PinInput'
import Checkbox from '../../library/inputs/Checkbox'
import Toggle from '../../library/inputs/Toggle'
import Select from '../../library/inputs/Select'
import IconButton from '../../library/inputs/IconButton'
// ButtonNavigation removed — merged into ListItem
import SearchBar from '../../library/inputs/SearchBar'
import ShortcutButton from '../../library/inputs/ShortcutButton'
import Slider from '../../library/inputs/Slider'
import RadioGroup from '../../library/inputs/RadioGroup'
import Card from '../../library/display/Card'
import ListItem from '../../library/display/ListItem'
import Badge from '../../library/display/Badge'
import Avatar from '../../library/display/Avatar'
import Tag from '../../library/display/Tag'
import ProgressBar from '../../library/display/ProgressBar'
import Amount from '../../library/display/Amount'
import DataList from '../../library/display/DataList'
import Summary from '../../library/display/Summary'
import Toast from '../../library/feedback/Toast'
import EmptyState from '../../library/feedback/EmptyState'
import LoadingSpinner from '../../library/feedback/LoadingSpinner'
import Skeleton from '../../library/feedback/Skeleton'
import Banner from '../../library/display/Banner'
import LineChart from '../../library/display/LineChart'
import Tooltip from '../../library/feedback/Tooltip'
import Countdown from '../../library/feedback/Countdown'
import LoadingScreen from '../../library/feedback/LoadingScreen'
import Header from '../../library/navigation/Header'
import TabBar from '../../library/navigation/TabBar'
import SegmentedControl from '../../library/navigation/SegmentedControl'
// NavigationOption removed — merged into ListItem
import GroupHeader from '../../library/navigation/GroupHeader'
import Sidebar from '../../library/navigation/Sidebar'
import Breadcrumb from '../../library/navigation/Breadcrumb'
import Subheader from '../../library/navigation/Subheader'
import { LayoutProvider } from '../../library/layout/LayoutProvider'
import AppShell from '../../library/layout/AppShell'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
// FormLayout removed from component preview
import BottomSheet from '../../library/layout/BottomSheet'
import Modal from '../../library/layout/Modal'
import Stack from '../../library/layout/Stack'
import FeedbackLayout from '../../library/layout/FeedbackLayout'
import FeatureLayout from '../../library/layout/FeatureLayout'
import Section from '../../library/layout/Section'

interface ComponentPreviewProps {
  meta: ComponentMeta
}

export default function ComponentPreview({ meta }: ComponentPreviewProps) {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-lg)]">
      <PreviewContent name={meta.name} />
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[length:var(--token-font-size-caption)] font-medium text-text-secondary uppercase tracking-wider mb-[var(--token-spacing-2)]">
      {children}
    </p>
  )
}

function PreviewContent({ name }: { name: string }) {
  switch (name) {
    case 'Text':
      return <TextPreview />
    case 'Divider':
      return <DividerPreview />
    case 'Link':
      return <LinkPreview />
    case 'Button':
      return <ButtonPreview />
    case 'TextInput':
      return <TextInputPreview />
    case 'CurrencyInput':
      return <CurrencyInputPreview />
    case 'PinInput':
      return <PinInputPreview />
    case 'Checkbox':
      return <CheckboxPreview />
    case 'Toggle':
      return <TogglePreview />
    case 'Select':
      return <SelectPreview />
    case 'IconButton':
      return <IconButtonPreview />
    case 'SearchBar':
      return <SearchBarPreview />
    case 'ShortcutButton':
      return <ShortcutButtonPreview />
    case 'Slider':
      return <SliderPreview />
    case 'RadioGroup':
      return <RadioGroupPreview />
    case 'Card':
      return <CardPreview />
    case 'ListItem':
      return <ListItemPreview />
    case 'Badge':
      return <BadgePreview />
    case 'Avatar':
      return <AvatarPreview />
    case 'Tag':
      return <TagPreview />
    case 'ProgressBar':
      return <ProgressBarPreview />
    case 'Amount':
      return <AmountPreview />
    case 'DataList':
      return <DataListPreview />
    case 'Summary':
      return <SummaryPreview />
    case 'LineChart':
      return <LineChartPreview />
    case 'Toast':
      return <ToastPreview />
    case 'EmptyState':
      return <EmptyStatePreview />
    case 'LoadingSpinner':
      return <LoadingSpinnerPreview />
    case 'Skeleton':
      return <SkeletonPreview />
    case 'Banner':
      return <BannerPreview />
    case 'Tooltip':
      return <TooltipPreview />
    case 'Countdown':
      return <CountdownPreview />
    case 'LoadingScreen':
      return <LoadingScreenPreview />
    case 'Header':
      return <HeaderPreview />
    case 'TabBar':
      return <TabBarPreview />
    case 'SegmentedControl':
      return <SegmentedControlPreview />
    case 'GroupHeader':
      return <GroupHeaderPreview />
    case 'Sidebar':
      return <SidebarPreview />
    case 'Breadcrumb':
      return <BreadcrumbPreview />
    case 'Subheader':
      return <SubheaderPreview />
    case 'AppShell':
      return <AppShellPreview />
    case 'BaseLayout':
      return <BaseLayoutPreview />
    case 'Stack':
      return <StackPreview />
    case 'Section':
      return <SectionPreview />
    case 'StickyFooter':
      return <StickyFooterPreview />
    case 'BottomSheet':
      return <BottomSheetPreview />
    case 'Modal':
      return <ModalPreview />
    case 'FeedbackLayout':
      return <FeedbackLayoutPreview />
    case 'FeatureLayout':
      return <FeatureLayoutPreview />
    default:
      return <p className="text-text-tertiary">No preview available</p>
  }
}

/* ===================== FOUNDATIONS ===================== */

function TextPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-2)] bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)]">
      <Text variant="display">Display — R$ 12,450.00</Text>
      <Text variant="heading-lg">Heading Large</Text>
      <Text variant="heading-md">Heading Medium</Text>
      <Text variant="heading-sm">Heading Small</Text>
      <Text variant="body-lg">Body Large — regular paragraph text</Text>
      <Text variant="body-md">Body Medium — standard content</Text>
      <Text variant="body-sm">Body Small — secondary information</Text>
      <Text variant="caption">Caption — timestamps and labels</Text>
      <Text variant="body-md" color="text-secondary">Colored text with token</Text>
    </div>
  )
}

function DividerPreview() {
  return (
    <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)]">
      <Text variant="body-sm">Content above</Text>
      <Divider spacing="sm" />
      <Text variant="body-sm">Spacing SM</Text>
      <Divider spacing="md" />
      <Text variant="body-sm">Spacing MD</Text>
      <Divider spacing="lg" />
      <Text variant="body-sm">Spacing LG</Text>
    </div>
  )
}

function LinkPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-md)] bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)]">
      <div>
        <SectionLabel>xs (default)</SectionLabel>
        <Link linkText="View details" size="xs" />
      </div>
      <div>
        <SectionLabel>base</SectionLabel>
        <Link linkText="Learn more" size="base" />
      </div>
      <div>
        <SectionLabel>with icons</SectionLabel>
        <Link linkText="Open in browser" size="xs" leadingIcon={<RiGlobalLine size={14} />} trailingIcon={<RiExternalLinkLine size={14} />} />
      </div>
      <div>
        <SectionLabel>disabled</SectionLabel>
        <Link linkText="Unavailable" disabled />
      </div>
    </div>
  )
}

/* ===================== INPUTS ===================== */

function ButtonPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-md)]">
      {(['accent', 'primary', 'secondary', 'ghost', 'destructive'] as const).map((v) => (
        <div key={v}>
          <SectionLabel>{v}</SectionLabel>
          <div className="flex flex-wrap gap-[var(--token-spacing-2)] items-center">
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <Button key={s} variant={v} size={s}>
                {v} {s}
              </Button>
            ))}
            <Button variant={v} loading>Loading</Button>
            <Button variant={v} disabled>Disabled</Button>
          </div>
        </div>
      ))}
      <div>
        <SectionLabel>with subtitle</SectionLabel>
        <Button fullWidth subtitle="R$ 150.00">Confirm transfer</Button>
      </div>
    </div>
  )
}

function TextInputPreview() {
  const [val, setVal] = useState('')
  return (
    <div className="flex flex-col gap-[var(--token-spacing-md)] max-w-[360px]">
      <TextInput label="Full name" placeholder="Enter your name" value={val} onChange={setVal} />
      <TextInput label="Email" placeholder="you@email.com" helperText="We'll never share your email" prefix={<span>@</span>} />
      <TextInput label="Amount" error="Minimum deposit is R$ 10.00" value="5" suffix={<span>BRL</span>} />
      <TextInput label="Disabled" placeholder="Can't edit" disabled />
    </div>
  )
}

function CurrencyInputPreview() {
  const [val, setVal] = useState('15000')
  return (
    <div className="flex flex-col gap-[var(--token-spacing-md)] max-w-[360px]">
      <CurrencyInput label="Amount to deposit" value={val} onChange={setVal} currencySymbol="R$" helperText="Min R$ 10.00" />
      <CurrencyInput label="With error" value="0" currencySymbol="US$" error="Amount must be greater than zero" />
      <CurrencyInput label="Receba" value="100000" currencySymbol="US$" />
      <CurrencyInput label="Disabled" currencySymbol="US$" disabled />
    </div>
  )
}

function PinInputPreview() {
  const [pin4, setPin4] = useState('')
  const [pin6, setPin6] = useState('')
  return (
    <div className="flex flex-col gap-[var(--token-spacing-lg)] items-center">
      <div>
        <SectionLabel>4 digits</SectionLabel>
        <PinInput length={4} value={pin4} onChange={setPin4} />
      </div>
      <div>
        <SectionLabel>6 digits</SectionLabel>
        <PinInput length={6} value={pin6} onChange={setPin6} />
      </div>
      <div>
        <SectionLabel>Error</SectionLabel>
        <PinInput length={4} value="12" error="Invalid code" />
      </div>
    </div>
  )
}

function CheckboxPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-2)] max-w-[400px]">
      <ListItem title="Email marketing" subtitle="Receive promotional emails" right={<Checkbox checked={false} />} trailing={null} />
      <ListItem title="SMS alerts" subtitle="Get text message notifications" right={<Checkbox checked />} trailing={null} />
      <ListItem title="Accept terms" subtitle="Required to continue" right={<Checkbox checked disabled />} trailing={null} disabled />
    </div>
  )
}

function TogglePreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-2)] max-w-[400px]">
      <ListItem title="Push notifications" subtitle="Get notified about transactions" right={<Toggle checked />} trailing={null} />
      <ListItem title="Dark mode" subtitle="Switch to dark theme" right={<Toggle checked={false} />} trailing={null} />
      <ListItem title="Biometric login" subtitle="Use Face ID or fingerprint" right={<Toggle checked disabled />} trailing={null} disabled />
    </div>
  )
}

function SelectPreview() {
  const [val, setVal] = useState('')
  return (
    <div className="flex flex-col gap-[var(--token-spacing-md)] max-w-[360px]">
      <Select
        label="Account type"
        options={[
          { label: 'Checking', value: 'checking' },
          { label: 'Savings', value: 'savings' },
          { label: 'Investment', value: 'investment' },
        ]}
        value={val}
        onChange={setVal}
        placeholder="Choose an account"
      />
      <Select label="With error" error="Please select an option" options={[]} />
      <Select label="Disabled" disabled options={[]} />
    </div>
  )
}

function IconButtonPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-md)]">
      {(['large', 'base', 'small', 'no_background'] as const).map((v) => (
        <div key={v}>
          <SectionLabel>{v}</SectionLabel>
          <div className="flex gap-[var(--token-spacing-3)] items-end">
            <IconButton icon={<RiSettings3Line size={v === 'small' ? 16 : 20} />} variant={v} backgroundColor="#ECEFEB" />
            <IconButton icon={<RiNotificationLine size={v === 'small' ? 16 : 20} />} variant={v} backgroundColor="#ECEFEB" />
            <IconButton icon={<RiSearchLine size={v === 'small' ? 16 : 20} />} variant={v} backgroundColor="#ECEFEB" />
          </div>
        </div>
      ))}
      <div>
        <SectionLabel>inverted (on image)</SectionLabel>
        <div className="relative w-fit rounded-[var(--token-radius-md)] overflow-hidden">
          <img src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&h=80&fit=crop&q=80" alt="" className="w-[300px] h-[80px] object-cover" />
          <div className="absolute top-2 right-2 flex gap-[var(--token-spacing-2)]">
            <IconButton icon={<RiCloseLine size={20} />} variant="base" inverted />
            <IconButton icon={<RiSettings3Line size={20} />} variant="base" inverted />
          </div>
        </div>
      </div>
      <div>
        <SectionLabel>disabled</SectionLabel>
        <div className="flex gap-[var(--token-spacing-3)]">
          <IconButton icon={<RiSettings3Line size={20} />} variant="base" disabled />
        </div>
      </div>
    </div>
  )
}

function SearchBarPreview() {
  const [val, setVal] = useState('')
  return (
    <div className="bg-surface-primary rounded-[var(--token-radius-md)] max-w-[400px] px-4">
      <SearchBar placeholder="Search assets, tokens..." value={val} onChange={(e) => setVal(e.target.value)} />
      <Text variant="caption" color="text-tertiary">
        {val ? `Searching for "${val}"...` : 'Type to search'}
      </Text>
    </div>
  )
}

function ShortcutButtonPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-md)]">
      <div>
        <SectionLabel>primary</SectionLabel>
        <div className="flex gap-[var(--token-spacing-4)]">
          <ShortcutButton icon={<RiArrowRightUpLine size={22} className="text-[#1d211a]" />} label="Send" variant="primary" />
          <ShortcutButton icon={<RiArrowLeftDownLine size={22} className="text-[#1d211a]" />} label="Receive" variant="primary" />
          <ShortcutButton icon={<RiArrowLeftRightLine size={22} className="text-[#1d211a]" />} label="Swap" variant="primary" />
          <ShortcutButton icon={<RiAddLine size={22} className="text-[#1d211a]" />} label="Buy" variant="primary" />
        </div>
      </div>
      <div>
        <SectionLabel>secondary</SectionLabel>
        <div className="flex gap-[var(--token-spacing-4)]">
          <ShortcutButton icon={<RiQrCodeLine size={22} />} label="PIX" variant="secondary" />
          <ShortcutButton icon={<RiBankCardLine size={22} />} label="Card" variant="secondary" />
        </div>
      </div>
      <div>
        <SectionLabel>disabled</SectionLabel>
        <ShortcutButton icon={<RiFlashlightLine size={22} />} label="Locked" disabled />
      </div>
    </div>
  )
}

function SliderPreview() {
  const [val1, setVal1] = useState(500)
  const [val2, setVal2] = useState(50)
  return (
    <div className="flex flex-col gap-[var(--token-spacing-lg)] max-w-[400px]">
      <div>
        <SectionLabel>with labels</SectionLabel>
        <Text variant="heading-sm" align="center">{val1.toLocaleString()}</Text>
        <div className="h-[var(--token-spacing-sm)]" />
        <Slider value={val1} minimumValue={100} maximumValue={5000} step={100} onValueChange={setVal1} />
      </div>
      <div>
        <SectionLabel>percentage</SectionLabel>
        <Slider value={val2} minimumValue={0} maximumValue={100} step={5} onValueChange={setVal2} />
      </div>
      <div>
        <SectionLabel>disabled</SectionLabel>
        <Slider value={30} minimumValue={0} maximumValue={100} onValueChange={() => {}} disabled />
      </div>
    </div>
  )
}

function RadioGroupPreview() {
  const [val, setVal] = useState<string | number>('pix')
  return (
    <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
      <RadioGroup
        label="Payment method"
        value={val}
        onChange={setVal}
        options={[
          { title: 'PIX', description: 'Instant transfer, no fees', value: 'pix' },
          { title: 'TED', description: 'Bank transfer, R$ 8.50 fee', value: 'ted' },
          { title: 'Credit Card', description: '3.5% fee', value: 'card' },
          { title: 'Crypto', description: 'Coming soon', value: 'crypto', disabled: true },
        ]}
      />
    </div>
  )
}

/* ===================== DISPLAY ===================== */

function CardPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-md)]">
      {(['elevated', 'flat'] as const).map((v) => (
        <div key={v}>
          <SectionLabel>{v}</SectionLabel>
          <Card variant={v}>
            <Text variant="heading-sm">Account Balance</Text>
            <Text variant="display">R$ 12,450.00</Text>
          </Card>
        </div>
      ))}
      <div>
        <SectionLabel>Pressable</SectionLabel>
        <Card variant="elevated" pressable>
          <Text variant="body-md">Tap me</Text>
        </Card>
      </div>
    </div>
  )
}

function ListItemPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-lg)]">
      {/* Box variant (default) */}
      <div>
        <SectionLabel>box variant (default)</SectionLabel>
        <div className="flex flex-col gap-[var(--token-spacing-2)] max-w-[400px]">
          <ListItem
            title="Account & Security"
            subtitle="Manage your account settings"
            left={<div className="w-10 h-10 rounded-full bg-[var(--color-surface-shade)] flex items-center justify-center"><RiShieldLine size={20} className="text-[var(--color-content-primary)]" /></div>}
            onPress={() => {}}
          />
          <ListItem
            title="Rewards"
            subtitle="View your cashback and perks"
            left={<Avatar size="md" icon={<RiStarLine size={20} />} />}
            right={<Badge variant="lime" size="sm">3 new</Badge>}
            onPress={() => {}}
          />
          <ListItem
            title="Bitcoin"
            subtitle="BTC"
            left={<Avatar size="md" src={tokenIcons.BTC} />}
            right={<div className="flex flex-col items-end"><span className="text-base font-semibold text-[var(--color-content-primary)]">R$ 5,280</span><span className="text-sm text-[var(--color-content-secondary)]">+2.4%</span></div>}
            onPress={() => {}}
          />
        </div>
      </div>

      {/* Inverted */}
      <div>
        <SectionLabel>inverted (subtitle is bold)</SectionLabel>
        <div className="flex flex-col gap-[var(--token-spacing-2)] max-w-[400px]">
          <ListItem
            inverted
            title="Picnic Account"
            subtitle="R$ 12,450.00"
            left={<Avatar size="md" initials="PA" />}
            onPress={() => {}}
          />
        </div>
      </div>

      {/* With right slots */}
      <div>
        <SectionLabel>right slot variations</SectionLabel>
        <div className="flex flex-col gap-[var(--token-spacing-2)] max-w-[400px]">
          <ListItem title="View details" subtitle="Transaction #42" right={<Link linkText="Open" size="xs" />} trailing={null} />
          <ListItem title="Tag example" subtitle="Categorized item" right={<Tag label="DeFi" />} trailing={null} />
        </div>
      </div>

      {/* Disabled */}
      <div>
        <SectionLabel>disabled</SectionLabel>
        <div className="flex flex-col gap-[var(--token-spacing-2)] max-w-[400px]">
          <ListItem title="Disabled" subtitle="Can't interact" disabled onPress={() => {}} />
        </div>
      </div>
    </div>
  )
}

function BadgePreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-md)]">
      <div>
        <SectionLabel>semantic</SectionLabel>
        <div className="flex flex-wrap gap-[var(--token-spacing-2)]">
          {(['success', 'warning', 'error', 'info', 'neutral'] as const).map((v) => (
            <Badge key={v} variant={v} size="md">{v}</Badge>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>brand colors</SectionLabel>
        <div className="flex flex-wrap gap-[var(--token-spacing-2)]">
          <Badge variant="guava" size="md">Guava</Badge>
          <Badge variant="grape" size="md">Grape</Badge>
          <Badge variant="lime" size="md">Lime</Badge>
          <Badge variant="none" size="md">None</Badge>
        </div>
      </div>
      <div>
        <SectionLabel>with icon</SectionLabel>
        <Badge variant="success" size="md" icon={<RiStarLine size={12} />}>Featured</Badge>
      </div>
    </div>
  )
}

function AvatarPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-md)]">
      <div>
        <SectionLabel>sizes (initials)</SectionLabel>
        <div className="flex gap-[var(--token-spacing-3)] items-end">
          {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <Avatar key={size} size={size} initials="RP" />
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>initials</SectionLabel>
        <div className="flex gap-[var(--token-spacing-3)]">
          <Avatar initials="AB" />
          <Avatar initials="JD" />
          <Avatar initials="MK" />
        </div>
      </div>
      <div>
        <SectionLabel>src (crypto tokens via coingecko)</SectionLabel>
        <div className="flex gap-[var(--token-spacing-3)]">
          <Avatar src={tokenIcons.BTC} />
          <Avatar src={tokenIcons.ETH} />
          <Avatar src={tokenIcons.SOL} />
          <Avatar src={tokenIcons.USDC} />
          <Avatar src={tokenIcons.AVAX} />
          <Avatar src={tokenIcons.LINK} />
        </div>
      </div>
      <div>
        <SectionLabel>src (photo)</SectionLabel>
        <div className="flex gap-[var(--token-spacing-3)]">
          <Avatar src="https://i.pravatar.cc/80?u=alice" />
          <Avatar src="https://i.pravatar.cc/80?u=bob" />
          <Avatar src="https://i.pravatar.cc/80?u=carol" />
        </div>
      </div>
      <div>
        <SectionLabel>icon</SectionLabel>
        <div className="flex gap-[var(--token-spacing-3)]">
          <Avatar icon={<RiWalletLine size={18} />} />
          <Avatar icon={<RiGlobalLine size={18} />} />
          <Avatar />
        </div>
      </div>
      <div>
        <SectionLabel>bgColor + iconColor</SectionLabel>
        <div className="flex gap-[var(--token-spacing-3)]">
          <Avatar icon={<RiWalletLine size={18} />} bgColor="#EFF6FF" iconColor="#3B82F6" />
          <Avatar icon={<RiGlobalLine size={18} />} bgColor="#F0FDF4" iconColor="#22C55E" />
          <Avatar initials="RP" bgColor="#2F289F" iconColor="#FFFFFF" />
        </div>
      </div>
      <div>
        <SectionLabel>with overlay (chain logo, bottom-right)</SectionLabel>
        <div className="flex gap-[var(--token-spacing-4)] items-end">
          <Avatar size="xl" src={tokenIcons.ETH} overlay={<img src={tokenIcons.LINK} alt="" className="w-full h-full object-cover" />} />
          <Avatar size="lg" src="https://i.pravatar.cc/80?u=alice" overlay={<img src={tokenIcons.LINK} alt="" className="w-full h-full object-cover" />} />
          <Avatar size="md" src={tokenIcons.USDC} overlay={<img src={tokenIcons.LINK} alt="" className="w-full h-full object-cover" />} />
        </div>
      </div>
      <div>
        <SectionLabel>with badge (notification, top-right)</SectionLabel>
        <div className="flex gap-[var(--token-spacing-4)] items-end">
          <Avatar size="xl" src="https://i.pravatar.cc/80?u=bob" badge />
          <Avatar size="lg" initials="JD" badge />
          <Avatar size="md" src={tokenIcons.BTC} badge badgeColor="#10B981" />
        </div>
      </div>
      <div>
        <SectionLabel>overlay + badge combined</SectionLabel>
        <div className="flex gap-[var(--token-spacing-4)] items-end">
          <Avatar size="xl" src="https://i.pravatar.cc/80?u=carol" overlay={<img src={tokenIcons.LINK} alt="" className="w-full h-full object-cover" />} badge />
          <Avatar size="lg" icon={<RiWalletLine size={24} />} overlay={<img src={tokenIcons.LINK} alt="" className="w-full h-full object-cover" />} badge badgeColor="#EAB308" />
        </div>
      </div>
    </div>
  )
}

function TagPreview() {
  return (
    <div className="flex flex-wrap gap-[var(--token-spacing-2)]">
      <Tag label="Crypto" />
      <Tag label="PIX" />
      <Tag label="Removable" removable onRemove={() => {}} />
      <Tag label="Investment" removable onRemove={() => {}} />
    </div>
  )
}

function ProgressBarPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-md)] max-w-[360px]">
      {[25, 50, 75, 100].map((v) => (
        <div key={v}>
          <SectionLabel>{`${v}%`}</SectionLabel>
          <ProgressBar value={v} />
        </div>
      ))}
    </div>
  )
}

function AmountPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-3)] bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)]">
      <Amount value={12450.0} size="display" />
      <Amount value={5280.5} size="lg" />
      <Amount value={150.0} size="md" />
      <Amount value={-42.99} size="sm" />
      <Amount value={1000} currency="$" size="lg" />
    </div>
  )
}

function DataListPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-md)]">
      <div>
        <SectionLabel>transaction details</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <DataList data={[
            { label: 'Amount', value: 'R$ 150.00' },
            { label: 'Fee', value: 'Free', secondaryValue: 'PIX transfer' },
            { label: 'Exchange rate', value: '1 AVAX = R$ 89.42', info: () => {} },
            { label: 'Total', value: 'R$ 150.00' },
          ]} />
        </div>
      </div>
      <div>
        <SectionLabel>with copy & info</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <DataList data={[
            { label: 'PIX code', value: '8a7f3e...c92d', copyable: true },
            { label: 'Network fee', value: 'R$ 0.00', info: 'No fee for this transfer' },
            { label: 'VET', value: '0.21 VTHO', info: () => {} },
            { label: 'Recipient', value: 'João Silva' },
          ]} />
        </div>
      </div>
      <div>
        <SectionLabel>with expandable breakdown</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <DataList data={[
            { label: 'Amount', value: 'R$ 200.00' },
            {
              label: 'Status',
              value: 'Completed',
              breakdown: [
                { label: 'Transaction initiated', value: '14:32' },
                { label: 'Processing payment', value: '14:33' },
                { label: 'Confirmed by network', value: '14:35' },
                { label: 'Completed', value: '14:35' },
              ],
            },
            { label: 'Fee', value: 'R$ 1.50' },
          ]} />
        </div>
      </div>
      <div>
        <SectionLabel>vertical — card details</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <DataList variant="vertical" data={[
            { label: 'Nome', value: 'Cartão Virtual' },
            { label: 'Número', value: '0234 3829 3090 3849', copyable: true },
            [
              { label: 'Data de Validade', value: '10/30' },
              { label: 'CVV', value: '039' },
            ],
          ]} />
        </div>
      </div>
      <div>
        <SectionLabel>vertical — with action button</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <DataList variant="vertical" data={[
            {
              label: 'Limite diário de gastos',
              value: 'US$ 5.000,00',
              action: <Button variant="primary" size="sm" onPress={() => {}}>Editar</Button>,
            },
            { label: 'Limite por transação', value: 'US$ 5.000,00' },
            { label: 'Instruções para uso', value: 'Escolha sempre o método crédito e a moeda local ao realizar compras.' },
          ]} />
        </div>
      </div>
    </div>
  )
}

function SummaryPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-lg)] max-w-[400px]">
      <div>
        <SectionLabel>default</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)]">
          <Summary
            header="Transfer summary"
            data={[
              { icon: <RiSendPlaneLine size={24} className="text-[var(--color-content-primary)]" />, title: 'Sending to', description: 'John Doe — PIX ••• 456' },
              { icon: <RiWalletLine size={24} className="text-[var(--color-content-primary)]" />, title: 'From account', description: 'Checking •••• 1234' },
              { icon: <RiFlashlightLine size={24} className="text-[var(--color-content-primary)]" />, title: 'Speed', description: 'Instant — arrives in seconds' },
            ]}
          />
        </div>
      </div>
      <div>
        <SectionLabel>with done status</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)]">
          <Summary
            data={[
              { icon: <RiGlobalLine size={24} className="text-[var(--color-content-primary)]" />, title: 'Identity verified', description: 'Your documents have been approved.', status: 'done' },
              { icon: <RiGlobalLine size={24} className="text-[var(--color-content-primary)]" />, title: 'Address confirmed', description: 'Proof of address accepted.', status: 'done' },
              { icon: <RiGlobalLine size={24} className="text-[var(--color-content-primary)]" />, title: 'Link bank account', description: 'Connect your bank to start transferring.' },
            ]}
          />
        </div>
      </div>
      <div>
        <SectionLabel>with pending status</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)]">
          <Summary
            data={[
              { icon: <RiGlobalLine size={24} className="text-[var(--color-content-primary)]" />, title: 'Identity verified', description: 'Your documents have been approved.', status: 'done' },
              { icon: <RiFlashlightLine size={24} className="text-[var(--color-content-primary)]" />, title: 'Processing deposit', description: 'Your R$ 500.00 deposit is being confirmed.', status: 'pending' },
              { icon: <RiWalletLine size={24} className="text-[var(--color-content-primary)]" />, title: 'Funds available', description: 'Will be credited once confirmed.', status: 'pending' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}


const lineChartBaselineData = [
  { time: '2025-01-01', value: 100 },
  { time: '2025-02-01', value: 108 },
  { time: '2025-03-01', value: 95 },
  { time: '2025-04-01', value: 112 },
  { time: '2025-05-01', value: 105 },
  { time: '2025-06-01', value: 118 },
  { time: '2025-07-01', value: 92 },
  { time: '2025-08-01', value: 97 },
  { time: '2025-09-01', value: 110 },
  { time: '2025-10-01', value: 125 },
  { time: '2025-11-01', value: 120 },
  { time: '2025-12-01', value: 130 },
]

const lineChartAreaData = Array.from({ length: 13 }, (_, i) => ({
  time: new Date(2026, i, 1).toISOString(),
  value: Math.round(500 * Math.pow(1 + 0.05 / 12, i) * 100) / 100,
}))

function LineChartPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-lg)] max-w-[480px]">
      <div>
        <SectionLabel>baseline (price chart)</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)]">
          <LineChart data={lineChartBaselineData} variant="baseline" height={180} />
        </div>
      </div>
      <div>
        <SectionLabel>area (yield projection)</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)]">
          <LineChart data={lineChartAreaData} variant="area" height={180} />
        </div>
      </div>
      <div>
        <SectionLabel>with axes visible</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)]">
          <LineChart data={lineChartBaselineData} variant="baseline" height={200} showPriceScale showTimeScale />
        </div>
      </div>
    </div>
  )
}

/* ===================== FEEDBACK ===================== */

function ToastPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-3)]">
      {(['success', 'error', 'info', 'warning'] as const).map((v) => (
        <Toast key={v} variant={v} message={`This is a ${v} toast notification`} onDismiss={() => {}} />
      ))}
    </div>
  )
}

function EmptyStatePreview() {
  return (
    <div className="bg-surface-primary rounded-[var(--token-radius-md)]">
      <EmptyState
        icon={<RiInboxLine size={48} />}
        title="No transactions yet"
        description="Your transactions will appear here once you make your first deposit."
        action={<Button size="sm">Make a deposit</Button>}
      />
    </div>
  )
}

function LoadingSpinnerPreview() {
  return (
    <div className="flex items-end gap-[var(--token-spacing-lg)]">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-[var(--token-spacing-2)]">
          <LoadingSpinner size={size} />
          <Text variant="caption">{size}</Text>
        </div>
      ))}
    </div>
  )
}

function SkeletonPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-md)] bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[320px]">
      <div className="flex items-center gap-[var(--token-spacing-3)]">
        <Skeleton variant="circle" height="40px" />
        <div className="flex-1 flex flex-col gap-[var(--token-spacing-2)]">
          <Skeleton height="14px" width="60%" />
          <Skeleton height="12px" width="40%" />
        </div>
      </div>
      <Skeleton variant="rect" height="120px" />
      <Skeleton height="14px" />
      <Skeleton height="14px" width="80%" />
    </div>
  )
}

function BannerPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-lg)] max-w-[400px]">
      {(['neutral', 'success', 'warning', 'critical'] as const).map((v) => (
        <Banner key={v} title={`${v.charAt(0).toUpperCase() + v.slice(1)} banner`} description="This is the description text for this banner variant." variant={v} />
      ))}
      <div>
        <SectionLabel>collapsable (collapsed)</SectionLabel>
        <Banner title="Entenda nossas taxas" description="This content is hidden until expanded." collapsable />
      </div>
      <div>
        <SectionLabel>collapsable (expanded)</SectionLabel>
        <Banner title="Entenda nossas taxas" description="Caso contrário o valor será devolvido automaticamente para a mesma conta." collapsable defaultExpanded />
      </div>
      <div>
        <SectionLabel>dismissible</SectionLabel>
        <Banner title="Dismissible banner" description="Close me with the X button." dismissible />
      </div>
      <div>
        <SectionLabel>with link</SectionLabel>
        <Banner title="Learn more" description="Read about our fee structure." linkText="View details" onLinkPress={() => {}} />
      </div>
    </div>
  )
}

function TooltipPreview() {
  const [visible1, setVisible1] = useState(true)
  const [visible2, setVisible2] = useState(true)
  return (
    <div className="flex flex-col gap-[var(--token-spacing-lg)] max-w-[400px]">
      <div>
        <SectionLabel>arrow top (default)</SectionLabel>
        <Tooltip visible={visible1} onClose={() => setVisible1(!visible1)} position="top">
          <span><span className="font-semibold">Novidade:</span> deposite e receba dólares de qualquer banco internacional via ACH</span>
        </Tooltip>
        {!visible1 && <Button size="sm" onPress={() => setVisible1(true)}>Show again</Button>}
      </div>
      <div>
        <SectionLabel>arrow bottom</SectionLabel>
        <Tooltip visible={visible2} onClose={() => setVisible2(!visible2)} position="bottom">
          Você pode digitar um valor em <span className="font-semibold">dólares ou reais</span> para depositar
        </Tooltip>
        {!visible2 && <Button size="sm" onPress={() => setVisible2(true)}>Show again</Button>}
      </div>
      <div>
        <SectionLabel>no close button</SectionLabel>
        <Tooltip>
          This tooltip has no close button — it stays visible.
        </Tooltip>
      </div>
    </div>
  )
}

/* ===================== NAVIGATION ===================== */

function HeaderPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-lg)]">
      <div>
        <SectionLabel>with back button</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <Header title="Limites e taxas" onBack={() => {}} />
        </div>
      </div>
      <div>
        <SectionLabel>with close button</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <Header title="Settings" onClose={() => {}} />
        </div>
      </div>
      <div>
        <SectionLabel>with description</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <Header title="Deposit" description="Choose the asset and amount you want to deposit." onBack={() => {}} />
        </div>
      </div>
      <div>
        <SectionLabel>back + right action</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <Header
            title="Limites e taxas"
            onBack={() => {}}
            rightAction={
              <IconButton icon={<RiSettings3Line size={24} />} variant="base" onPress={() => {}} />
            }
          />
        </div>
      </div>
    </div>
  )
}

function TabBarPreview() {
  const [active, setActive] = useState('home')
  const items = [
    { id: 'home', label: 'Home', icon: <RiHomeLine size={22} /> },
    { id: 'wallet', label: 'Wallet', icon: <RiWalletLine size={22} /> },
    { id: 'transfer', label: 'Transfer', icon: <RiArrowLeftRightLine size={22} /> },
    { id: 'invest', label: 'Invest', icon: <RiLineChartLine size={22} /> },
    { id: 'profile', label: 'Profile', icon: <RiUserLine size={22} /> },
  ]
  return (
    <div className="bg-surface-primary rounded-[var(--token-radius-md)] overflow-hidden">
      <TabBar items={items} activeId={active} onChange={setActive} />
    </div>
  )
}

function SegmentedControlPreview() {
  const [idx, setIdx] = useState(0)
  return (
    <div className="max-w-[360px]">
      <SegmentedControl
        segments={[
          { label: 'All', icon: <RiGlobalLine size={16} /> },
          { label: 'Income', icon: <RiArrowLeftDownLine size={16} /> },
          { label: 'Expense', icon: <RiArrowRightUpLine size={16} /> },
        ]}
        activeIndex={idx}
        onChange={setIdx}
      />
    </div>
  )
}

function GroupHeaderPreview() {
  return (
    <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
      <GroupHeader text="GENERAL" />
      <div className="py-3"><Text variant="body-md">Some content...</Text></div>
      <GroupHeader text="SECURITY" />
      <div className="py-3"><Text variant="body-md">More content...</Text></div>
      <GroupHeader text="ABOUT" />
      <div className="py-3"><Text variant="body-md">Even more content...</Text></div>
      <GroupHeader text="NOTIFICATIONS" subtitle="Manage how you receive alerts" />
      <div className="py-3"><Text variant="body-md">Notification settings...</Text></div>
      <GroupHeader text="QUICK ACTIONS" subtitle="Common tasks" icon={<RiFlashlightLine size={16} />} />
      <div className="py-3"><Text variant="body-md">Action items...</Text></div>
    </div>
  )
}

function SubheaderPreview() {
  return (
    <div className="bg-surface-primary rounded-[var(--token-radius-md)] max-w-[400px] flex flex-col">
      <Subheader text="Minha carteira" />
      <div className="px-5 py-3"><Text variant="body-md">Content below...</Text></div>
      <Subheader text="Favoritos" actionLabel="Ver todos" onAction={() => {}} />
      <div className="px-5 py-3"><Text variant="body-md">Card carousel...</Text></div>
      <Subheader text="Todos os ativos" right={<span className="text-[12px] text-[var(--color-content-secondary)]">Sort ↕</span>} />
      <div className="px-5 py-3"><Text variant="body-md">Asset list...</Text></div>
    </div>
  )
}

/* ===================== LAYOUT ===================== */

function BaseLayoutPreview() {
  return (
    <div className="h-[480px] rounded-[var(--token-radius-md)] overflow-hidden border border-border-default">
      <BaseLayout>
        <Header title="Page Title" description="A brief description of this screen." onBack={() => {}} />
        <Section title="Account">
          <Stack gap="none">
            <ListItem title="Profile" subtitle="Manage your info" onPress={() => {}} />
            <ListItem title="Email" subtitle="john@email.com" onPress={() => {}} />
          </Stack>
        </Section>
        <Section title="Preferences">
          <Stack>
            <ListItem title="Dark mode" right={<Toggle checked={false} />} trailing={null} />
            <ListItem title="Notifications" right={<Toggle checked />} trailing={null} />
          </Stack>
        </Section>
        <StickyFooter><Button fullWidth>Continue</Button></StickyFooter>
      </BaseLayout>
    </div>
  )
}

function StackPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-lg)]">
      <div>
        <SectionLabel>default (16px)</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <Stack>
            <TextInput label="First name" placeholder="John" />
            <TextInput label="Last name" placeholder="Doe" />
            <TextInput label="Email" placeholder="john@email.com" />
          </Stack>
        </div>
      </div>
      <div>
        <SectionLabel>none (0px) — flush list rows</SectionLabel>
        <div className="bg-surface-primary rounded-[var(--token-radius-md)] max-w-[400px]">
          <Stack gap="none">
            <ListItem title="Bitcoin" subtitle="BTC" left={<Avatar size="md" src={tokenIcons.BTC} />} onPress={() => {}} />
            <ListItem title="Ethereum" subtitle="ETH" left={<Avatar size="md" src={tokenIcons.ETH} />} onPress={() => {}} />
            <ListItem title="Solana" subtitle="SOL" left={<Avatar size="md" src={tokenIcons.SOL} />} onPress={() => {}} />
          </Stack>
        </div>
      </div>
      <div>
        <SectionLabel>sm (8px)</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <Stack gap="sm">
            <Badge variant="success" size="md">Completed</Badge>
            <Badge variant="info" size="md">Processing</Badge>
            <Badge variant="warning" size="md">Pending</Badge>
          </Stack>
        </div>
      </div>
      <div>
        <SectionLabel>lg (24px)</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <Stack gap="lg">
            <Card variant="flat"><Text variant="body-md">Card one</Text></Card>
            <Card variant="flat"><Text variant="body-md">Card two</Text></Card>
          </Stack>
        </div>
      </div>
    </div>
  )
}

function SectionPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-lg)]">
      <div>
        <SectionLabel>with title</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <Section title="Account Settings">
            <Stack gap="none">
              <ListItem title="Profile" subtitle="Manage your info" onPress={() => {}} />
              <ListItem title="Security" subtitle="Password and 2FA" onPress={() => {}} />
            </Stack>
          </Section>
        </div>
      </div>
      <div>
        <SectionLabel>without title</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px]">
          <Section>
            <Text variant="body-md">Sections without a title work as semantic grouping containers. BaseLayout separates them with 24px gaps.</Text>
          </Section>
        </div>
      </div>
      <div>
        <SectionLabel>multiple sections (as in BaseLayout)</SectionLabel>
        <div className="bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)] max-w-[400px] flex flex-col gap-[var(--token-spacing-6)]">
          <Section title="General">
            <Stack gap="none">
              <ListItem title="Language" subtitle="English" onPress={() => {}} />
              <ListItem title="Currency" subtitle="BRL" onPress={() => {}} />
            </Stack>
          </Section>
          <Section title="Notifications">
            <Stack>
              <ListItem title="Push" right={<Toggle checked />} trailing={null} />
              <ListItem title="Email" right={<Toggle checked={false} />} trailing={null} />
            </Stack>
          </Section>
        </div>
      </div>
    </div>
  )
}

function StickyFooterPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-4)]">
      <SectionLabel>Mobile (sticky bottom)</SectionLabel>
      <div className="h-[300px] rounded-[var(--token-radius-md)] overflow-hidden border border-border-default">
        <LayoutProvider isDesktop={false}>
          <BaseLayout>
            <Header title="Checkout" onBack={() => {}} />
            <Section title="Order Summary">
              <Text variant="body-md">2x Premium Plan — R$ 49.90/mo</Text>
            </Section>
            <StickyFooter>
              <Button fullWidth>Confirm Payment</Button>
            </StickyFooter>
          </BaseLayout>
        </LayoutProvider>
      </div>
      <SectionLabel>Desktop (inline)</SectionLabel>
      <div className="h-[300px] rounded-[var(--token-radius-md)] overflow-hidden border border-border-default">
        <LayoutProvider isDesktop={true}>
          <BaseLayout>
            <Header title="Checkout" />
            <Section title="Order Summary">
              <Text variant="body-md">2x Premium Plan — R$ 49.90/mo</Text>
            </Section>
            <StickyFooter>
              <Button fullWidth>Confirm Payment</Button>
            </StickyFooter>
          </BaseLayout>
        </LayoutProvider>
      </div>
    </div>
  )
}

function BottomSheetPreview() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onPress={() => setOpen(true)}>Open Bottom Sheet</Button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Transfer Details">
        <div className="flex flex-col gap-[var(--token-spacing-3)]">
          <Text variant="body-md">Amount: R$ 150.00</Text>
          <Text variant="body-md">To: John Doe</Text>
          <Text variant="body-md">Via: PIX</Text>
          <div className="h-[var(--token-spacing-md)]" />
          <Button fullWidth onPress={() => setOpen(false)}>Confirm</Button>
        </div>
      </BottomSheet>
    </>
  )
}

function ModalPreview() {
  const [regularOpen, setRegularOpen] = useState(false)
  const [bottomOpen, setBottomOpen] = useState(false)
  return (
    <div className="flex gap-[var(--token-spacing-3)]">
      <Button onPress={() => setRegularOpen(true)}>Center Modal</Button>
      <Button variant="primary" onPress={() => setBottomOpen(true)}>Bottom Modal</Button>
      <Modal
        isVisible={regularOpen}
        variant="regular"
        title="Confirm Transfer"
        message="You are about to send R$ 150.00 to John Doe via PIX. This action cannot be undone."
        shouldRenderCloseButton
        buttonOneText="Confirm"
        onButtonOnePress={() => setRegularOpen(false)}
        onBackdropPress={() => setRegularOpen(false)}
      />
      <Modal
        isVisible={bottomOpen}
        variant="bottom"
        title="Select Account"
        shouldRenderCloseButton
        onBackdropPress={() => setBottomOpen(false)}
      >
        <div className="flex flex-col gap-3 mt-2">
          <Button variant="ghost" fullWidth onPress={() => setBottomOpen(false)}>Checking •••• 1234</Button>
          <Button variant="ghost" fullWidth onPress={() => setBottomOpen(false)}>Savings •••• 5678</Button>
        </div>
      </Modal>
    </div>
  )
}

function FeedbackLayoutPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-4)]">
      <SectionLabel>Success with pending result</SectionLabel>
      <div className="h-[600px] border border-border-default rounded-[var(--token-radius-md)] overflow-hidden">
        <FeedbackLayout onClose={() => {}}>
          <Stack gap="sm">
            <Text variant="display">Sucesso!</Text>
            <Text variant="body-md" color="content-secondary">
              Seu saldo ficará disponível para uso em alguns minutos.
            </Text>
          </Stack>
          <Banner variant="neutral" title="Você economizou R$20.71" description="Valor aproximado de economia" />
          <DataList data={[
            { label: 'Você pagou', value: 'R$ 545,83' },
            { label: 'Você recebeu', value: 'US$ 100' },
          ]} />
          <StickyFooter>
            <Button fullWidth>Entendi</Button>
          </StickyFooter>
        </FeedbackLayout>
      </div>
    </div>
  )
}

function CountdownPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-4)] bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)]">
      <div>
        <SectionLabel>Normal (5 minutes)</SectionLabel>
        <Countdown seconds={300} label="Código válido por" />
      </div>
      <div>
        <SectionLabel>Urgent (&lt; 60s)</SectionLabel>
        <Countdown seconds={45} label="Expira em" />
      </div>
      <div>
        <SectionLabel>Custom label</SectionLabel>
        <Countdown seconds={180} label="Tempo restante:" />
      </div>
    </div>
  )
}

function LoadingScreenPreview() {
  const steps = [
    { title: 'Reconhecemos seu pagamento...', progress: 20 },
    { title: 'Processando', progress: 45 },
    { title: 'Convertendo em dólar', progress: 75 },
    { title: 'Pronto!', progress: 100 },
  ]

  return (
    <div className="flex flex-col gap-[var(--token-spacing-4)]">
      <SectionLabel>Auto-advancing (1.5s per step)</SectionLabel>
      <div className="h-[500px] border border-border-default rounded-[var(--token-radius-md)] overflow-hidden">
        <LoadingScreen steps={steps} autoAdvance autoAdvanceInterval={1500} />
      </div>
    </div>
  )
}

/* ===================== RESPONSIVE LAYOUT ===================== */

function SidebarPreview() {
  const [activeId, setActiveId] = useState('home')
  return (
    <div className="h-[400px] border border-border-default rounded-[var(--token-radius-md)] overflow-hidden">
      <Sidebar
        items={[
          { id: 'home', label: 'Home', icon: <RiHomeLine size={20} /> },
          { id: 'wallet', label: 'Wallet', icon: <RiWalletLine size={20} /> },
          { id: 'swap', label: 'Swap', icon: <RiArrowLeftRightLine size={20} /> },
          { id: 'invest', label: 'Invest', icon: <RiLineChartLine size={20} /> },
          { id: 'settings', label: 'Settings', icon: <RiSettings3Line size={20} /> },
        ]}
        activeId={activeId}
        onChange={setActiveId}
        header={<Text variant="heading-md">Picnic</Text>}
      />
    </div>
  )
}

function BreadcrumbPreview() {
  return (
    <div className="flex flex-col gap-[var(--token-spacing-4)] bg-surface-primary p-[var(--token-spacing-md)] rounded-[var(--token-radius-md)]">
      <div>
        <SectionLabel>Two levels</SectionLabel>
        <Breadcrumb items={[
          { label: 'Home', onClick: () => {} },
          { label: 'Wallet' },
        ]} />
      </div>
      <div>
        <SectionLabel>Three levels</SectionLabel>
        <Breadcrumb items={[
          { label: 'Home', onClick: () => {} },
          { label: 'Wallet', onClick: () => {} },
          { label: 'Deposit' },
        ]} />
      </div>
    </div>
  )
}

function AppShellPreview() {
  const [activeTab, setActiveTab] = useState('home')
  const sidebarNode = (
    <Sidebar
      items={[
        { id: 'home', label: 'Home', icon: <RiHomeLine size={20} /> },
        { id: 'wallet', label: 'Wallet', icon: <RiWalletLine size={20} /> },
        { id: 'swap', label: 'Swap', icon: <RiArrowLeftRightLine size={20} /> },
      ]}
      activeId={activeTab}
      onChange={setActiveTab}
      header={<Text variant="heading-sm">Picnic</Text>}
    />
  )
  const tabBarNode = (
    <TabBar
      items={[
        { id: 'home', label: 'Home', icon: <RiHomeLine size={20} /> },
        { id: 'wallet', label: 'Wallet', icon: <RiWalletLine size={20} /> },
        { id: 'swap', label: 'Swap', icon: <RiArrowLeftRightLine size={20} /> },
      ]}
      activeId={activeTab}
      onChange={setActiveTab}
    />
  )

  return (
    <div className="flex flex-col gap-[var(--token-spacing-4)]">
      <SectionLabel>Desktop (isDesktop=true)</SectionLabel>
      <div className="h-[350px] border border-border-default rounded-[var(--token-radius-md)] overflow-hidden">
        <LayoutProvider isDesktop={true}>
          <AppShell sidebar={sidebarNode} tabBar={tabBarNode}>
            <BaseLayout>
              <Header title="Home" />
              <Text variant="body-md">Desktop content inside white card</Text>
            </BaseLayout>
          </AppShell>
        </LayoutProvider>
      </div>
      <SectionLabel>Desktop level 2 (breadcrumb)</SectionLabel>
      <div className="h-[350px] border border-border-default rounded-[var(--token-radius-md)] overflow-hidden">
        <LayoutProvider isDesktop={true} level={2} breadcrumbs={[
          { label: 'Home', onClick: () => {} },
          { label: 'Wallet', onClick: () => {} },
          { label: 'Deposit' },
        ]}>
          <AppShell sidebar={sidebarNode} tabBar={tabBarNode}>
            <BaseLayout>
              <Header title="Deposit" onBack={() => {}} />
              <Text variant="body-md">Desktop level 2 — breadcrumb replaces back button</Text>
              <StickyFooter><Button fullWidth>Continue</Button></StickyFooter>
            </BaseLayout>
          </AppShell>
        </LayoutProvider>
      </div>
      <SectionLabel>Mobile level 1</SectionLabel>
      <div className="h-[350px] border border-border-default rounded-[var(--token-radius-md)] overflow-hidden">
        <LayoutProvider isDesktop={false} level={1}>
          <AppShell sidebar={sidebarNode} tabBar={tabBarNode}>
            <BaseLayout>
              <Header title="Home" />
              <Text variant="body-md">Mobile content with TabBar</Text>
            </BaseLayout>
          </AppShell>
        </LayoutProvider>
      </div>
      <SectionLabel>Mobile level 2 (no TabBar, back button)</SectionLabel>
      <div className="h-[350px] border border-border-default rounded-[var(--token-radius-md)] overflow-hidden">
        <LayoutProvider isDesktop={false} level={2}>
          <AppShell sidebar={sidebarNode} tabBar={tabBarNode}>
            <BaseLayout>
              <Header title="Deposit" onBack={() => {}} />
              <Text variant="body-md">Mobile level 2 — back button, no TabBar</Text>
              <StickyFooter><Button fullWidth>Continue</Button></StickyFooter>
            </BaseLayout>
          </AppShell>
        </LayoutProvider>
      </div>
    </div>
  )
}

function FeatureLayoutPreview() {
  const featureContent = (
    <>
      <Stack gap="sm">
        <Text variant="display">Your US Dollar Account</Text>
        <Text variant="body-md" color="content-secondary">
          Use Picnic to send and receive dollars to any bank via ACH or Wire transfer.
        </Text>
      </Stack>

      <Summary
        header="How it works"
        data={[
          { icon: <RiStarLine size={24} className="text-content-primary" />, title: 'Zero fees', description: 'You receive 100% of the deposited amount' },
          { icon: <RiGlobalLine size={24} className="text-content-primary" />, title: 'Send & receive', description: 'Transfer dollars from accounts in your name' },
          { icon: <RiFlashlightLine size={24} className="text-content-primary" />, title: 'Fast delivery', description: 'Between a few hours and 3 business days' },
        ]}
      />

      <Banner variant="neutral" title="Quick Activation" description="We'll run a secure identity check to unlock your banking details." />
    </>
  )

  return (
    <div className="flex flex-col gap-[var(--token-spacing-lg)]">
      <div>
        <SectionLabel>mobile (full-screen, sticky footer)</SectionLabel>
        <div className="h-[640px] max-w-[393px] rounded-[var(--token-radius-lg)] overflow-hidden border border-shell-border">
          <LayoutProvider isDesktop={false} level={2}>
            <FeatureLayout
              imageSrc="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=400&fit=crop"
              imageAlt="Feature preview"
              onClose={() => {}}
              imageOverlay={
                <Badge variant="lime" icon={<RiFlashlightLine size={16} />}>New</Badge>
              }
            >
              {featureContent}
              <StickyFooter>
                <Button fullWidth>Activate my USD account</Button>
              </StickyFooter>
            </FeatureLayout>
          </LayoutProvider>
        </div>
      </div>
      <div>
        <SectionLabel>desktop (card, inline right-aligned footer)</SectionLabel>
        <div className="max-w-[520px] rounded-[var(--token-radius-lg)] overflow-hidden border border-shell-border">
          <LayoutProvider isDesktop={true}>
            <FeatureLayout
              imageSrc="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=400&fit=crop"
              imageAlt="Feature preview"
              onClose={() => {}}
              imageOverlay={
                <Badge variant="lime" icon={<RiFlashlightLine size={16} />}>New</Badge>
              }
            >
              {featureContent}
              <StickyFooter>
                <Button>Activate my USD account</Button>
              </StickyFooter>
            </FeatureLayout>
          </LayoutProvider>
        </div>
      </div>
    </div>
  )
}
