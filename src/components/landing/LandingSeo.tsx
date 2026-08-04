import { useEffect } from "react";
import { FAQ_ITEMS } from "@/components/landing/faqData";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/siteConfig";

const OG_IMAGE = `${SITE_URL}/og-image.svg`;

export function LandingSeo() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${SITE_NAME} - ${SITE_TAGLINE}`;

    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };

    const orgJsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/app-icon.png`,
      description: SITE_DESCRIPTION,
      contactPoint: {
        "@type": "ContactPoint",
        email: "matechnology02@gmail.com",
        contactType: "customer support",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi", "Gujarati"],
      },
    };

    const appJsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Android",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        description: "Free 14-day trial for new societies",
      },
      description: SITE_DESCRIPTION,
    };

    const scripts = [faqJsonLd, orgJsonLd, appJsonLd].map((data) => {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.setAttribute("data-landing-seo", "true");
      el.textContent = JSON.stringify(data);
      document.head.appendChild(el);
      return el;
    });

    const setMeta = (key: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", SITE_DESCRIPTION);
    setMeta("keywords", "society management app, apartment management, visitor management, maintenance billing, housing society India, Gujarat");
    setMeta("robots", "index, follow");
    setMeta("og:title", `${SITE_NAME} - ${SITE_TAGLINE}`, true);
    setMeta("og:description", SITE_DESCRIPTION, true);
    setMeta("og:type", "website", true);
    setMeta("og:url", SITE_URL, true);
    setMeta("og:image", OG_IMAGE, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", `${SITE_NAME} - ${SITE_TAGLINE}`);
    setMeta("twitter:description", SITE_DESCRIPTION);
    setMeta("twitter:image", OG_IMAGE);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = SITE_URL;

    return () => {
      document.title = previousTitle;
      scripts.forEach((s) => s.remove());
    };
  }, []);

  return null;
}
