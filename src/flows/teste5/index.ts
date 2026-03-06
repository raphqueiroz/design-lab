import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'
import Screen1_Welcome from './Screen1_Welcome'
import Screen2_SignUp from './Screen2_SignUp'
import Screen3_VerifyEmail from './Screen3_VerifyEmail'
import Screen4_SignIn from './Screen4_SignIn'
import Screen5_Success from './Screen5_Success'

const screenDefs = [
  {
    id: 'teste5-welcome',
    title: 'Bem-vindo',
    description: 'Landing screen with hero image, value propositions, and auth entry points.',
    componentsUsed: ['FeatureLayout', 'Summary', 'GroupHeader', 'Button', 'Link', 'Text', 'Stack'],
    component: Screen1_Welcome,
    interactiveElements: [
      { id: 'btn-criar-conta', component: 'Button', label: 'Criar conta' },
      { id: 'link-ja-tenho-conta', component: 'Link', label: 'Já tenho conta' },
    ],
  },
  {
    id: 'teste5-signup',
    title: 'Criar conta',
    description: 'Account creation form with name, email, password, and terms acceptance.',
    componentsUsed: ['BaseLayout', 'Header', 'TextInput', 'Checkbox', 'Button', 'Link', 'Text', 'Stack', 'StickyFooter'],
    component: Screen2_SignUp,
    interactiveElements: [
      { id: 'btn-criar-conta', component: 'Button', label: 'Criar conta' },
      { id: 'link-termos', component: 'Link', label: 'Termos de Uso' },
      { id: 'link-privacidade', component: 'Link', label: 'Política de Privacidade' },
    ],
  },
  {
    id: 'teste5-verify-email',
    title: 'Verificar e-mail',
    description: 'Email verification with 6-digit PIN input and resend option.',
    componentsUsed: ['BaseLayout', 'Header', 'PinInput', 'Banner', 'Button', 'Link', 'Text', 'Stack', 'StickyFooter'],
    component: Screen3_VerifyEmail,
    interactiveElements: [
      { id: 'btn-verificar', component: 'Button', label: 'Verificar' },
      { id: 'link-reenviar', component: 'Link', label: 'Reenviar código' },
    ],
  },
  {
    id: 'teste5-signin',
    title: 'Entrar',
    description: 'Login form with email and password fields, forgot password and signup links.',
    componentsUsed: ['BaseLayout', 'Header', 'TextInput', 'Button', 'Link', 'Text', 'Stack', 'StickyFooter'],
    component: Screen4_SignIn,
    interactiveElements: [
      { id: 'btn-entrar', component: 'Button', label: 'Entrar' },
      { id: 'link-esqueci-senha', component: 'Link', label: 'Esqueci minha senha' },
      { id: 'link-criar-conta', component: 'Link', label: 'Criar conta' },
    ],
  },
  {
    id: 'teste5-success',
    title: 'Conta criada',
    description: 'Account created confirmation with success animation.',
    componentsUsed: ['FeedbackLayout', 'Button', 'Text', 'Stack', 'StickyFooter'],
    component: Screen5_Success,
    interactiveElements: [
      { id: 'btn-ir-inicio', component: 'Button', label: 'Ir para o início' },
    ],
  },
]

// Register each screen as a standalone page
const seen = new Set<string>()
for (const s of screenDefs) {
  const pid = s.id
  if (seen.has(pid)) continue
  seen.add(pid)
  registerPage({
    id: pid,
    name: s.title,
    description: s.description,
    area: 'onboarding',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
  })
}

registerFlow({
  id: 'teste5',
  name: 'Auth Flow',
  description: 'Onboarding authentication flow with sign up, email verification, and sign in.',
  domain: 'onboarding',
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// Bootstrap flow graph
{
  const nodes = [
    // Column 1: Entry + Welcome
    { id: 'entry', type: 'entry-point', position: { x: 300, y: 0 }, data: { label: 'Entry Point', screenId: null, nodeType: 'entry-point' } as FlowNodeData },
    { id: 'welcome', type: 'screen', position: { x: 300, y: 120 }, data: { label: 'Bem-vindo', screenId: 'teste5-welcome', nodeType: 'screen', description: 'Landing screen with hero image and auth options' } as FlowNodeData },

    // Column 1: Sign Up path
    { id: 'action-criar-conta', type: 'action', position: { x: 150, y: 280 }, data: { label: 'Criar conta', screenId: null, nodeType: 'action', actionType: 'navigate', actionTarget: 'Button: Criar conta' } as FlowNodeData },
    { id: 'signup', type: 'screen', position: { x: 150, y: 400 }, data: { label: 'Criar conta', screenId: 'teste5-signup', nodeType: 'screen', description: 'Account creation form' } as FlowNodeData },
    { id: 'api-create-account', type: 'api-call', position: { x: 150, y: 560 }, data: { label: 'Create account', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/auth/register' } as FlowNodeData },
    { id: 'verify-email', type: 'screen', position: { x: 150, y: 700 }, data: { label: 'Verificar e-mail', screenId: 'teste5-verify-email', nodeType: 'screen', description: 'Email verification with 6-digit PIN' } as FlowNodeData },
    { id: 'api-verify', type: 'api-call', position: { x: 150, y: 860 }, data: { label: 'Verify code', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/auth/verify-email' } as FlowNodeData },
    { id: 'decision-valid', type: 'decision', position: { x: 150, y: 1000 }, data: { label: 'Valid?', screenId: null, nodeType: 'decision', description: 'Is the verification code correct?' } as FlowNodeData },
    { id: 'success', type: 'screen', position: { x: 150, y: 1160 }, data: { label: 'Conta criada', screenId: 'teste5-success', nodeType: 'screen', description: 'Success confirmation' } as FlowNodeData },

    // Column 2: Sign In path
    { id: 'action-ja-tenho-conta', type: 'action', position: { x: 500, y: 280 }, data: { label: 'Já tenho conta', screenId: null, nodeType: 'action', actionType: 'navigate', actionTarget: 'Link: Já tenho conta' } as FlowNodeData },
    { id: 'signin', type: 'screen', position: { x: 500, y: 400 }, data: { label: 'Entrar', screenId: 'teste5-signin', nodeType: 'screen', description: 'Login form with email and password' } as FlowNodeData },
    { id: 'api-auth', type: 'api-call', position: { x: 500, y: 560 }, data: { label: 'Authenticate', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/auth/login' } as FlowNodeData },
    { id: 'decision-auth-ok', type: 'decision', position: { x: 500, y: 700 }, data: { label: 'Auth OK?', screenId: null, nodeType: 'decision', description: 'Are the credentials valid?' } as FlowNodeData },

    // Error node (shared)
    { id: 'error-invalid', type: 'error', position: { x: 400, y: 1000 }, data: { label: 'Invalid credentials', screenId: null, nodeType: 'error', description: 'Show error and return to form' } as FlowNodeData },
  ]

  const edges = [
    // Entry → Welcome
    { id: 'e-entry-welcome', source: 'entry', target: 'welcome', sourceHandle: 'bottom', targetHandle: 'top' },

    // Welcome → Sign Up path
    { id: 'e-welcome-criar', source: 'welcome', target: 'action-criar-conta', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-criar-signup', source: 'action-criar-conta', target: 'signup', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-signup-api', source: 'signup', target: 'api-create-account', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-api-verify-screen', source: 'api-create-account', target: 'verify-email', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-verify-api', source: 'verify-email', target: 'api-verify', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-api-decision', source: 'api-verify', target: 'decision-valid', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-valid-success', source: 'decision-valid', target: 'success', sourceHandle: 'bottom', targetHandle: 'top', label: 'Yes' },
    { id: 'e-valid-error', source: 'decision-valid', target: 'error-invalid', sourceHandle: 'right', targetHandle: 'top', label: 'No' },

    // Welcome → Sign In path
    { id: 'e-welcome-signin', source: 'welcome', target: 'action-ja-tenho-conta', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-signin-action-screen', source: 'action-ja-tenho-conta', target: 'signin', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-signin-api', source: 'signin', target: 'api-auth', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-api-auth-decision', source: 'api-auth', target: 'decision-auth-ok', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-auth-ok-success', source: 'decision-auth-ok', target: 'success', sourceHandle: 'left', targetHandle: 'right', label: 'Yes' },
    { id: 'e-auth-fail', source: 'decision-auth-ok', target: 'error-invalid', sourceHandle: 'bottom', targetHandle: 'right', label: 'No' },

    // Error → back to forms
    { id: 'e-error-verify', source: 'error-invalid', target: 'verify-email', sourceHandle: 'left', targetHandle: 'right' },
    { id: 'e-error-signin', source: 'error-invalid', target: 'signin', sourceHandle: 'top', targetHandle: 'right' },
  ]

  bootstrapFlowGraph('teste5', nodes, edges, 2)
}
