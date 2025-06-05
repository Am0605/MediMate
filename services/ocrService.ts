import * as FileSystem from 'expo-file-system';

class OCRService {
  private readonly API_KEY = 'K89515575788957'; // Get from ocr.space
  private readonly API_URL = 'https://api.ocr.space/parse/image';

  async extractTextFromImage(imageUri: string): Promise<string> {
    try {
      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Prepare form data
      const formData = new FormData();
      formData.append('apikey', this.API_KEY);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('isTable', 'true');
      formData.append('OCREngine', '2');
      formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`OCR API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage?.[0] || 'OCR processing failed');
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
      console.error('OCR extraction error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to extract text from image'
      );
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

  // Alternative method using Google Cloud Vision API (more accurate but requires setup)
  async extractTextWithGoogleVision(imageUri: string): Promise<string> {
    // Implementation for Google Cloud Vision API
    // You would need to set up Google Cloud credentials
    throw new Error('Google Vision API not implemented yet');
  }
}

export const ocrService = new OCRService();