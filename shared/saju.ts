// 천간 (Heavenly Stems)
export const heavenlyStems = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
export const heavenlyStemsHanja = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const heavenlyStemsElements = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"];
export const heavenlyStemsYin = [false, true, false, true, false, true, false, true, false, true];

// 지지 (Earthly Branches)
export const earthlyBranches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
export const earthlyBranchesHanja = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
export const earthlyBranchesElements = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"];
export const earthlyBranchesYin = [true, false, true, false, true, false, true, false, true, false, true, false];
export const earthlyBranchesZodiac = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];

// 오행 (Five Elements)
export const fiveElements = ["목", "화", "토", "금", "수"];
export const fiveElementsEmoji = ["🌳", "🔥", "🌎", "⚒️", "💧"];

// 십신 (Ten Gods)
export const tenGods = [
  "정관", "편관", "정인", "편인", "비견", "겁재", "식신", "상관", "정재", "편재"
];

// 월별 천간 시작 인덱스
export const monthStartIndex = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0, 2, 4];

// 시간별 지지 인덱스 (자시부터 시작, 2시간 간격)
export const hourBranchIndex = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11];

/**
 * 배열에서 반복적으로 인덱스를 가져오는 함수
 */
export function getIndexWithCycle(baseIndex: number, cycle: number): number {
  return (baseIndex % cycle + cycle) % cycle;
}

/**
 * 음력날짜로 변환하는 로직 (간단 버전, 실제로는 더 복잡한 계산이 필요)
 * 참고: 실제 구현에서는 음력 변환 라이브러리 사용이 필요합니다.
 */
export function getLunarDate(date: Date): Date {
  // 여기서는 간단히 음력 변환을 시뮬레이션합니다.
  // 실제로는 음력 변환 라이브러리를 사용해야 합니다.
  return date;
}

/**
 * 특정 년도의 천간 계산
 */
export function getYearStem(year: number): number {
  return getIndexWithCycle(year - 4, 10);
}

/**
 * 특정 년도의 지지 계산
 */
export function getYearBranch(year: number): number {
  return getIndexWithCycle(year - 4, 12);
}

/**
 * 월주를 계산하는 함수
 */
export function getMonthPillar(year: number, month: number): [number, number] {
  // 해당 년도의 천간 인덱스
  const yearStemIndex = getYearStem(year);
  
  // 천간이 양인지 음인지 확인 (0, 2, 4, 6, 8 = 양, 1, 3, 5, 7, 9 = 음)
  const stemBaseIndex = Math.floor(yearStemIndex / 2) * 2;
  
  // 월의 천간 인덱스 계산
  const monthStemIndex = getIndexWithCycle(stemBaseIndex + month - 1, 10);
  
  // 월의 지지 인덱스 계산
  const monthBranchIndex = getIndexWithCycle(month + 1, 12);
  
  return [monthStemIndex, monthBranchIndex];
}

/**
 * 일주를 계산하는 함수
 */
export function getDayPillar(date: Date): [number, number] {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 1900년 1월 1일은 '경신일'이었으므로 이를 기준으로 계산
  const baseDate = new Date(1900, 0, 1); // 1900년 1월 1일
  const baseYear = 1900;
  
  // 기준일로부터 일 수 계산
  const diffTime = date.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // 천간 계산 (경신일 = 경(7), 신(8)의 조합, 7+일수를 10으로 나눈 나머지)
  const stemIndex = getIndexWithCycle(7 + diffDays, 10);
  
  // 지지 계산 (경신일 = 경(7), 신(8)의 조합, 8+일수를 12로 나눈 나머지)
  const branchIndex = getIndexWithCycle(8 + diffDays, 12);
  
  return [stemIndex, branchIndex];
}

/**
 * 시주를 계산하는 함수
 */
export function getHourPillar(date: Date, dayStemIndex: number): [number, number] {
  const hours = date.getHours();
  
  // 시간에 해당하는 지지 인덱스
  const hourBranchIdx = hourBranchIndex[hours];
  
  // 일주 천간이 양일 경우 (갑, 병, 무, 경, 임)
  const dayIsYang = dayStemIndex % 2 === 0;
  
  // 시간 천간 계산
  let hourStemIdx;
  if (dayIsYang) {
    // 양일 경우 시작점: 갑
    hourStemIdx = getIndexWithCycle(hourBranchIdx, 10);
  } else {
    // 음일 경우 시작점: 을
    hourStemIdx = getIndexWithCycle(hourBranchIdx + 6, 10);
  }
  
  return [hourStemIdx, hourBranchIdx];
}

/**
 * 사주팔자를 계산하는 함수
 */
export function calculateSaju(birthDate: Date, birthTime?: Date): {
  yearPillar: [number, number];
  monthPillar: [number, number];
  dayPillar: [number, number];
  hourPillar?: [number, number];
  pillars: Array<[number, number]>;
  elements: {[key: string]: number};
  dayMaster: number;
  tenGodsCounts: {[key: string]: number};
} {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  // 년주 계산
  const yearStemIndex = getYearStem(year);
  const yearBranchIndex = getYearBranch(year);
  const yearPillar: [number, number] = [yearStemIndex, yearBranchIndex];
  
  // 월주 계산
  const monthPillar = getMonthPillar(year, month);
  
  // 일주 계산
  const dayPillar = getDayPillar(birthDate);
  
  // 시주 계산 (시간이 제공된 경우)
  let hourPillar: [number, number] | undefined;
  if (birthTime) {
    hourPillar = getHourPillar(birthTime, dayPillar[0]);
  }
  
  // 모든 기둥을 배열로 정리
  const pillars: Array<[number, number]> = [yearPillar, monthPillar, dayPillar];
  if (hourPillar) pillars.push(hourPillar);
  
  // 오행 분포 계산
  const elements: {[key: string]: number} = {
    "목": 0,
    "화": 0,
    "토": 0,
    "금": 0,
    "수": 0
  };
  
  // 천간의 오행 카운트
  pillars.forEach(pillar => {
    elements[heavenlyStemsElements[pillar[0]]]++;
  });
  
  // 지지의 오행 카운트
  pillars.forEach(pillar => {
    elements[earthlyBranchesElements[pillar[1]]]++;
  });
  
  // 일주를 기준으로 십신 계산
  const dayMaster = dayPillar[0]; // 일간
  
  // 십신 카운트
  const tenGodsCounts: {[key: string]: number} = {};
  tenGods.forEach(god => {
    tenGodsCounts[god] = 0;
  });
  
  pillars.forEach(pillar => {
    // 천간 십신 계산
    const stemRelation = calculateTenGod(dayMaster, pillar[0]);
    tenGodsCounts[stemRelation]++;
    
    // 지지 십신 계산 (간략화: 지지에 숨은 천간 계산은 생략)
    // 실제로는 지지에 숨은 천간들의 십신도 계산해야 함
  });
  
  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    pillars,
    elements,
    dayMaster,
    tenGodsCounts
  };
}

/**
 * 십신 관계 계산
 */
function calculateTenGod(dayMaster: number, stemIndex: number): string {
  // 일간과 비교할 천간의 오행
  const dayMasterElement = heavenlyStemsElements[dayMaster];
  const stemElement = heavenlyStemsElements[stemIndex];
  
  // 일간이 양성인지 음성인지
  const dayMasterIsYang = !heavenlyStemsYin[dayMaster];
  // 비교할 천간이 양성인지 음성인지
  const stemIsYang = !heavenlyStemsYin[stemIndex];
  
  // 자기 자신 (비견 또는 겁재)
  if (dayMasterElement === stemElement) {
    // 양/음이 같으면 비견, 다르면 겁재
    return dayMasterIsYang === stemIsYang ? "비견" : "겁재";
  }
  
  // 오행의 상생, 상극 관계에 따른 십신 결정
  switch (dayMasterElement) {
    case "목":
      if (stemElement === "화") {
        // 목생화: 식신 또는 상관
        return stemIsYang ? "식신" : "상관";
      } else if (stemElement === "토") {
        // 목극토: 정재 또는 편재
        return stemIsYang ? "정재" : "편재";
      } else if (stemElement === "금") {
        // 금극목: 정관 또는 편관
        return stemIsYang ? "정관" : "편관";
      } else if (stemElement === "수") {
        // 수생목: 정인 또는 편인
        return stemIsYang ? "정인" : "편인";
      }
      break;
    case "화":
      if (stemElement === "토") {
        // 화생토: 식신 또는 상관
        return stemIsYang ? "식신" : "상관";
      } else if (stemElement === "금") {
        // 화극금: 정재 또는 편재
        return stemIsYang ? "정재" : "편재";
      } else if (stemElement === "수") {
        // 수극화: 정관 또는 편관
        return stemIsYang ? "정관" : "편관";
      } else if (stemElement === "목") {
        // 목생화: 정인 또는 편인
        return stemIsYang ? "정인" : "편인";
      }
      break;
    case "토":
      if (stemElement === "금") {
        // 토생금: 식신 또는 상관
        return stemIsYang ? "식신" : "상관";
      } else if (stemElement === "수") {
        // 토극수: 정재 또는 편재
        return stemIsYang ? "정재" : "편재";
      } else if (stemElement === "목") {
        // 목극토: 정관 또는 편관
        return stemIsYang ? "정관" : "편관";
      } else if (stemElement === "화") {
        // 화생토: 정인 또는 편인
        return stemIsYang ? "정인" : "편인";
      }
      break;
    case "금":
      if (stemElement === "수") {
        // 금생수: 식신 또는 상관
        return stemIsYang ? "식신" : "상관";
      } else if (stemElement === "목") {
        // 금극목: 정재 또는 편재
        return stemIsYang ? "정재" : "편재";
      } else if (stemElement === "화") {
        // 화극금: 정관 또는 편관
        return stemIsYang ? "정관" : "편관";
      } else if (stemElement === "토") {
        // 토생금: 정인 또는 편인
        return stemIsYang ? "정인" : "편인";
      }
      break;
    case "수":
      if (stemElement === "목") {
        // 수생목: 식신 또는 상관
        return stemIsYang ? "식신" : "상관";
      } else if (stemElement === "화") {
        // 수극화: 정재 또는 편재
        return stemIsYang ? "정재" : "편재";
      } else if (stemElement === "토") {
        // 토극수: 정관 또는 편관
        return stemIsYang ? "정관" : "편관";
      } else if (stemElement === "금") {
        // 금생수: 정인 또는 편인
        return stemIsYang ? "정인" : "편인";
      }
      break;
  }
  
  // 기본값으로 비견 반환 (정확한 계산을 위해서는 에러 처리가 필요)
  return "비견";
}

/**
 * 오행의 색상을 반환
 */
export function getElementColor(element: string): string {
  switch (element) {
    case "목": return "text-green-600";
    case "화": return "text-red-600";
    case "토": return "text-yellow-700";
    case "금": return "text-gray-500";
    case "수": return "text-blue-600";
    default: return "";
  }
}

/**
 * 계절 강약을 판단
 */
export function getSeasonalStrength(month: number, element: string): string {
  // 각 계절별 오행의 강약 (1: 매우 약함, 5: 매우 강함)
  const seasonalStrength: {[key: string]: number[]} = {
    "목": [3, 4, 5, 4, 3, 2, 1, 2, 3, 2, 3, 3], // 봄에 강함
    "화": [1, 2, 3, 4, 5, 5, 4, 3, 2, 1, 2, 1], // 여름에 강함
    "토": [3, 3, 3, 3, 3, 4, 5, 5, 3, 3, 3, 3], // 계절 전환기에 강함
    "금": [3, 2, 1, 2, 3, 4, 5, 4, 5, 5, 4, 3], // 가을에 강함
    "수": [5, 5, 4, 3, 2, 1, 2, 3, 4, 3, 3, 4]  // 겨울에 강함
  };
  
  // 해당 월의 오행 강도
  const strength = seasonalStrength[element][month - 1];
  
  // 강도에 따른 해석
  switch (strength) {
    case 5: return "매우 강함";
    case 4: return "강함";
    case 3: return "보통";
    case 2: return "약함";
    case 1: return "매우 약함";
    default: return "알 수 없음";
  }
}

/**
 * 계절을 반환
 */
export function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return "봄";
  if (month >= 6 && month <= 8) return "여름";
  if (month >= 9 && month <= 11) return "가을";
  return "겨울";
}

/**
 * 사주 요약 (간단한 해석)
 */
export function getSajuSummary(
  elements: {[key: string]: number}, 
  dayMaster: number,
  month: number
): string {
  const dayMasterElement = heavenlyStemsElements[dayMaster];
  const seasonalPower = getSeasonalStrength(month, dayMasterElement);
  
  // 오행 중 가장 많은 요소 찾기
  let maxElement = "";
  let maxCount = 0;
  
  Object.entries(elements).forEach(([element, count]) => {
    if (count > maxCount) {
      maxElement = element;
      maxCount = count;
    }
  });
  
  // 일주 오행의 계절적 상태에 따른 해석
  let summary = `귀하의 일주는 ${heavenlyStems[dayMaster]}${earthlyBranches[0]} 으로 ${dayMasterElement}의 기운을 가지고 있습니다.\n`;
  
  summary += `${getSeason(month)} 태생으로 일주의 ${dayMasterElement}이(가) ${seasonalPower} 상태입니다. `;
  
  // 오행 분포에 따른 해석
  summary += `사주에서 ${maxElement}의 기운이 가장 많이 나타나고 있어 `;
  
  // 각 오행별 간단한 해석
  switch (maxElement) {
    case "목":
      summary += "인내심이 강하고 성장과 발전을 좋아하는 성향이 있습니다.";
      break;
    case "화":
      summary += "열정적이고 사교적인 성향이 두드러집니다.";
      break;
    case "토":
      summary += "안정적이고 실용적인 성향을 가지고 있습니다.";
      break;
    case "금":
      summary += "원칙과 정의를 중요시하는 결단력 있는 성향입니다.";
      break;
    case "수":
      summary += "지혜롭고 유연한 사고력을 가진 성향이 두드러집니다.";
      break;
  }
  
  return summary;
}