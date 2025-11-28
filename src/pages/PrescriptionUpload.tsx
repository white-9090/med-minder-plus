import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { 
  Upload, 
  FileText, 
  Camera, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Eye,
  Plus
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useMedicineStore } from '../stores/medicineStore';
import { useSettingsStore } from '../stores/settingsStore';
import { cn } from '../lib/utils';

interface ExtractedMedicine {
  name: string;
  strength: string;
  form: string;
  instructions: string;
  quantity?: number;
  refills?: number;
  confidence: number;
}

interface OCRResult {
  medicines: ExtractedMedicine[];
  doctorName?: string;
  date?: string;
  pharmacy?: string;
  confidence: number;
}

const PrescriptionUpload: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addMedicine } = useMedicineStore();
  const { settings } = useSettingsStore();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<Set<number>>(new Set());

  const isElderlyMode = settings?.elderlyMode || false;

  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please upload an image or PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setError('');
    setOcrResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const simulateOCRProcessing = async (): Promise<OCRResult> => {
    // Simulate OCR processing with mock data
    const mockResults: OCRResult[] = [
      {
        medicines: [
          {
            name: 'Lisinopril',
            strength: '10mg',
            form: 'tablet',
            instructions: 'Take 1 tablet by mouth once daily',
            quantity: 30,
            refills: 2,
            confidence: 0.95
          },
          {
            name: 'Metformin',
            strength: '500mg',
            form: 'tablet',
            instructions: 'Take 1 tablet by mouth twice daily with meals',
            quantity: 60,
            refills: 5,
            confidence: 0.92
          }
        ],
        doctorName: 'Dr. Sarah Johnson',
        date: '2024-11-28',
        pharmacy: 'City Pharmacy',
        confidence: 0.93
      },
      {
        medicines: [
          {
            name: 'Amlodipine',
            strength: '5mg',
            form: 'tablet',
            instructions: 'Take 1 tablet by mouth once daily',
            quantity: 30,
            refills: 3,
            confidence: 0.88
          }
        ],
        doctorName: 'Dr. Michael Chen',
        date: '2024-11-27',
        pharmacy: 'Health Plus Pharmacy',
        confidence: 0.89
      }
    ];

    return mockResults[Math.floor(Math.random() * mockResults.length)];
  };

  const handleProcessPrescription = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setError('');

    try {
      // Simulate processing steps
      const steps = [
        { message: 'Uploading file...', progress: 20 },
        { message: 'Analyzing image...', progress: 40 },
        { message: 'Extracting text...', progress: 60 },
        { message: 'Identifying medicines...', progress: 80 },
        { message: 'Finalizing results...', progress: 100 }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProcessingProgress(step.progress);
      }

      const result = await simulateOCRProcessing();
      setOcrResult(result);
      
      // Auto-select all medicines with high confidence
      const highConfidenceMedicines = new Set(
        result.medicines
          .map((_, index) => index)
          .filter(index => result.medicines[index].confidence > 0.85)
      );
      setSelectedMedicines(highConfidenceMedicines);

    } catch (err) {
      setError('Failed to process prescription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMedicineToggle = (index: number) => {
    const newSelected = new Set(selectedMedicines);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedMedicines(newSelected);
  };

  const handleAddSelectedMedicines = async () => {
    if (!ocrResult || selectedMedicines.size === 0) return;

    try {
      for (const index of selectedMedicines) {
        const medicine = ocrResult.medicines[index];
        await addMedicine({
          name: medicine.name,
          strength: medicine.strength,
          form: medicine.form,
          colorTag: 'blue', // Default color
          stockCount: medicine.quantity || 30,
          refillThreshold: Math.max(7, Math.floor((medicine.quantity || 30) * 0.2)),
          notes: medicine.instructions,
        });
      }

      navigate('/medicines', { 
        state: { 
          message: `Successfully added ${selectedMedicines.size} medicine${selectedMedicines.size !== 1 ? 's' : ''} from prescription` 
        }
      });
    } catch (err) {
      setError('Failed to add medicines. Please try again.');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.8) return 'Medium';
    return 'Low';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className={cn(
            isElderlyMode && "h-12 text-lg px-4"
          )}
        >
          <ArrowLeft className={cn(
            "mr-2",
            isElderlyMode ? "h-6 w-6" : "h-4 w-4"
          )} />
          Back to Dashboard
        </Button>
      </div>

      <div>
        <h1 className={cn(
          "font-bold text-gray-900",
          isElderlyMode ? "text-3xl" : "text-2xl"
        )}>
          Prescription Scanner
        </h1>
        <p className={cn(
          "text-gray-600 mt-1",
          isElderlyMode ? "text-lg" : "text-base"
        )}>
          Upload a photo or scan of your prescription to automatically extract medicine information
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      {!uploadedFile && (
        <Card>
          <CardContent className="p-8">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <Upload className="h-12 w-12 text-gray-400" />
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
                
                <div>
                  <h3 className={cn(
                    "font-semibold text-gray-900",
                    isElderlyMode ? "text-2xl" : "text-xl"
                  )}>
                    Upload Prescription
                  </h3>
                  <p className={cn(
                    "text-gray-600 mt-2",
                    isElderlyMode ? "text-lg" : "text-base"
                  )}>
                    Drag and drop your prescription image here, or click to browse
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      className={cn(
                        "cursor-pointer",
                        isElderlyMode && "h-12 text-lg px-6"
                      )}
                    >
                      <Upload className={cn(
                        "mr-2",
                        isElderlyMode ? "h-6 w-6" : "h-4 w-4"
                      )} />
                      Choose File
                    </Button>
                  </label>

                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "cursor-pointer",
                        isElderlyMode && "h-12 text-lg px-6"
                      )}
                    >
                      <Camera className={cn(
                        "mr-2",
                        isElderlyMode ? "h-6 w-6" : "h-4 w-4"
                      )} />
                      Take Photo
                    </Button>
                  </label>
                </div>

                <p className={cn(
                  "text-gray-500",
                  isElderlyMode ? "text-base" : "text-sm"
                )}>
                  Supports JPG, PNG, and PDF files up to 10MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Preview */}
      {uploadedFile && !ocrResult && (
        <Card>
          <CardHeader>
            <CardTitle className={cn(
              "flex items-center",
              isElderlyMode ? "text-2xl" : "text-xl"
            )}>
              <FileText className={cn(
                "mr-2",
                isElderlyMode ? "h-7 w-7" : "h-5 w-5"
              )} />
              Uploaded File
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className={cn(
                  "font-medium text-gray-900",
                  isElderlyMode ? "text-lg" : "text-base"
                )}>
                  {uploadedFile.name}
                </p>
                <p className={cn(
                  "text-gray-600",
                  isElderlyMode ? "text-base" : "text-sm"
                )}>
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setUploadedFile(null)}
                  className={cn(
                    isElderlyMode && "h-12 text-lg px-6"
                  )}
                >
                  Remove
                </Button>
                <Button
                  onClick={handleProcessPrescription}
                  disabled={isProcessing}
                  className={cn(
                    isElderlyMode && "h-12 text-lg px-6"
                  )}
                >
                  <Eye className={cn(
                    "mr-2",
                    isElderlyMode ? "h-6 w-6" : "h-4 w-4"
                  )} />
                  Process Prescription
                </Button>
              </div>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-gray-600",
                    isElderlyMode ? "text-lg" : "text-base"
                  )}>
                    Processing prescription...
                  </span>
                  <span className={cn(
                    "text-gray-600",
                    isElderlyMode ? "text-lg" : "text-base"
                  )}>
                    {processingProgress}%
                  </span>
                </div>
                <Progress value={processingProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* OCR Results */}
      {ocrResult && (
        <div className="space-y-6">
          {/* Prescription Info */}
          <Card>
            <CardHeader>
              <CardTitle className={cn(
                isElderlyMode ? "text-2xl" : "text-xl"
              )}>
                Prescription Information
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ocrResult.doctorName && (
                  <div>
                    <p className={cn(
                      "text-gray-600",
                      isElderlyMode ? "text-base" : "text-sm"
                    )}>
                      Doctor
                    </p>
                    <p className={cn(
                      "font-medium text-gray-900",
                      isElderlyMode ? "text-lg" : "text-base"
                    )}>
                      {ocrResult.doctorName}
                    </p>
                  </div>
                )}
                
                {ocrResult.date && (
                  <div>
                    <p className={cn(
                      "text-gray-600",
                      isElderlyMode ? "text-base" : "text-sm"
                    )}>
                      Date
                    </p>
                    <p className={cn(
                      "font-medium text-gray-900",
                      isElderlyMode ? "text-lg" : "text-base"
                    )}>
                      {new Date(ocrResult.date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className={cn(
                    "text-gray-600",
                    isElderlyMode ? "text-base" : "text-sm"
                  )}>
                    Confidence
                  </p>
                  <p className={cn(
                    "font-medium",
                    getConfidenceColor(ocrResult.confidence),
                    isElderlyMode ? "text-lg" : "text-base"
                  )}>
                    {getConfidenceBadge(ocrResult.confidence)} ({(ocrResult.confidence * 100).toFixed(0)}%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Medicines */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={cn(
                  isElderlyMode ? "text-2xl" : "text-xl"
                )}>
                  Extracted Medicines
                </CardTitle>
                
                <Button
                  onClick={handleAddSelectedMedicines}
                  disabled={selectedMedicines.size === 0}
                  className={cn(
                    isElderlyMode && "h-12 text-lg px-6"
                  )}
                >
                  <Plus className={cn(
                    "mr-2",
                    isElderlyMode ? "h-6 w-6" : "h-4 w-4"
                  )} />
                  Add Selected ({selectedMedicines.size})
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {ocrResult.medicines.map((medicine, index) => (
                <Card 
                  key={index} 
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedMedicines.has(index) 
                      ? "border-blue-500 bg-blue-50" 
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => handleMedicineToggle(index)}
                >
                  <CardContent className={cn(
                    "p-4",
                    isElderlyMode && "p-6"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={cn(
                            "w-5 h-5 border-2 rounded flex items-center justify-center",
                            selectedMedicines.has(index)
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          )}>
                            {selectedMedicines.has(index) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          
                          <h3 className={cn(
                            "font-semibold text-gray-900",
                            isElderlyMode ? "text-xl" : "text-lg"
                          )}>
                            {medicine.name} {medicine.strength}
                          </h3>
                          
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            getConfidenceColor(medicine.confidence),
                            medicine.confidence >= 0.9 ? "bg-green-100" :
                            medicine.confidence >= 0.8 ? "bg-yellow-100" : "bg-red-100"
                          )}>
                            {getConfidenceBadge(medicine.confidence)}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className={cn(
                            "text-gray-600",
                            isElderlyMode ? "text-base" : "text-sm"
                          )}>
                            <strong>Form:</strong> {medicine.form}
                          </p>
                          <p className={cn(
                            "text-gray-600",
                            isElderlyMode ? "text-base" : "text-sm"
                          )}>
                            <strong>Instructions:</strong> {medicine.instructions}
                          </p>
                          {medicine.quantity && (
                            <p className={cn(
                              "text-gray-600",
                              isElderlyMode ? "text-base" : "text-sm"
                            )}>
                              <strong>Quantity:</strong> {medicine.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PrescriptionUpload;