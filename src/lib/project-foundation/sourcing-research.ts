export const sourcingResearch = {
  "lastUpdated": "2026-08-17",
  "sourceWorkbook": "SE_Asia_Hair_Factory_Sourcing_Yangon_Cambodia_Vietnam.xlsx",
  "strategy": [
    {
      "country": "Myanmar/Yangon",
      "bestUse": "Raw Burmese-origin verification and niche sourcing",
      "why": "Potential differentiation if you can prove true Burmese donor origin; Yangon has direct public leads.",
      "risk": "Safety/advisory risk; business visa documentation; some Myanmar processors may import hair from other countries.",
      "nextAction": "Do WhatsApp/video verification first; only visit North Okkalapa appointments in person."
    },
    {
      "country": "Cambodia",
      "bestUse": "Premium raw Cambodian-origin sourcing, small batch/story-driven product",
      "why": "Cambodian hair can be marketed as rare/premium if origin and ethics are documented.",
      "risk": "Many “Cambodian” vendors are actually Vietnam-source; fewer transparent factory addresses.",
      "nextAction": "Prioritize VHC, CRH, Cambodian Raw Hair Extensions; ask for donor/collection proof."
    },
    {
      "country": "Vietnam",
      "bestUse": "Scalable manufacturing, private label, extensions/wigs/OEM",
      "why": "Largest and most organized factory ecosystem among the three; many WhatsApp-ready suppliers.",
      "risk": "More competition; some “raw/single donor” claims need verification.",
      "nextAction": "Contact 8-12 suppliers, request catalogs/samples, then shortlist 3 factories around Bac Ninh/Hanoi."
    }
  ],
  "safety": [
    {
      "topic": "U.S. government safety advisory",
      "finding": "The U.S. State Department lists Burma/Myanmar as Level 4: Do Not Travel due to armed conflict, unrest, arbitrary law enforcement, poor health infrastructure, landmines/UXO and crime.",
      "recommendation": "If you go anyway, keep it Yangon-only, use private driver/security-minded local fixer, avoid protests/crowds, do not do overland sourcing runs without a current local security check.",
      "sourceUrl": "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/burma-travel-advisory.html"
    },
    {
      "topic": "Tourist eVisa basics",
      "finding": "Tourist eVisa requires passport validity of at least 6 months, recent color photo, passport bio page, return ticket proof, and hotel/registered accommodation proof.",
      "recommendation": "Good fit only if the trip is genuinely tourism plus informal meetings; for factory purchasing meetings, business visa may be safer/cleaner.",
      "sourceUrl": "https://evisa.moip.gov.mm/apply-visa/notice-tourist-visa"
    },
    {
      "topic": "Business eVisa basics",
      "finding": "Business eVisa requires invitation by a registered Myanmar company/chamber and company documents including registration/DICA extract/annual return proof.",
      "recommendation": "Ask a preferred supplier to send proper invitation docs only after you verify the company is active and legitimate.",
      "sourceUrl": "https://evisa.moip.gov.mm/apply-visa/notice-business-visa"
    },
    {
      "topic": "eVisa ports",
      "finding": "Current eVisa entry ports include Yangon International Airport, Mandalay, Nay Pyi Taw, and Kawthaung land border.",
      "recommendation": "For this trip, use Yangon International Airport only; do not build a multi-city route until security is checked city-by-city.",
      "sourceUrl": "https://evisa.moip.gov.mm/notice/tourist"
    },
    {
      "topic": "Yangon factory geography",
      "finding": "The best concentration of direct hair leads found is North Okkalapa; secondary leads are Hlaing Tharyar and South Dagon/Dagon Seikkan.",
      "recommendation": "Day 1: North Okkalapa appointments only. Day 2: backup/revisits. Day 3: only if local driver confirms Hlaing Tharyar/South Dagon route is safe that week.",
      "sourceUrl": "https://www.myanmarhairextension.com/contact.html"
    },
    {
      "topic": "Go / no-go rule",
      "finding": "Do not rely only on an online listing for a Myanmar visit.",
      "recommendation": "Require: confirmed appointment, live video call from facility, hotel/driver confirmation, supplier sends pin, no demand for large deposit, and route check on the same day.",
      "sourceUrl": "Compiled from official advisory + sourcing workflow"
    }
  ],
  "scripts": [
    {
      "useCase": "First supplier message",
      "message": "Hi, my name is Rocky. I own Hair Maiden India in the USA. I am looking for a direct factory/collector for raw human hair and finished products. Can you send me your wholesale price list, product catalog, and a short live video of your factory or stock today? I am especially interested in raw ponytail/bulk hair, wefted hair, closures/frontals, and wigs."
    },
    {
      "useCase": "Myanmar/Yangon verification",
      "message": "Before I travel to Yangon, can you please confirm your full address, send a Google Maps pin, and show me on video where the hair is washed, sorted, wefted, and packed? Also, is the hair collected in Myanmar, or imported from India/Bangladesh/Pakistan and processed in Myanmar?"
    },
    {
      "useCase": "Cambodia verification",
      "message": "I am looking for real Cambodian-origin hair, not Vietnamese hair sold under a Cambodian name. Can you explain where your hair is collected, whether it is single donor or mixed donor, and whether I can visit your Cambodia collection/factory location?"
    },
    {
      "useCase": "Vietnam verification",
      "message": "I am comparing Vietnamese hair factories for long-term wholesale. Can you send pricing by kg for raw bulk, machine weft, tape-ins, closures/frontals, and wigs? Also please confirm MOQ, sample policy, DHL/FedEx shipping cost to Los Angeles, and whether you offer private label packaging."
    },
    {
      "useCase": "Factory visit request",
      "message": "I may be visiting soon. Are you open to a buyer visiting your facility? I would like to see raw hair stock, sorting, washing, wefting, ventilation/wig-making if available, and packing/export process. Please let me know the best date/time and what documents you need from me."
    },
    {
      "useCase": "Sample order terms",
      "message": "For a first test order, I want to start with a small paid sample, then scale if quality is consistent. Please quote: 100g raw bulk, 3 bundles 18/20/22, 5x5 closure, 13x4 frontal, and one wig sample. Please include shipping time, payment options, and return/exchange policy."
    }
  ]
} as const;
