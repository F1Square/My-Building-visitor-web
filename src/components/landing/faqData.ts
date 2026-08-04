export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "pricing",
    question: "How does pricing work?",
    answer:
      "Register your society on the web for free. Choose a Monthly, Yearly, or Lifetime plan inside the MyBuilding Android app and pay securely. Pricing is per society - residents and committee members use the app at no extra per-user charge.",
  },
  {
    id: "security",
    question: "Is our society data secure?",
    answer:
      "Yes. Data is stored on encrypted cloud infrastructure with role-based access. Only authorized admins, committee members, and residents see what they are permitted to. Visitor logs, payments, and documents are protected with secure authentication.",
  },
  {
    id: "who",
    question: "Who can use MyBuilding?",
    answer:
      "Society admins and committee members manage billing, visitors, complaints, and announcements. Residents use the app for payments, guest approvals, and community updates. Security staff can use gate and visitor modules where enabled.",
  },
  {
    id: "ios",
    question: "Is there an iOS app?",
    answer:
      "MyBuilding is available on Android today with the full feature set. iOS is in development. You can still register your society on the web and onboard residents with Android devices right away.",
  },
  {
    id: "trial",
    question: "Can we try before subscribing?",
    answer:
      "Yes. New societies get a 14-day trial with access to core modules so your committee can evaluate workflows before choosing a paid plan.",
  },
];
