import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { ProcessedDocument } from '@/app/(ai)/medsimplify';

class DocumentStorage {
  private readonly STORAGE_KEY = 'processed_documents';
  private readonly DOCUMENTS_DIR = `${FileSystem.documentDirectory}medisimplify/`;

  constructor() {
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.DOCUMENTS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.DOCUMENTS_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Storage initialization error:', error);
    }
  }

  async saveProcessedDocument(document: ProcessedDocument): Promise<void> {
    try {
      // Save image to local directory
      const imageFileName = `doc_${document.id}.jpg`;
      const localImagePath = `${this.DOCUMENTS_DIR}${imageFileName}`;
      
      await FileSystem.copyAsync({
        from: document.imageUri,
        to: localImagePath,
      });

      // Update document with local image path
      const documentToSave: ProcessedDocument = {
        ...document,
        imageUri: localImagePath,
      };

      // Get existing documents
      const existingDocuments = await this.getAllDocuments();
      
      // Add new document
      const updatedDocuments = [...existingDocuments, documentToSave];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(
        this.STORAGE_KEY, 
        JSON.stringify(updatedDocuments)
      );

    } catch (error) {
      console.error('Save document error:', error);
      throw new Error('Failed to save document');
    }
  }

  async getAllDocuments(): Promise<ProcessedDocument[]> {
    try {
      const documentsJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (!documentsJson) {
        return [];
      }

      const documents: ProcessedDocument[] = JSON.parse(documentsJson);
      
      // Convert timestamp strings back to Date objects
      return documents.map(doc => ({
        ...doc,
        timestamp: new Date(doc.timestamp),
      }));

    } catch (error) {
      console.error('Get documents error:', error);
      return [];
    }
  }

  async getDocumentById(id: string): Promise<ProcessedDocument | null> {
    try {
      const documents = await this.getAllDocuments();
      return documents.find(doc => doc.id === id) || null;
    } catch (error) {
      console.error('Get document by ID error:', error);
      return null;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const documents = await this.getAllDocuments();
      const documentToDelete = documents.find(doc => doc.id === id);
      
      if (documentToDelete) {
        // Delete image file
        const fileInfo = await FileSystem.getInfoAsync(documentToDelete.imageUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(documentToDelete.imageUri);
        }
      }

      // Remove from documents array
      const updatedDocuments = documents.filter(doc => doc.id !== id);
      
      // Save updated list
      await AsyncStorage.setItem(
        this.STORAGE_KEY, 
        JSON.stringify(updatedDocuments)
      );

    } catch (error) {
      console.error('Delete document error:', error);
      throw new Error('Failed to delete document');
    }
  }

  async getDocumentsByType(documentType: string): Promise<ProcessedDocument[]> {
    try {
      const documents = await this.getAllDocuments();
      return documents.filter(doc => doc.documentType === documentType);
    } catch (error) {
      console.error('Get documents by type error:', error);
      return [];
    }
  }

  async searchDocuments(query: string): Promise<ProcessedDocument[]> {
    try {
      const documents = await this.getAllDocuments();
      const lowercaseQuery = query.toLowerCase();
      
      return documents.filter(doc => 
        doc.originalText.toLowerCase().includes(lowercaseQuery) ||
        doc.simplifiedText.toLowerCase().includes(lowercaseQuery) ||
        doc.documentType.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Search documents error:', error);
      return [];
    }
  }

  async exportDocument(document: ProcessedDocument, format: 'txt' | 'json' = 'txt'): Promise<string> {
    try {
      const fileName = `medisimplify_${document.id}.${format}`;
      const filePath = `${this.DOCUMENTS_DIR}${fileName}`;

      let content: string;
      
      if (format === 'json') {
        content = JSON.stringify(document, null, 2);
      } else {
        content = `MedSimplify Export
Document Type: ${document.documentType}
Date: ${document.timestamp.toLocaleDateString()}

Original Text:
${document.originalText}

Simplified Version:
${document.simplifiedText}
`;
      }

      await FileSystem.writeAsStringAsync(filePath, content);
      return filePath;

    } catch (error) {
      console.error('Export document error:', error);
      throw new Error('Failed to export document');
    }
  }
}

export const documentStorage = new DocumentStorage();