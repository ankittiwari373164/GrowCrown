// Policy pages used for payment-gateway (Razorpay) website verification.
// Fill in SUPPORT_EMAIL (and GSTIN if registered) before submitting the site for review.
export const BUSINESS={
  legalName:'Agarwal Global Trader',
  brand:'GlowCrown',
  address:'Farrukhabad, Uttar Pradesh, India',
  phones:['+91 9532671000','+91 9452305700'],
  SUPPORT_EMAIL:'',
  GSTIN:'',
  website:'https://grow-crown.vercel.app',
  updated:'31 October 2026',
};
const contactLine=`${BUSINESS.legalName}, ${BUSINESS.address} · Phone: ${BUSINESS.phones.join(' / ')}${BUSINESS.SUPPORT_EMAIL?' · Email: '+BUSINESS.SUPPORT_EMAIL:''}`;
type Sec=[string,string[]];
export const legal:Record<string,{kicker:string;title:string;intro:string;sections:Sec[]}>={
'/privacy':{kicker:'YOUR INFORMATION',title:'Privacy Policy',intro:`This Privacy Policy explains how ${BUSINESS.legalName} (“GlowCrown”, “we”, “us”) collects, uses, shares and protects your personal information when you visit ${BUSINESS.website}, place an order, make a payment or contact us. By using this website you agree to this policy.`,sections:[
 ['1. Information we collect',['Information you give us: your name, phone number, email address, delivery address, PIN code and any message you send through our contact or enquiry forms.','Order information: products purchased, sizes, order value, order status and delivery details.','Payment information: when you pay online, payment is processed by our payment partner Razorpay Software Private Limited. Card, UPI, net-banking and wallet details are entered on Razorpay’s secure, PCI-DSS compliant pages. We do not collect or store your full card number, CVV, UPI PIN or banking passwords; we only receive a payment reference, payment status and the amount paid.','Technical information: IP address, browser and device type, pages visited and basic cookies needed for the website, your shopping bag and your wishlist to work.']],
 ['2. How we use your information',['To process and deliver your orders, issue invoices and handle returns, exchanges and refunds.','To verify payments and prevent fraud or misuse of the website.','To respond to your questions and provide customer support by phone, WhatsApp or email.','To send order and delivery updates. We send promotional messages only if you have agreed to receive them, and you can opt out at any time.','To meet our legal, tax and accounting obligations.']],
 ['3. Sharing of information',['We do not sell or rent your personal information.','We share only the information required with: payment processors (Razorpay) to complete payments and refunds; courier and logistics partners to deliver your order; Amazon, when you choose to buy one of our products on Amazon.in, under Amazon’s own privacy notice; and government or law-enforcement authorities when required by law.']],
 ['4. Cookies',['We use essential cookies and your browser’s local storage to keep your bag, wishlist and sign-in working. You can clear or block cookies in your browser settings, but some features may then stop working.']],
 ['5. Data security and retention',['Our website is served over HTTPS (SSL). Account and order records are stored with access controls. We keep personal information only as long as needed to provide our services and to comply with law (for example, tax records), after which it is deleted or anonymised.']],
 ['6. Your rights',['You may ask us to access, correct or delete your personal information, or withdraw consent for marketing, by contacting us using the details below. We will respond within a reasonable time and in line with the Digital Personal Data Protection Act, 2023 and other applicable Indian law.']],
 ['7. Children',['Our website is intended for users aged 18 and above. We do not knowingly collect information from children.']],
 ['8. Changes to this policy',['We may update this policy from time to time. The latest version will always be on this page with its updated date.']],
 ['9. Contact / Grievance officer',[contactLine,'For privacy concerns or complaints, contact us with the subject “Privacy”. We aim to acknowledge complaints within 48 hours and resolve them within 30 days.']]]},
'/terms':{kicker:'SHOPPING WITH GLOWCROWN',title:'Terms & Conditions',intro:`These terms govern your use of ${BUSINESS.website}, operated by ${BUSINESS.legalName}, ${BUSINESS.address}. By browsing the website or placing an order you accept these terms.`,sections:[
 ['1. Products and pricing',['All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise. Product colours may vary slightly from photographs due to lighting and screen settings.','We may change prices, offers and product availability without notice. If an item is priced incorrectly, we may cancel the order and refund any amount paid in full.']],
 ['2. Orders',['An order is confirmed only after payment is successful (or, for cash on delivery, after we confirm it). We may refuse or cancel an order for reasons including stock unavailability, pricing errors, incomplete address details or suspected fraud; any payment received will be refunded.']],
 ['3. Payments',['Online payments are processed securely by Razorpay using UPI, debit/credit cards, net banking and wallets. We do not store card details. Payment-gateway terms of Razorpay and your bank also apply.']],
 ['4. Purchases on Amazon',['Some products link to our listings on Amazon.in. Orders placed on Amazon are sold, delivered, returned and refunded under Amazon’s terms and policies.']],
 ['5. Shipping, returns and refunds',['Delivery, cancellation, return and refund rules are set out in our Shipping Policy and Refund & Cancellation Policy, which form part of these terms.']],
 ['6. Use of the website',['You agree not to misuse the website, attempt unauthorised access or copy our content, images or brand name for commercial use without written permission. All content is the property of GlowCrown / Agarwal Global Trader.']],
 ['7. Limitation of liability',['To the extent allowed by law, our liability for any order is limited to the amount you paid for that order.']],
 ['8. Governing law',['These terms are governed by the laws of India. Courts at Farrukhabad, Uttar Pradesh shall have jurisdiction.']],
 ['9. Contact',[contactLine]]]},
'/returns':{kicker:'CUSTOMER CARE',title:'Refund & Cancellation Policy',intro:'We want you to love what you buy. This policy explains how cancellations, returns, exchanges and refunds work for orders placed directly on our website.',sections:[
 ['1. Cancellations',['You can cancel an order before it is dispatched by calling or messaging us with your order number. Prepaid orders cancelled before dispatch are refunded in full.','Once an order has been dispatched it cannot be cancelled, but you may request a return after delivery as described below.']],
 ['2. Returns and exchanges',['Return or exchange requests must be raised within 7 days of delivery.','Items must be unused, unwashed and unaltered, with original tags and packaging.','For a damaged, defective or wrong item, please share your order number and clear photos/unboxing video within 48 hours of delivery; we will arrange a free replacement or full refund.','Size exchanges are subject to stock availability.']],
 ['3. Refunds',['Once the returned item is received and passes quality check, the refund is approved within 2 business days.','Approved refunds are credited to the original payment method (via Razorpay for online payments) within 5–7 business days. Bank or card issuer timelines may vary.','For cash-on-delivery orders, refunds are made by bank transfer/UPI to the account you provide.','Original shipping charges, if any, are non-refundable except for damaged, defective or wrong items.']],
 ['4. Amazon orders',['Products bought on Amazon.in follow Amazon’s return and refund policy; please raise those requests in your Amazon account.']],
 ['5. Contact',[contactLine]]]},
'/shipping':{kicker:'CUSTOMER CARE',title:'Shipping & Delivery Policy',intro:'We ship across India from Farrukhabad, Uttar Pradesh through trusted courier partners.',sections:[
 ['1. Processing time',['Orders are packed and dispatched within 1–3 business days of order confirmation (excluding Sundays and public holidays).']],
 ['2. Delivery time',['Delivery usually takes 3–7 business days after dispatch depending on your location. Remote areas may take longer.']],
 ['3. Shipping charges',['Shipping charges, if any, are shown at checkout before you pay. Free shipping may apply on eligible orders.']],
 ['4. Tracking',['After dispatch we share the courier name and tracking number by SMS/WhatsApp/email and in your account.']],
 ['5. Delays and failed delivery',['Delays caused by couriers, weather or other events beyond our control may occur; we will keep you informed. If delivery fails because of an incorrect address or the recipient being unavailable, re-shipping charges may apply.']],
 ['6. Amazon orders',['Orders placed on Amazon.in are shipped and delivered by Amazon or the seller under Amazon’s delivery terms.']],
 ['7. Contact',[contactLine]]]},
};
legal['/refund-policy']=legal['/returns'];legal['/cancellation-policy']=legal['/returns'];legal['/privacy-policy']=legal['/privacy'];legal['/terms-and-conditions']=legal['/terms'];legal['/shipping-policy']=legal['/shipping'];

export function LegalPage({path}:{path:string}){const d=legal[path];if(!d)return null;return <section className="section legal">
 <div className="legal-hero"><span className="eyebrow">{d.kicker}</span><h1>{d.title}</h1><p className="muted">Last updated: {BUSINESS.updated}</p></div>
 <div className="legal-body"><nav className="legal-toc">{d.sections.map(([h])=><a key={h} href={'#'+h.replace(/[^a-z0-9]+/gi,'-')}>{h}</a>)}</nav>
 <article><p className="lead">{d.intro}</p>{d.sections.map(([h,ps])=><div key={h} id={h.replace(/[^a-z0-9]+/gi,'-')} className="legal-sec"><h2>{h}</h2>{ps.map(p=><p key={p}>{p}</p>)}</div>)}
 <div className="legal-card"><b>{BUSINESS.legalName}</b> (brand: {BUSINESS.brand})<br/>{BUSINESS.address}<br/>{BUSINESS.phones.map(p=><a key={p} href={'tel:'+p.replace(/\s/g,'')}>{p} </a>)}{BUSINESS.SUPPORT_EMAIL&&<><br/><a href={'mailto:'+BUSINESS.SUPPORT_EMAIL}>{BUSINESS.SUPPORT_EMAIL}</a></>}{BUSINESS.GSTIN&&<><br/>GSTIN: {BUSINESS.GSTIN}</>}</div></article></div></section>}
