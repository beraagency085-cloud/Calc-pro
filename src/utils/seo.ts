import { CALCULATOR_GUIDES } from '../data/calculatorGuideData';
import { StaticPageType } from '../components/pages/StaticPagesModal';

export const updatePageMeta = (
  activeCalcId?: string,
  staticPage?: StaticPageType | null
) => {
  let title = 'CalcPro - Professional Online Calculators';
  let description =
    'Comprehensive suite of fast, accurate, and professional calculators for EMI, SIP, Mortgage, BMI, Age, Calories, and more.';

  if (staticPage === 'about') {
    title = 'About Us & Editorial Standards | CalcPro Precision Systems';
    description =
      'Learn about CalcPro commitment to financial calculation accuracy, peer-reviewed algorithms, Google E-E-A-T and YMYL standards.';
  } else if (staticPage === 'contact') {
    title = 'Contact Support & Technical Inquiries | CalcPro';
    description =
      'Get in touch with CalcPro mathematical and software engineering team for formula feedback, feature requests, or technical support.';
  } else if (staticPage === 'privacy') {
    title = 'Privacy Protocol & 100% Client-Side Guarantee | CalcPro';
    description =
      'Read our zero-data-collection privacy policy. All loan calculations and health metrics are executed locally in your browser with zero remote transmission.';
  } else if (staticPage === 'terms') {
    title = 'Terms of Service & Financial Disclaimer | CalcPro';
    description =
      'CalcPro terms of computation and regulatory disclaimers for financial and medical health assessment modules.';
  } else if (activeCalcId && CALCULATOR_GUIDES[activeCalcId]) {
    const guide = CALCULATOR_GUIDES[activeCalcId];
    title = guide.seoTitle;
    description = guide.metaDescription;
  }

  // Set Document Title
  document.title = title;

  // Set Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // Set OG Title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', title);

  // Set OG Description
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute('content', description);

  // Set Twitter Title
  let twTitle = document.querySelector('meta[name="twitter:title"]');
  if (!twTitle) {
    twTitle = document.createElement('meta');
    twTitle.setAttribute('name', 'twitter:title');
    document.head.appendChild(twTitle);
  }
  twTitle.setAttribute('content', title);

  // Set Twitter Description
  let twDesc = document.querySelector('meta[name="twitter:description"]');
  if (!twDesc) {
    twDesc = document.createElement('meta');
    twDesc.setAttribute('name', 'twitter:description');
    document.head.appendChild(twDesc);
  }
  twDesc.setAttribute('content', description);
};
