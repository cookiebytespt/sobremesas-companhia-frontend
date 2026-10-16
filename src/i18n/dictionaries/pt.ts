// Portuguese is the reference dictionary: its shape defines `Dictionary`, so the other
// languages fail to type-check if a key is missing. Placeholders like {name} are filled with fmt().
const pt = {
  meta: {
    title: "Sobremesas & Companhia: a sua área de cliente",
    description: "Peça orçamentos, acompanhe os seus pedidos e fale connosco. Sobremesas & Companhia, Santo Tirso.",
  },
  common: {
    brand: "Sobremesas & Companhia",
    tagline: "Pequena produção, com dedicação",
    language: "Idioma",
    signIn: "Entrar",
    signUp: "Criar conta",
    signOut: "Terminar sessão",
    account: "A minha conta",
    backoffice: "Backoffice",
    site: "Ver o site",
    save: "Guardar",
    cancel: "Cancelar",
    loading: "A carregar…",
    retry: "Tentar novamente",
    error: "Ocorreu um erro. Tente novamente.",
    menu: "Menu",
    closeMenu: "Fechar menu",
    siteBy: "Site por",
  },
  home: {
    kicker: "Plataforma",
    title: "A sua área de cliente está a nascer.",
    intro:
      "Em breve vai poder pedir orçamentos com fotografias das suas ideias, acompanhar cada pedido e falar connosco aqui. Até lá, continue a usar o site e o WhatsApp.",
    request: "Pedir orçamento",
    requestSoon: "Pedidos de orçamento — em breve",
    landing: "Ir para o site",
    haveAccount: "Já tem conta?",
  },
  account: {
    title: "A minha conta",
    welcome: "Olá, {name}",
    requests: "Os meus pedidos",
    requestsEmpty: "Ainda não tem pedidos. Quando pedir um orçamento, acompanha-o aqui.",
    settings: "Definições",
    profile: "Os seus dados",
    name: "Nome",
    email: "Email",
    phone: "Telemóvel",
    phoneHint: "Usamos apenas para falar consigo sobre os seus pedidos.",
    language: "Idioma preferido",
    languageHint: "A língua desta área e dos emails que lhe enviamos.",
    saved: "Dados guardados.",
    emailUnverified: "Email por confirmar",
    emailUnverifiedHint: "Confirme o seu email através da ligação que lhe enviámos para associarmos pedidos feitos sem conta.",
    danger: "Apagar conta",
    dangerHint: "Os seus pedidos ficam anónimos e deixa de conseguir entrar. Esta ação não pode ser anulada.",
    dangerConfirm: "Apagar a minha conta",
    deleted: "A sua conta foi apagada.",
    signInRequired: "Precisa de entrar para ver a sua conta.",
  },
  footer: {
    rights: "Todos os direitos reservados.",
    privacy: "Privacidade",
  },
} as const;

export type Dictionary = DeepWritable<typeof pt>;

// Lets the other languages be typed against the Portuguese shape without `as const` literals.
type DeepWritable<T> = T extends string ? string : { -readonly [K in keyof T]: DeepWritable<T[K]> };

export default pt as Dictionary;
