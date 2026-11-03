import type { Locale } from './config'

/**
 * Privacy policy, per language. Kept out of the main dictionaries because it is long and
 * structured (sections of paragraphs). `updated` is an ISO day shown on the page.
 */
export interface PrivacySection {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export interface PrivacyContent {
  title: string
  updated: string
  intro: string
  sections: PrivacySection[]
}

const CONTROLLER = 'Sobremesas & Companhia'
const EMAIL = 'sobremesascompanhia@gmail.com'
const UPDATED = '2026-11-03'

const pt: PrivacyContent = {
  title: 'Política de privacidade',
  updated: UPDATED,
  intro: `Esta página explica que dados pessoais a ${CONTROLLER} recolhe quando usa este site (sobremesasecompanhia.pt e dev.sobremesasecompanhia.pt), para quê, com quem os partilha e que direitos tem. Tratamos os seus dados de acordo com o Regulamento Geral sobre a Proteção de Dados (RGPD).`,
  sections: [
    {
      title: 'Quem é responsável',
      paragraphs: [`A responsável pelo tratamento é a ${CONTROLLER}, em Santo Tirso, Portugal. Para qualquer questão sobre os seus dados escreva para ${EMAIL}.`, 'O site e a plataforma são desenvolvidos e mantidos pela CookieBytes, Lda (Vila Praia de Âncora, Portugal), que atua como subcontratante e só acede aos dados para manter o serviço a funcionar.'],
    },
    {
      title: 'Que dados recolhemos e porquê',
      paragraphs: ['Não precisa de criar conta. Recolhemos apenas o que nos dá quando pede um orçamento ou nos contacta:'],
      bullets: [
        'Pedido de orçamento: nome, e-mail, telemóvel (opcional), ocasião, data e hora do evento, número de convidados, o que pretende, modo de entrega e morada (se pedir entrega), alergias e restrições alimentares que nos indique, notas e fotografias de inspiração que envie.',
        'Formulário de contacto: nome, e-mail, telemóvel (opcional) e a mensagem.',
        'Conversa por e-mail: as mensagens que trocamos consigo sobre a encomenda, incluindo as suas respostas aos nossos e-mails.',
        'Dados técnicos mínimos: o endereço IP e o navegador, usados apenas para proteger os formulários contra abuso (limites de envio) e nos registos do servidor.',
      ],
    },
    {
      title: 'Finalidade e fundamento',
      paragraphs: ['Usamos estes dados para responder ao seu pedido, preparar uma proposta, organizar e entregar a encomenda e falar consigo sobre ela. O fundamento é a execução de um contrato ou de diligências pré-contratuais a seu pedido (art. 6.º, n.º 1, al. b) do RGPD). As alergias e restrições alimentares são tratadas com base no seu consentimento, ao indicá-las no formulário, e apenas para a segurança da encomenda (art. 9.º, n.º 2, al. a)). Não usamos os seus dados para marketing nem para decisões automatizadas.'],
    },
    {
      title: 'Serviços Google que usamos',
      paragraphs: [
        'A conversa sobre a sua encomenda é feita por e-mail a partir da conta Google da Sobremesas & Companhia. Para isso, a nossa plataforma liga-se, com autorização da própria empresa, ao Gmail (para enviar os e-mails da encomenda e ler as respostas que nos envia), aos Contactos Google (para guardar o seu nome, e-mail e telemóvel como contacto da empresa) e ao Google Calendar (para marcar a data da encomenda na agenda da empresa).',
        'A utilização e transferência de informação recebida das APIs da Google pela plataforma respeitam a Google API Services User Data Policy, incluindo os requisitos de Utilização Limitada (Limited Use). Os dados obtidos através das APIs da Google são usados apenas para gerir as encomendas e a comunicação consigo; nunca são vendidos, usados para publicidade, nem partilhados com terceiros fora dos subcontratantes indicados abaixo.',
      ],
    },
    {
      title: 'Com quem partilhamos',
      paragraphs: ['Só com fornecedores que precisamos para o serviço funcionar, todos vinculados por contrato ao RGPD:'],
      bullets: [
        'Google (Gmail, Contactos, Calendar) — a conta da empresa, como descrito acima.',
        'Fly.io (Amesterdão, Países Baixos) — alojamento da aplicação, da base de dados e das fotografias.',
        'Vercel — alojamento das páginas do site.',
        'Resend (região UE) — envio dos e-mails de acesso da equipa.',
        'CookieBytes, Lda — manutenção técnica.',
      ],
    },
    {
      title: 'Durante quanto tempo',
      paragraphs: ['Guardamos os dados da encomenda e da conversa enquanto forem necessários para a executar e, depois, pelo prazo exigido por obrigações fiscais e legais (em regra até 10 anos para documentos com relevância contabilística). Fotografias de inspiração enviadas sem concluir um pedido são apagadas automaticamente em 24 horas. Mensagens do formulário de contacto são apagadas até 12 meses depois de tratadas.'],
    },
    {
      title: 'Os seus direitos',
      paragraphs: [`Pode pedir-nos acesso aos seus dados, a sua correção, eliminação ou portabilidade, ou opor-se ao tratamento, escrevendo para ${EMAIL}. Pode também apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD, www.cnpd.pt).`],
    },
    {
      title: 'Cookies',
      paragraphs: ['O site público não usa cookies de rastreio nem de publicidade. Usamos apenas cookies estritamente necessários: um cookie temporário (24 horas) que liga as fotografias que envia ao seu pedido e, na área reservada à equipa, os cookies de sessão de quem lá entra.'],
    },
    {
      title: 'Alterações',
      paragraphs: ['Se esta política mudar, publicamos a nova versão nesta página com a data atualizada.'],
    },
  ],
}

const en: PrivacyContent = {
  title: 'Privacy policy',
  updated: UPDATED,
  intro: `This page explains which personal data ${CONTROLLER} collects when you use this website (sobremesasecompanhia.pt and dev.sobremesasecompanhia.pt), why, who it is shared with and what your rights are. We process your data in accordance with the General Data Protection Regulation (GDPR).`,
  sections: [
    {
      title: 'Who is responsible',
      paragraphs: [`The data controller is ${CONTROLLER}, Santo Tirso, Portugal. For any question about your data write to ${EMAIL}.`, 'The website and platform are built and maintained by CookieBytes, Lda (Vila Praia de Âncora, Portugal), acting as a processor that only accesses data to keep the service running.'],
    },
    {
      title: 'What we collect and why',
      paragraphs: ['You do not need an account. We only collect what you give us when you request a quote or contact us:'],
      bullets: [
        'Quote request: name, e-mail, phone (optional), occasion, event date and time, number of guests, what you would like, delivery mode and address (if you ask for delivery), allergies and dietary restrictions you tell us about, notes and inspiration photos you send.',
        'Contact form: name, e-mail, phone (optional) and your message.',
        'E-mail conversation: the messages we exchange with you about the order, including your replies to our e-mails.',
        'Minimal technical data: IP address and browser, used only to protect the forms against abuse (rate limits) and in server logs.',
      ],
    },
    {
      title: 'Purpose and legal basis',
      paragraphs: ['We use this data to answer your request, prepare a proposal, organise and deliver the order and talk to you about it. The legal basis is the performance of a contract or pre-contractual steps at your request (Art. 6(1)(b) GDPR). Allergies and dietary restrictions are processed on the basis of your consent, given when you enter them in the form, and only for the safety of the order (Art. 9(2)(a)). We do not use your data for marketing or automated decision-making.'],
    },
    {
      title: 'Google services we use',
      paragraphs: [
        "The conversation about your order happens by e-mail from Sobremesas & Companhia's Google account. For that, our platform connects — with the business's own authorisation — to Gmail (to send the order e-mails and read the replies you send us), Google Contacts (to keep your name, e-mail and phone as a business contact) and Google Calendar (to put the order date in the business's calendar).",
        "The platform's use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. Data obtained through Google APIs is used only to manage orders and the communication with you; it is never sold, used for advertising, or shared with third parties other than the processors listed below.",
      ],
    },
    {
      title: 'Who we share it with',
      paragraphs: ['Only with providers we need to run the service, all bound by GDPR-compliant agreements:'],
      bullets: [
        "Google (Gmail, Contacts, Calendar) — the business's account, as described above.",
        'Fly.io (Amsterdam, Netherlands) — hosting of the application, database and photos.',
        'Vercel — hosting of the website pages.',
        'Resend (EU region) — delivery of the staff sign-in e-mails.',
        'CookieBytes, Lda — technical maintenance.',
      ],
    },
    {
      title: 'How long we keep it',
      paragraphs: ['We keep order and conversation data for as long as needed to fulfil the order and then for the period required by tax and legal obligations (generally up to 10 years for documents with accounting relevance). Inspiration photos uploaded without completing a request are deleted automatically after 24 hours. Contact-form messages are deleted within 12 months of being handled.'],
    },
    {
      title: 'Your rights',
      paragraphs: [`You may ask us for access to your data, its correction, deletion or portability, or object to the processing, by writing to ${EMAIL}. You may also lodge a complaint with the Portuguese supervisory authority, the Comissão Nacional de Proteção de Dados (CNPD, www.cnpd.pt).`],
    },
    {
      title: 'Cookies',
      paragraphs: ['The public website uses no tracking or advertising cookies. We only use strictly necessary cookies: a temporary cookie (24 hours) that links the photos you upload to your request and, in the staff area, the session cookies of whoever signs in.'],
    },
    {
      title: 'Changes',
      paragraphs: ['If this policy changes, we publish the new version on this page with an updated date.'],
    },
  ],
}

const es: PrivacyContent = {
  title: 'Política de privacidad',
  updated: UPDATED,
  intro: `Esta página explica qué datos personales recoge ${CONTROLLER} cuando usa este sitio web (sobremesasecompanhia.pt y dev.sobremesasecompanhia.pt), con qué fin, con quién los comparte y qué derechos tiene. Tratamos sus datos conforme al Reglamento General de Protección de Datos (RGPD).`,
  sections: [
    {
      title: 'Quién es responsable',
      paragraphs: [`La responsable del tratamiento es ${CONTROLLER}, Santo Tirso, Portugal. Para cualquier cuestión sobre sus datos escriba a ${EMAIL}.`, 'El sitio y la plataforma están desarrollados y mantenidos por CookieBytes, Lda (Vila Praia de Âncora, Portugal), que actúa como encargada del tratamiento y solo accede a los datos para mantener el servicio en funcionamiento.'],
    },
    {
      title: 'Qué datos recogemos y por qué',
      paragraphs: ['No necesita crear una cuenta. Solo recogemos lo que nos facilita al pedir un presupuesto o contactarnos:'],
      bullets: [
        'Solicitud de presupuesto: nombre, correo electrónico, teléfono (opcional), ocasión, fecha y hora del evento, número de invitados, lo que desea, modo de entrega y dirección (si pide entrega), alergias y restricciones alimentarias que nos indique, notas y fotos de inspiración que envíe.',
        'Formulario de contacto: nombre, correo electrónico, teléfono (opcional) y su mensaje.',
        'Conversación por correo: los mensajes que intercambiamos con usted sobre el pedido, incluidas sus respuestas a nuestros correos.',
        'Datos técnicos mínimos: dirección IP y navegador, usados solo para proteger los formularios contra abusos (límites de envío) y en los registros del servidor.',
      ],
    },
    {
      title: 'Finalidad y base jurídica',
      paragraphs: ['Usamos estos datos para responder a su solicitud, preparar una propuesta, organizar y entregar el pedido y comunicarnos con usted al respecto. La base jurídica es la ejecución de un contrato o de medidas precontractuales a petición suya (art. 6.1.b del RGPD). Las alergias y restricciones alimentarias se tratan sobre la base de su consentimiento, otorgado al indicarlas en el formulario, y solo para la seguridad del pedido (art. 9.2.a). No usamos sus datos para marketing ni para decisiones automatizadas.'],
    },
    {
      title: 'Servicios de Google que usamos',
      paragraphs: [
        'La conversación sobre su pedido se realiza por correo electrónico desde la cuenta de Google de Sobremesas & Companhia. Para ello, nuestra plataforma se conecta, con autorización de la propia empresa, a Gmail (para enviar los correos del pedido y leer las respuestas que nos envía), a Contactos de Google (para guardar su nombre, correo y teléfono como contacto de la empresa) y a Google Calendar (para anotar la fecha del pedido en la agenda de la empresa).',
        'El uso y la transferencia de la información recibida de las API de Google por parte de la plataforma cumplen la Google API Services User Data Policy, incluidos los requisitos de Uso Limitado (Limited Use). Los datos obtenidos a través de las API de Google se usan únicamente para gestionar los pedidos y la comunicación con usted; nunca se venden, se usan para publicidad ni se comparten con terceros distintos de los encargados indicados abajo.',
      ],
    },
    {
      title: 'Con quién los compartimos',
      paragraphs: ['Solo con los proveedores necesarios para que el servicio funcione, todos vinculados por contrato conforme al RGPD:'],
      bullets: [
        'Google (Gmail, Contactos, Calendar): la cuenta de la empresa, como se describe arriba.',
        'Fly.io (Ámsterdam, Países Bajos): alojamiento de la aplicación, la base de datos y las fotos.',
        'Vercel: alojamiento de las páginas del sitio.',
        'Resend (región UE): envío de los correos de acceso del equipo.',
        'CookieBytes, Lda: mantenimiento técnico.',
      ],
    },
    {
      title: 'Durante cuánto tiempo',
      paragraphs: ['Conservamos los datos del pedido y de la conversación mientras sean necesarios para ejecutarlo y, después, durante el plazo exigido por obligaciones fiscales y legales (por regla general hasta 10 años para documentos con relevancia contable). Las fotos de inspiración subidas sin completar una solicitud se eliminan automáticamente a las 24 horas. Los mensajes del formulario de contacto se eliminan en un plazo de 12 meses desde su tramitación.'],
    },
    {
      title: 'Sus derechos',
      paragraphs: [`Puede solicitarnos el acceso a sus datos, su rectificación, supresión o portabilidad, u oponerse al tratamiento, escribiendo a ${EMAIL}. También puede presentar una reclamación ante la autoridad de control portuguesa, la Comissão Nacional de Proteção de Dados (CNPD, www.cnpd.pt).`],
    },
    {
      title: 'Cookies',
      paragraphs: ['El sitio público no usa cookies de seguimiento ni de publicidad. Solo usamos cookies estrictamente necesarias: una cookie temporal (24 horas) que vincula las fotos que sube a su solicitud y, en el área reservada al equipo, las cookies de sesión de quien accede.'],
    },
    {
      title: 'Cambios',
      paragraphs: ['Si esta política cambia, publicaremos la nueva versión en esta página con la fecha actualizada.'],
    },
  ],
}

const fr: PrivacyContent = {
  title: 'Politique de confidentialité',
  updated: UPDATED,
  intro: `Cette page explique quelles données personnelles ${CONTROLLER} collecte lorsque vous utilisez ce site (sobremesasecompanhia.pt et dev.sobremesasecompanhia.pt), dans quel but, avec qui elles sont partagées et quels sont vos droits. Nous traitons vos données conformément au Règlement général sur la protection des données (RGPD).`,
  sections: [
    {
      title: 'Qui est responsable',
      paragraphs: [`Le responsable du traitement est ${CONTROLLER}, Santo Tirso, Portugal. Pour toute question sur vos données, écrivez à ${EMAIL}.`, "Le site et la plateforme sont développés et maintenus par CookieBytes, Lda (Vila Praia de Âncora, Portugal), qui agit en tant que sous-traitant et n'accède aux données que pour assurer le fonctionnement du service."],
    },
    {
      title: 'Quelles données nous collectons et pourquoi',
      paragraphs: ["Vous n'avez pas besoin de créer un compte. Nous ne collectons que ce que vous nous donnez lorsque vous demandez un devis ou nous contactez :"],
      bullets: [
        "Demande de devis : nom, e-mail, téléphone (facultatif), occasion, date et heure de l'événement, nombre d'invités, ce que vous souhaitez, mode de livraison et adresse (si vous demandez une livraison), allergies et restrictions alimentaires que vous nous indiquez, notes et photos d'inspiration que vous envoyez.",
        'Formulaire de contact : nom, e-mail, téléphone (facultatif) et votre message.',
        'Conversation par e-mail : les messages que nous échangeons avec vous au sujet de la commande, y compris vos réponses à nos e-mails.',
        'Données techniques minimales : adresse IP et navigateur, utilisés uniquement pour protéger les formulaires contre les abus (limites d\'envoi) et dans les journaux du serveur.',
      ],
    },
    {
      title: 'Finalité et base juridique',
      paragraphs: ["Nous utilisons ces données pour répondre à votre demande, préparer une proposition, organiser et livrer la commande et échanger avec vous à son sujet. La base juridique est l'exécution d'un contrat ou de mesures précontractuelles prises à votre demande (art. 6, par. 1, b) du RGPD). Les allergies et restrictions alimentaires sont traitées sur la base de votre consentement, donné lorsque vous les indiquez dans le formulaire, et uniquement pour la sécurité de la commande (art. 9, par. 2, a)). Nous n'utilisons pas vos données à des fins de marketing ni pour des décisions automatisées."],
    },
    {
      title: 'Services Google que nous utilisons',
      paragraphs: [
        "La conversation concernant votre commande se fait par e-mail depuis le compte Google de Sobremesas & Companhia. Pour cela, notre plateforme se connecte, avec l'autorisation de l'entreprise elle-même, à Gmail (pour envoyer les e-mails de la commande et lire les réponses que vous nous envoyez), à Google Contacts (pour conserver votre nom, e-mail et téléphone comme contact de l'entreprise) et à Google Agenda (pour inscrire la date de la commande dans l'agenda de l'entreprise).",
        "L'utilisation et le transfert des informations reçues des API Google par la plateforme respectent la Google API Services User Data Policy, y compris les exigences d'utilisation limitée (Limited Use). Les données obtenues via les API Google ne servent qu'à gérer les commandes et la communication avec vous ; elles ne sont jamais vendues, utilisées à des fins publicitaires ni partagées avec des tiers autres que les sous-traitants indiqués ci-dessous.",
      ],
    },
    {
      title: 'Avec qui nous les partageons',
      paragraphs: ['Uniquement avec les prestataires nécessaires au fonctionnement du service, tous liés par contrat conformément au RGPD :'],
      bullets: [
        "Google (Gmail, Contacts, Agenda) — le compte de l'entreprise, comme décrit ci-dessus.",
        "Fly.io (Amsterdam, Pays-Bas) — hébergement de l'application, de la base de données et des photos.",
        'Vercel — hébergement des pages du site.',
        "Resend (région UE) — envoi des e-mails de connexion de l'équipe.",
        'CookieBytes, Lda — maintenance technique.',
      ],
    },
    {
      title: 'Pendant combien de temps',
      paragraphs: ["Nous conservons les données de la commande et de la conversation tant qu'elles sont nécessaires à son exécution, puis pendant la durée exigée par les obligations fiscales et légales (en général jusqu'à 10 ans pour les documents à valeur comptable). Les photos d'inspiration envoyées sans finaliser une demande sont supprimées automatiquement après 24 heures. Les messages du formulaire de contact sont supprimés dans les 12 mois suivant leur traitement."],
    },
    {
      title: 'Vos droits',
      paragraphs: [`Vous pouvez nous demander l'accès à vos données, leur rectification, leur effacement ou leur portabilité, ou vous opposer au traitement, en écrivant à ${EMAIL}. Vous pouvez aussi déposer une réclamation auprès de l'autorité de contrôle portugaise, la Comissão Nacional de Proteção de Dados (CNPD, www.cnpd.pt).`],
    },
    {
      title: 'Cookies',
      paragraphs: ["Le site public n'utilise aucun cookie de suivi ni de publicité. Nous n'utilisons que des cookies strictement nécessaires : un cookie temporaire (24 heures) qui relie les photos que vous envoyez à votre demande et, dans l'espace réservé à l'équipe, les cookies de session des personnes qui s'y connectent."],
    },
    {
      title: 'Modifications',
      paragraphs: ['Si cette politique change, nous publions la nouvelle version sur cette page avec la date mise à jour.'],
    },
  ],
}

const privacy: Record<Locale, PrivacyContent> = { pt, en, es, fr }

export function getPrivacy(locale: Locale): PrivacyContent {
  return privacy[locale]
}
