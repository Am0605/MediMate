import { GoogleGenerativeAI } from '@google/generative-ai';

interface SimplificationResult {
  simplifiedText: string;
  healthTips: string[];
  keyFindings?: string[];
  diagnosis?: string;
}

class GeminiService {
  private readonly API_KEY = 'AIzaSyCiC29Cb0pvgu-EpmMmeDePtF_qTiSxEl4';
  private readonly BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

  async simplifyMedicalDocument(medicalText: string, documentType: string): Promise<SimplificationResult> {
    try {
      const prompt = this.createComprehensiveSimplificationPrompt(medicalText, documentType);
      const response = await this.generateContent(prompt);
      
      if (!response || response.trim().length === 0) {
        throw new Error('Failed to generate simplified text');
      }

      const result = this.parseStructuredResponse(response);
      return result;

    } catch (error) {
      console.error('Gemini AI error:', error);
      throw new Error(
        error instanceof Error 
          ? `AI processing failed: ${error.message}`
          : 'Failed to simplify medical document'
      );
    }
  }

  private async generateContent(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.BASE_URL}/gemini-2.0-flash:generateContent?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 3048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_ONLY_HIGH"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated');
      }

      const candidate = data.candidates[0];
      
      if (candidate.finishReason === 'SAFETY') {
        throw new Error('Content was blocked by safety filters');
      }

      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid response format');
      }

      return candidate.content.parts[0].text;

    } catch (error) {
      console.error('Gemini API call error:', error);
      throw error;
    }
  }

  private createComprehensiveSimplificationPrompt(medicalText: string, documentType: string): string {
    return `
You are a medical communication expert. Your task is to analyze and simplify complex medical documents into easy-to-understand language for patients and their families.

Document Type: ${documentType}

Instructions:
1. Provide a comprehensive simplified explanation that includes ALL medical information
2. ALWAYS include patient information, diagnosis, test results, and treatment plans
3. Convert medical jargon into simple, everyday language
4. Explain medical conditions, procedures, and treatments clearly
5. Use clear headings and bullet points for better readability
6. Include brief explanations of medical terms
7. Maintain medical accuracy while making it accessible
8. Use a warm, reassuring tone
9. For medications: include both generic and brand names, dosages, and purposes
10. For test results: explain what they mean and whether they're normal or concerning
11. For diagnosis: explain the condition in simple terms and what it means for the patient

Please structure your response EXACTLY as follows:

## SIMPLIFIED MEDICAL DOCUMENT

### Patient Information
[Extract and simplify patient details]

### Main Diagnosis/Condition
[Clearly explain what was found or diagnosed in simple terms]

### Test Results & Findings
[Explain any test results, lab values, or examination findings in plain language]

### Treatment Plan & Medications
[Simplify treatment recommendations, medications, and next steps]

### What This Means for You
[Summary in very simple terms about the patient's condition and outlook]

---

### HEALTH TIPS
[Provide 4-5 specific, actionable health tips related to this condition/document type]
- Tip 1
- Tip 2
- Tip 3
- Tip 4
- Tip 5

Medical Document Text:
"${medicalText}"

Please provide the complete simplified version following the exact structure above:`;
  }

  private parseStructuredResponse(response: string): SimplificationResult {
    try {
      // Extract health tips section
      const healthTipsMatch = response.match(/### HEALTH TIPS\s*([\s\S]*?)(?=\n###|\n---|\n##|$)/i);
      let healthTips: string[] = [];
      
      if (healthTipsMatch) {
        healthTips = healthTipsMatch[1]
          .split('\n')
          .map(tip => tip.replace(/^[-•*\s]+/, '').trim())
          .filter(tip => tip.length > 0 && !tip.startsWith('###'))
          .slice(0, 5);
      }

      // Extract simplified text (everything before health tips)
      let simplifiedText = response;
      if (healthTipsMatch) {
        simplifiedText = response.replace(healthTipsMatch[0], '').trim();
      }

      // Clean up the simplified text
      simplifiedText = simplifiedText
        .replace(/^---\s*/gm, '')
        .replace(/### HEALTH TIPS[\s\S]*$/i, '')
        .trim();

      // Extract diagnosis if available
      const diagnosisMatch = simplifiedText.match(/### Main Diagnosis\/Condition\s*([\s\S]*?)(?=\n###|$)/i);
      let diagnosis = '';
      if (diagnosisMatch) {
        diagnosis = diagnosisMatch[1].trim();
      }

      // Fallback health tips if none were extracted
      if (healthTips.length === 0) {
        healthTips = [
          'Follow your doctor\'s instructions carefully',
          'Take medications as prescribed',
          'Keep all follow-up appointments',
          'Contact your healthcare provider with any concerns',
          'Maintain a healthy lifestyle with proper diet and exercise'
        ];
      }

      return {
        simplifiedText,
        healthTips,
        diagnosis: diagnosis || undefined
      };

    } catch (error) {
      console.error('Error parsing structured response:', error);
      return {
        simplifiedText: response,
        healthTips: [
          'Follow your doctor\'s instructions carefully',
          'Take medications as prescribed',
          'Keep all follow-up appointments',
          'Contact your healthcare provider with any concerns'
        ]
      };
    }
  }

  async analyzeMedicalTerms(text: string): Promise<{ term: string; explanation: string }[]> {
    try {
      const prompt = `
Extract and explain the most important medical terms from the following text. Return ONLY a valid JSON array with 'term' and 'explanation' fields, no additional text:

Text: "${text}"

Focus on key medical terms that patients would benefit from understanding. Limit to 8 most important terms.

Format: [{"term": "medical term", "explanation": "simple explanation"}]
`;

      const response = await this.generateContent(prompt);
      
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      
      try {
        const terms = JSON.parse(cleanedResponse);
        return Array.isArray(terms) ? terms.slice(0, 8) : [];
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Medical terms analysis error:', error);
      return [];
    }
  }

  async generateHealthTips(documentType: string, condition?: string): Promise<string[]> {
    try {
      const prompt = `
Generate exactly 5 helpful, specific health tips related to ${documentType}${condition ? ` for ${condition}` : ''}. 
Keep tips practical, actionable, and easy to understand.
Focus on prevention, management, and lifestyle recommendations.

Return ONLY the tips, one per line, without numbers or bullet points:
`;

      const response = await this.generateContent(prompt);
      
      // Parse the response and return as array
      const tips = response
        .split('\n')
        .map(tip => tip.replace(/^[-•*\d.\s]+/, '').trim())
        .filter(tip => tip.length > 0)
        .slice(0, 5);

      return tips.length > 0 ? tips : [
        'Follow your doctor\'s instructions carefully',
        'Take medications as prescribed and never skip doses',
        'Keep all follow-up appointments and regular check-ups',
        'Maintain a healthy diet and stay physically active',
        'Contact your healthcare provider with any concerns or questions'
      ];
    } catch (error) {
      console.error('Health tips generation error:', error);
      return [
        'Follow your doctor\'s instructions carefully',
        'Take medications as prescribed and never skip doses',
        'Keep all follow-up appointments and regular check-ups',
        'Maintain a healthy diet and stay physically active',
        'Contact your healthcare provider with any concerns or questions'
      ];
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateContent('Say "Hello" in one word.');
      return response.toLowerCase().includes('hello');
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateContentWithRetry(prompt: string, maxRetries: number = 3): Promise<string> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.generateContent(prompt);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError!;
  }
}

export const geminiService = new GeminiService();