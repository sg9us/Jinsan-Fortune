import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface SajuAnalysisResponse {
  basic: string;
  yearly: string;
  relationships: string;
  advice: string;
}

export async function analyzeSaju(birthdate: string, language: string): Promise<SajuAnalysisResponse> {
  try {
    const isKorean = language === 'ko';
    const systemPrompt = isKorean
      ? "당신은 전문 사주 분석가입니다. 입력된 생년월일을 바탕으로 간략한 사주 분석을 JSON 형식으로 제공하세요."
      : "You are a professional Saju (Korean fortune telling) analyst. Provide a brief analysis based on the provided birthdate in JSON format.";
    
    const userPrompt = isKorean
      ? `다음 생년월일을 바탕으로 간략한 사주 분석을 제공해주세요: ${birthdate}. 다음 형식의 JSON으로 응답해주세요: { "basic": "기본 사주 분석", "yearly": "올해 운세", "relationships": "인간관계", "advice": "조언" }`
      : `Please provide a brief Saju analysis based on this birthdate: ${birthdate}. Respond with JSON in this format: { "basic": "basic Saju analysis", "yearly": "this year's fortune", "relationships": "interpersonal relationships", "advice": "advice" }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      basic: result.basic || (isKorean ? "분석할 수 없습니다." : "Unable to analyze."),
      yearly: result.yearly || (isKorean ? "분석할 수 없습니다." : "Unable to analyze."),
      relationships: result.relationships || (isKorean ? "분석할 수 없습니다." : "Unable to analyze."),
      advice: result.advice || (isKorean ? "분석할 수 없습니다." : "Unable to analyze.")
    };
  } catch (error) {
    console.error("Error analyzing Saju:", error);
    const isKorean = language === 'ko';
    return {
      basic: isKorean ? "분석 중 오류가 발생했습니다." : "Error during analysis.",
      yearly: isKorean ? "분석 중 오류가 발생했습니다." : "Error during analysis.",
      relationships: isKorean ? "분석 중 오류가 발생했습니다." : "Error during analysis.",
      advice: isKorean ? "전문가 상담을 예약해보세요." : "Please book a professional consultation."
    };
  }
}
