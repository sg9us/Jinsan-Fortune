type TranslationKey = string;

type Translation = {
  [key: TranslationKey]: string;
};

type Translations = {
  ko: Translation;
  en: Translation;
};

export const translations: Translations = {
  ko: {
    // App title
    appTitle: "PaljaNote",
    
    // Navigation
    home: "홈",
    chat: "채팅",
    fengshui: "풍수",
    booking: "예약",
    login: "로그인",
    logout: "로그아웃",
    myPage: "내 정보",
    
    // Auth
    loginDescription: "카카오나 네이버 계정으로 간편하게 로그인하세요",
    loginWithNaver: "네이버로 로그인",
    loginWithKakao: "카카오로 로그인",
    loginDisclaimer: "로그인 시 이용약관 및 개인정보 처리방침에 동의하게 됩니다",
    backToHome: "홈으로 돌아가기",
    loginFailed: "로그인에 실패했습니다. 다시 시도해주세요",
    unavailableService: "서비스 이용 불가",
    oauthProviderUnavailable: "현재 이 로그인 서비스를 이용할 수 없습니다",
    error: "오류",
    
    // Hero section
    heroTitle: "당신의 운명을 알아보세요",
    heroSubtitle: "전통 사주와 현대 기술의 만남",
    
    // Profile
    masterName: "이연주 선생님",
    masterTitle: "사주명리학 전문가 · 15년 경력",
    masterDescription: "안녕하세요, 이연주입니다. 사주와 풍수, 작명을 통해 여러분의 운명을 밝혀드립니다. 전통적인 동양 철학을 바탕으로 현대적인 해석을 제공해 드립니다.",
    
    // Services
    services: "서비스",
    sajuReading: "사주 상담",
    sajuDescription: "생년월일을 통한 운세 분석",
    fengShuiScore: "풍수 점수 확인",
    fengShuiDescription: "주소 기반 풍수 환경 분석",
    namingConsultation: "작명 상담",
    namingDescription: "이름과 운명의 조화 분석",
    
    // Tags
    saju: "사주",
    fengShuiTag: "풍수",
    naming: "작명",
    
    // Booking
    bookNow: "예약하기",
    bookingTitle: "상담 예약하기",
    bookConsultation: "지금 상담 예약하기",
    bookingSubtitle: "개인 맞춤형 상담을 통해 더 자세한 운세를 알아보세요.",
    consultationType: "상담 유형",
    
    // Chat
    quickSajuChat: "간편 사주 채팅",
    chatSubtitle: "AI와 간단한 운세 대화를 시작해보세요.",
    chatWelcome: "안녕하세요! 생년월일을 알려주시면 간단한 운세를 알려드릴게요.",
    startChatting: "채팅 시작하기",
    chatPlaceholder: "1990년 5월 15일",
    chatDisclaimer: "※ 간편 채팅은 실제 상담을 대체할 수 없습니다.",
    
    // Feng Shui
    fengShuiTitle: "풍수 점수 확인",
    fengShuiIntro: "주소를 입력하시면 AI가 해당 위치의 풍수 점수를 분석해드립니다.",
    address: "주소",
    checkScore: "점수 확인하기",
    fengShuiResults: "풍수 분석 결과",
    overallAssessment: "전체 평가",
    wealth: "재물운",
    health: "건강운",
    relationships: "인간관계",
    career: "사업운",
    advice: "조언",
    bookProfessional: "전문가 상담 예약하기",
    
    // Form fields
    name: "이름",
    birthdate: "생년월일",
    phone: "연락처",
    preferredDate: "상담 희망일",
    preferredTime: "상담 희망 시간",
    selectTime: "시간을 선택하세요",
    comments: "추가 요청사항 (선택)",
    complete: "예약 완료하기",
    
    // Success messages
    bookingComplete: "예약이 완료되었습니다. 확인 메시지가 곧 발송됩니다.",
    
    // Validation errors
    required: "필수 입력 사항입니다",
    invalidPhone: "올바른 전화번호 형식이 아닙니다",
    
    // Analysis result sections
    basicSaju: "기본 사주",
    yearlyFortune: "올해 운세",
    relationshipFortune: "인간관계",
    sajuAdvice: "조언",
    
    // Reviews
    userReviews: "이용 후기",
    writeReview: "후기 작성하기",
    yourName: "이름",
    enterYourName: "이름을 입력하세요",
    serviceType: "상담 유형",
    selectService: "상담 유형을 선택하세요",
    rating: "평점",
    selectRating: "평점을 선택하세요",
    ratingRequired: "평점을 입력해주세요",
    yourReview: "후기 내용",
    shareYourExperience: "경험을 자유롭게 작성해주세요",
    reviewTooShort: "후기는 5자 이상 작성해주세요",
    cancel: "취소",
    submitting: "제출 중...",
    submitReview: "후기 제출하기",
    reviewSubmitted: "후기가 등록되었습니다",
    thankYouForReview: "소중한 후기를 남겨주셔서 감사합니다",
    errorSubmittingReview: "후기 등록 오류",
    noReviewsYet: "아직 후기가 없습니다",
    beTheFirstToReview: "첫 번째 후기를 작성해 보세요",
    viewAllReviews: "모든 후기 보기",
    loading: "로딩 중...",
  },
  en: {
    // App title
    appTitle: "PaljaNote",
    
    // Navigation
    home: "Home",
    chat: "Chat",
    fengshui: "Feng Shui",
    booking: "Booking",
    
    // Hero section
    heroTitle: "Discover Your Destiny",
    heroSubtitle: "Where traditional fortune telling meets modern technology",
    
    // Profile
    masterName: "Master Yeonju Lee",
    masterTitle: "Saju Expert · 15 years of experience",
    masterDescription: "Hello, I'm Yeonju Lee. I reveal your destiny through Saju, Feng Shui, and naming services. I provide modern interpretations based on traditional Eastern philosophy.",
    
    // Services
    services: "Services",
    sajuReading: "Saju Reading",
    sajuDescription: "Destiny analysis through birth date",
    fengShuiScore: "Feng Shui Score",
    fengShuiDescription: "Location-based environment analysis",
    namingConsultation: "Naming Consultation",
    namingDescription: "Name and destiny harmony analysis",
    
    // Tags
    saju: "Saju",
    fengShuiTag: "Feng Shui",
    naming: "Naming",
    
    // Booking
    bookNow: "Book Now",
    bookingTitle: "Book a Consultation",
    bookConsultation: "Book a Consultation Now",
    bookingSubtitle: "Get a detailed personalized reading through a private consultation.",
    consultationType: "Consultation Type",
    
    // Chat
    quickSajuChat: "Quick Saju Chat",
    chatSubtitle: "Start a simple fortune telling chat with AI.",
    chatWelcome: "Hello! Please tell me your date of birth for a simple reading.",
    startChatting: "Start Chatting",
    chatPlaceholder: "May 15, 1990",
    chatDisclaimer: "※ Quick chat cannot replace a professional consultation.",
    
    // Feng Shui
    fengShuiTitle: "Feng Shui Score Check",
    fengShuiIntro: "Enter your address and our AI will analyze the Feng Shui score for that location.",
    address: "Address",
    checkScore: "Check Score",
    fengShuiResults: "Feng Shui Analysis Results",
    overallAssessment: "Overall Assessment",
    wealth: "Wealth",
    health: "Health",
    relationships: "Relationships",
    career: "Career",
    advice: "Advice",
    bookProfessional: "Book a Professional Consultation",
    
    // Form fields
    name: "Name",
    birthdate: "Birth Date",
    phone: "Phone Number",
    preferredDate: "Preferred Date",
    preferredTime: "Preferred Time",
    selectTime: "Select a time",
    comments: "Additional Comments (Optional)",
    complete: "Complete Booking",
    
    // Success messages
    bookingComplete: "Booking completed. A confirmation message will be sent shortly.",
    
    // Validation errors
    required: "This field is required",
    invalidPhone: "Invalid phone number format",
    
    // Analysis result sections
    basicSaju: "Basic Saju",
    yearlyFortune: "This Year's Fortune",
    relationshipFortune: "Relationships",
    sajuAdvice: "Advice",
    
    // Reviews
    userReviews: "Customer Reviews",
    writeReview: "Write a Review",
    yourName: "Your Name",
    enterYourName: "Enter your name",
    serviceType: "Service Type",
    selectService: "Select a service",
    rating: "Rating",
    selectRating: "Select rating",
    ratingRequired: "Rating is required",
    yourReview: "Your Review",
    shareYourExperience: "Share your experience",
    reviewTooShort: "Review must be at least 5 characters",
    cancel: "Cancel",
    submitting: "Submitting...",
    submitReview: "Submit Review",
    reviewSubmitted: "Review Submitted",
    thankYouForReview: "Thank you for sharing your feedback",
    errorSubmittingReview: "Error Submitting Review",
    noReviewsYet: "No reviews yet",
    beTheFirstToReview: "Be the first to review",
    viewAllReviews: "View All Reviews",
    loading: "Loading...",
  }
};

export type LanguageCode = keyof typeof translations;

export function translate(key: TranslationKey, language: LanguageCode): string {
  const text = translations[language][key];
  return text ?? key;
}
