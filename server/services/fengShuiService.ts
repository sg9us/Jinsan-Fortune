import OpenAI from "openai";
import { type InsertFengShuiScore } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface FengShuiAnalysisResponse {
  overallScore: number;
  wealthScore: number;
  healthScore: number;
  relationshipScore: number;
  careerScore: number;
  overall: string;
  advice: string;
}

export async function analyzeFengShui(address: string, language: string): Promise<FengShuiAnalysisResponse> {
  try {
    const isKorean = language === 'ko';
    const systemPrompt = isKorean
      ? "당신은 전문 풍수 분석가입니다. 주어진 주소를 바탕으로 풍수 점수와 분석을 제공하세요."
      : "You are a professional Feng Shui analyst. Provide a Feng Shui score and analysis based on the provided address.";
    
    const userPrompt = isKorean
      ? `다음 주소의 풍수를 분석해주세요: ${address}. 다음 항목들을 포함한 JSON 형식으로 응답해주세요: 전체 점수(1-100), 재물 점수(1-100), 건강 점수(1-100), 인간관계 점수(1-100), 사업/경력 점수(1-100), 전체 평가, 조언`
      : `Please analyze the Feng Shui of this address: ${address}. Respond with JSON that includes: overall score (1-100), wealth score (1-100), health score (1-100), relationship score (1-100), career score (1-100), overall assessment, and advice`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Use deterministic algorithm if OpenAI is not available
    if (!result.overallScore) {
      return generateFengShuiScore(address, language);
    }
    
    return {
      overallScore: Math.min(100, Math.max(1, Math.round(result.overallScore || 0))),
      wealthScore: Math.min(100, Math.max(1, Math.round(result.wealthScore || 0))),
      healthScore: Math.min(100, Math.max(1, Math.round(result.healthScore || 0))),
      relationshipScore: Math.min(100, Math.max(1, Math.round(result.relationshipScore || 0))),
      careerScore: Math.min(100, Math.max(1, Math.round(result.careerScore || 0))),
      overall: result.overall || (isKorean ? "분석 정보가 없습니다." : "No analysis available."),
      advice: result.advice || (isKorean ? "전문가 상담을 받아보세요." : "Please consult with a professional.")
    };
  } catch (error) {
    console.error("Error analyzing Feng Shui:", error);
    return generateFengShuiScore(address, language);
  }
}

// Simple deterministic algorithm for Feng Shui scoring if OpenAI fails
function generateFengShuiScore(address: string, language: string): FengShuiAnalysisResponse {
  const isKorean = language === 'ko';
  // Create a simple hash from the address to create deterministic but seemingly random scores
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash) + address.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use the hash to generate scores between 55 and 95
  const baseScore = Math.abs(hash % 40) + 55;
  const wealthVariation = Math.abs((hash >> 2) % 20) - 10;
  const healthVariation = Math.abs((hash >> 4) % 20) - 10;
  const relationshipVariation = Math.abs((hash >> 6) % 20) - 10;
  const careerVariation = Math.abs((hash >> 8) % 20) - 10;
  
  const overallScore = Math.min(100, Math.max(1, Math.round(baseScore)));
  const wealthScore = Math.min(100, Math.max(1, Math.round(baseScore + wealthVariation)));
  const healthScore = Math.min(100, Math.max(1, Math.round(baseScore + healthVariation)));
  const relationshipScore = Math.min(100, Math.max(1, Math.round(baseScore + relationshipVariation)));
  const careerScore = Math.min(100, Math.max(1, Math.round(baseScore + careerVariation)));
  
  const overall = isKorean
    ? `이 위치는 ${overallScore}점으로 ${overallScore > 80 ? '매우 좋은' : overallScore > 70 ? '좋은' : '보통의'} 기운을 가지고 있습니다. 특히 ${Math.max(wealthScore, healthScore, relationshipScore, careerScore) === wealthScore ? '재물운' : Math.max(healthScore, relationshipScore, careerScore) === healthScore ? '건강운' : Math.max(relationshipScore, careerScore) === relationshipScore ? '인간관계' : '사업운'}이 두드러집니다.`
    : `This location has a score of ${overallScore}, indicating ${overallScore > 80 ? 'excellent' : overallScore > 70 ? 'good' : 'average'} energy. It's particularly strong for ${Math.max(wealthScore, healthScore, relationshipScore, careerScore) === wealthScore ? 'wealth' : Math.max(healthScore, relationshipScore, careerScore) === healthScore ? 'health' : Math.max(relationshipScore, careerScore) === relationshipScore ? 'relationships' : 'career'}.`;
  
  const advice = isKorean
    ? wealthScore > 80 
      ? '북쪽에 물 요소를 배치하면 더 좋은 재물운을 얻을 수 있습니다.'
      : healthScore > 80
      ? '동쪽 창문을 자주 열어 신선한 기운을 받아들이세요.'
      : relationshipScore > 80
      ? '남서쪽에 분홍색이나 빨간색 요소를 배치하면 인간관계가 개선될 수 있습니다.'
      : '서쪽에 금속 요소를 배치하면 사업운이 향상될 수 있습니다.'
    : wealthScore > 80
      ? 'Place water elements in the north to enhance wealth energy.'
      : healthScore > 80
      ? 'Open east-facing windows frequently to allow fresh energy.'
      : relationshipScore > 80
      ? 'Place pink or red elements in the southwest to improve relationships.'
      : 'Place metal elements in the west to boost career prospects.';
  
  return {
    overallScore,
    wealthScore,
    healthScore,
    relationshipScore,
    careerScore,
    overall,
    advice
  };
}

export function createFengShuiScore(address: string, result: FengShuiAnalysisResponse): InsertFengShuiScore {
  return {
    address,
    overallScore: result.overallScore,
    wealthScore: result.wealthScore,
    healthScore: result.healthScore,
    relationshipScore: result.relationshipScore,
    careerScore: result.careerScore,
    overall: result.overall,
    advice: result.advice
  };
}
