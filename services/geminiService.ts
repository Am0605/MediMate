import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system'; // Add this import

interface SimplificationResult {
  simplifiedText: string;
  healthTips: string[];
  keyFindings?: string[];
  diagnosis?: string;
}

interface SymptomData {
  symptoms: string[];
  customSymptoms: string;
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  additionalInfo: string;
  hasVisibleSymptoms: boolean;
  imageUri?: string;
}

interface SymptomAnalysis {
  assessment: string;
  possibleConditions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  disclaimerText: string;
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

  // Method for generating content with multimodal input (text + image)
  private async generateMultimodalContent(prompt: string, base64Image: string): Promise<string> {
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
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
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
      console.error('Gemini multimodal API call error:', error);
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

  async analyzeSymptoms(symptomData: SymptomData): Promise<SymptomAnalysis> {
    try {
      let prompt = this.createSymptomAnalysisPrompt(symptomData);
      let response: string;

      // If there's an image, include it in the analysis
      if (symptomData.hasVisibleSymptoms && symptomData.imageUri) {
        try {
          const base64Image = await FileSystem.readAsStringAsync(symptomData.imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Enhanced prompt for image analysis
          prompt = `
${prompt}

ADDITIONAL INSTRUCTION: Analyze the provided image showing visible symptoms. Include observations from the image in your assessment and recommendations.

Image Analysis: Describe what you observe in the image that might be related to the reported symptoms. Focus on visible skin conditions, rashes, swelling, discoloration, or other notable physical findings.
`;

          response = await this.generateMultimodalContent(prompt, base64Image);
        } catch (imageError) {
          console.warn('Image analysis failed, proceeding with text-only analysis:', imageError);
          response = await this.generateContent(prompt);
        }
      } else {
        response = await this.generateContent(prompt);
      }
      
      if (!response || response.trim().length === 0) {
        throw new Error('Failed to analyze symptoms');
      }

      const result = this.parseSymptomAnalysisResponse(response);
      return result;

    } catch (error) {
      console.error('Symptom analysis error:', error);
      throw new Error(
        error instanceof Error 
          ? `Symptom analysis failed: ${error.message}`
          : 'Failed to analyze symptoms'
      );
    }
  }

  private createSymptomAnalysisPrompt(symptomData: SymptomData): string {
    const selectedSymptoms = symptomData.symptoms.map(s => s.replace('_', ' ')).join(', ');
    
    return `
You are a medical AI assistant providing preliminary health assessments. Analyze the following symptoms and provide guidance.

IMPORTANT: You are NOT providing a medical diagnosis. This is for informational purposes only.

Patient Information:
- Selected Symptoms: ${selectedSymptoms}
- Custom Symptoms: ${symptomData.customSymptoms || 'None'}
- Duration: ${symptomData.duration.replace('_', ' ')}
- Severity: ${symptomData.severity}
- Additional Information: ${symptomData.additionalInfo || 'None'}
- Has Visible Symptoms: ${symptomData.hasVisibleSymptoms ? 'Yes' : 'No'}

Instructions:
1. Provide a clear, empathetic assessment of the symptoms
2. List possible conditions that might cause these symptoms (3-5 most likely)
3. Determine urgency level: low, medium, high, or emergency
4. Provide 5-7 specific recommendations for next steps
5. Include appropriate medical disclaimers

Use the following urgency guidelines:
- EMERGENCY: Severe chest pain, difficulty breathing, severe bleeding, loss of consciousness, severe allergic reactions
- HIGH: High fever (>102°F), severe pain, persistent vomiting, signs of infection
- MEDIUM: Moderate symptoms lasting several days, concerning but not immediate
- LOW: Minor symptoms, common conditions, early stages

Please structure your response EXACTLY as follows:

## SYMPTOM ANALYSIS

### Assessment
[Provide a clear, empathetic assessment of the described symptoms in 2-3 sentences]

### Urgency Level
[State: emergency, high, medium, or low]

### Possible Conditions
[List 3-5 possible conditions, each on a new line with a bullet point]
- Condition 1
- Condition 2
- Condition 3
- Condition 4
- Condition 5

### Recommendations
[Provide 5-7 specific recommendations]
- Recommendation 1
- Recommendation 2
- Recommendation 3
- Recommendation 4
- Recommendation 5
- Recommendation 6
- Recommendation 7

### Disclaimer
This assessment is for informational purposes only and should not replace professional medical advice. If you are experiencing severe symptoms or are concerned about your health, please seek immediate medical attention or contact emergency services. Always consult with a qualified healthcare provider for proper diagnosis and treatment.

Please provide the complete analysis following the exact structure above:`;
  }

  private parseSymptomAnalysisResponse(response: string): SymptomAnalysis {
    try {
      // Extract assessment
      const assessmentMatch = response.match(/### Assessment\s*([\s\S]*?)(?=\n###|$)/i);
      const assessment = assessmentMatch ? assessmentMatch[1].trim() : 'Unable to analyze symptoms at this time.';

      // Extract urgency level
      const urgencyMatch = response.match(/### Urgency Level\s*([\s\S]*?)(?=\n###|$)/i);
      let urgencyLevel: 'low' | 'medium' | 'high' | 'emergency' = 'medium';
      
      if (urgencyMatch) {
        const urgencyText = urgencyMatch[1].trim().toLowerCase();
        if (urgencyText.includes('emergency')) urgencyLevel = 'emergency';
        else if (urgencyText.includes('high')) urgencyLevel = 'high';
        else if (urgencyText.includes('low')) urgencyLevel = 'low';
        else urgencyLevel = 'medium';
      }

      // Extract possible conditions
      const conditionsMatch = response.match(/### Possible Conditions\s*([\s\S]*?)(?=\n###|$)/i);
      let possibleConditions: string[] = [];
      
      if (conditionsMatch) {
        possibleConditions = conditionsMatch[1]
          .split('\n')
          .map(condition => condition.replace(/^[-•*\s]+/, '').trim())
          .filter(condition => condition.length > 0 && !condition.startsWith('###'))
          .slice(0, 5);
      }

      // Extract recommendations
      const recommendationsMatch = response.match(/### Recommendations\s*([\s\S]*?)(?=\n###|$)/i);
      let recommendations: string[] = [];
      
      if (recommendationsMatch) {
        recommendations = recommendationsMatch[1]
          .split('\n')
          .map(rec => rec.replace(/^[-•*\s]+/, '').trim())
          .filter(rec => rec.length > 0 && !rec.startsWith('###'))
          .slice(0, 7);
      }

      // Extract disclaimer
      const disclaimerMatch = response.match(/### Disclaimer\s*([\s\S]*?)(?=\n###|$)/i);
      const disclaimerText = disclaimerMatch ? disclaimerMatch[1].trim() : 
        'This assessment is for informational purposes only and should not replace professional medical advice. Please consult with a qualified healthcare provider for proper diagnosis and treatment.';

      // Fallback values if parsing fails
      if (possibleConditions.length === 0) {
        possibleConditions = [
          'Multiple conditions could cause these symptoms',
          'Professional evaluation needed for accurate diagnosis'
        ];
      }

      if (recommendations.length === 0) {
        recommendations = [
          'Monitor your symptoms closely',
          'Rest and stay hydrated',
          'Consider over-the-counter treatments if appropriate',
          'Consult a healthcare provider if symptoms worsen',
          'Seek immediate medical attention if you experience severe symptoms'
        ];
      }

      return {
        assessment,
        possibleConditions,
        urgencyLevel,
        recommendations,
        disclaimerText
      };

    } catch (error) {
      console.error('Error parsing symptom analysis response:', error);
      
      // Return safe fallback response
      return {
        assessment: 'Based on your symptoms, it would be best to consult with a healthcare provider for proper evaluation.',
        possibleConditions: [
          'Multiple conditions could cause these symptoms',
          'Professional medical evaluation recommended'
        ],
        urgencyLevel: 'medium',
        recommendations: [
          'Monitor your symptoms closely',
          'Rest and stay hydrated',
          'Keep track of symptom changes',
          'Consult a healthcare provider',
          'Seek immediate medical attention if symptoms worsen'
        ],
        disclaimerText: 'This assessment is for informational purposes only and should not replace professional medical advice. Please consult with a qualified healthcare provider for proper diagnosis and treatment.'
      };
    }
  }

  // Simplified image analysis method for visible symptoms
  async analyzeSymptomImage(imageUri: string, symptoms: string[]): Promise<string> {
    try {
      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const prompt = `
Analyze this medical image showing visible symptoms. The patient has reported: ${symptoms.join(', ')}.

Please describe what you observe in the image that might be related to these symptoms. Focus on:
1. Visible skin conditions, rashes, or discoloration
2. Swelling or inflammation
3. Any other notable physical findings
4. How these visual findings relate to the reported symptoms

Provide a brief, clinical description suitable for sharing with a healthcare provider.

IMPORTANT: Remind the user that image analysis cannot replace professional medical examination.
`;

      const response = await this.generateMultimodalContent(prompt, base64Image);
      return response;

    } catch (error) {
      console.error('Image analysis error:', error);
      return 'Image analysis is currently unavailable. Please describe your visible symptoms in text or consult with a healthcare provider.';
    }
  }
}

export const geminiService = new GeminiService();