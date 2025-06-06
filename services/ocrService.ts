import * as FileSystem from 'expo-file-system';

export type OCRProvider = 'ocr_space' | 'google_cloud_vision';

class OCRService {
  private readonly OCR_SPACE_API_KEY = 'K89515575788957';
  private readonly OCR_SPACE_URL = 'https://api.ocr.space/parse/image';
  
  // Google Cloud Vision API configuration
  private readonly GOOGLE_CLOUD_API_KEY = 'AIzaSyDgb2I9TW2jeppythTZAarfNRfiBLMLnm4'; 
  private readonly GOOGLE_VISION_URL = 'https://vision.googleapis.com/v1/images:annotate';

  // OCR.space limitations
  private readonly OCR_SPACE_MAX_SIZE_MB = 1; //  free tier

  async extractTextFromImage(imageUri: string, preferredProvider: OCRProvider = 'ocr_space'): Promise<string> {
    try {
      // Get file info to check size
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      const fileSizeInMB = fileInfo.size ? fileInfo.size / (1024 * 1024) : 0;

      console.log(`Image size: ${fileSizeInMB.toFixed(2)} MB`);

      // Determine which OCR service to use
      const ocrProvider = this.determineOCRProvider(fileSizeInMB, preferredProvider);
      
      console.log(`Using OCR provider: ${ocrProvider}`);

      if (ocrProvider === 'google_cloud_vision') {
        return await this.extractTextWithGoogleCloudVision(imageUri);
      } else {
        return await this.extractTextWithOCRSpace(imageUri);
      }

    } catch (error) {
      console.error('OCR extraction error:', error);
      
      // If OCR.space fails and we haven't tried Google Cloud Vision, try it as fallback
      if (preferredProvider === 'ocr_space' && this.isGoogleCloudVisionAvailable()) {
        console.log('OCR.space failed, trying Google Cloud Vision as fallback...');
        try {
          return await this.extractTextWithGoogleCloudVision(imageUri);
        } catch (fallbackError) {
          console.error('Google Cloud Vision fallback also failed:', fallbackError);
        }
      }

      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to extract text from image'
      );
    }
  }

  private determineOCRProvider(fileSizeInMB: number, preferredProvider: OCRProvider): OCRProvider {
    // If file is too large for OCR.space, use Google Cloud Vision
    if (fileSizeInMB > this.OCR_SPACE_MAX_SIZE_MB) {
      if (this.isGoogleCloudVisionAvailable()) {
        console.log(`File size ${fileSizeInMB.toFixed(2)}MB exceeds OCR.space limit, switching to Google Cloud Vision`);
        return 'google_cloud_vision';
      } else {
        console.warn(`File size ${fileSizeInMB.toFixed(2)}MB exceeds OCR.space limit, but Google Cloud Vision not configured`);
        return 'ocr_space'; // Will likely fail, but let user know
      }
    }

    // If Google Cloud Vision is preferred and available, use it
    if (preferredProvider === 'google_cloud_vision' && this.isGoogleCloudVisionAvailable()) {
      return 'google_cloud_vision';
    }

    // Default to OCR.space
    return 'ocr_space';
  }

  private isGoogleCloudVisionAvailable(): boolean {
    return this.GOOGLE_CLOUD_API_KEY.length > 0;
  }

  private async extractTextWithOCRSpace(imageUri: string): Promise<string> {
    try {
      // Check file size before processing
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      const fileSizeInMB = fileInfo.size ? fileInfo.size / (1024 * 1024) : 0;
      
      if (fileSizeInMB > this.OCR_SPACE_MAX_SIZE_MB) {
        throw new Error(`Image size (${fileSizeInMB.toFixed(2)}MB) exceeds OCR.space limit of ${this.OCR_SPACE_MAX_SIZE_MB}MB`);
      }

      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Prepare form data
      const formData = new FormData();
      formData.append('apikey', this.OCR_SPACE_API_KEY);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('isTable', 'true');
      formData.append('OCREngine', '2');
      formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);

      const response = await fetch(this.OCR_SPACE_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`OCR.space API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage?.[0] || 'OCR.space processing failed');
      }

      if (!result.ParsedResults || result.ParsedResults.length === 0) {
        throw new Error('No text found in the image');
      }

      const extractedText = result.ParsedResults[0].ParsedText;
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No readable text found in the image');
      }

      return this.cleanExtractedText(extractedText);

    } catch (error) {
      console.error('OCR.space error:', error);
      throw error;
    }
  }

  private async extractTextWithGoogleCloudVision(imageUri: string): Promise<string> {
    try {
      if (!this.isGoogleCloudVisionAvailable()) {
        throw new Error('Google Cloud Vision API key not configured');
      }

      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1,
              },
            ],
            imageContext: {
              languageHints: ['en'],
            },
          },
        ],
      };

      const response = await fetch(`${this.GOOGLE_VISION_URL}?key=${this.GOOGLE_CLOUD_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Cloud Vision API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();

      if (!result.responses || result.responses.length === 0) {
        throw new Error('No response from Google Cloud Vision API');
      }

      const response_data = result.responses[0];
      
      // Check for document text detection first (more structured)
      if (response_data.fullTextAnnotation) {
        const extractedText = response_data.fullTextAnnotation.text;
        if (extractedText && extractedText.trim().length > 0) {
          return this.cleanExtractedText(extractedText);
        }
      }

      // Fallback to text annotations
      const textAnnotations = response_data.textAnnotations;
      if (!textAnnotations || textAnnotations.length === 0) {
        throw new Error('No text found in the image');
      }

      const extractedText = textAnnotations[0].description;
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No readable text found in the image');
      }

      return this.cleanExtractedText(extractedText);

    } catch (error) {
      console.error('Google Cloud Vision error:', error);
      throw error;
    }
  }

  private cleanExtractedText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Get available OCR providers
  getAvailableProviders(): { provider: OCRProvider; name: string; available: boolean }[] {
    return [
      {
        provider: 'ocr_space',
        name: 'OCR.space (Free)',
        available: true,
      },
      {
        provider: 'google_cloud_vision',
        name: 'Google Cloud Vision',
        available: this.isGoogleCloudVisionAvailable(),
      },
    ];
  }

  // Legacy method for backward compatibility
  async extractTextWithGoogleVision(imageUri: string): Promise<string> {
    return await this.extractTextWithGoogleCloudVision(imageUri);
  }
}

export const ocrService = new OCRService();