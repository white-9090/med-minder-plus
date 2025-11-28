import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useMedicineStore } from '../stores/medicineStore';
import { useSettingsStore } from '../stores/settingsStore';
import { MedicineForm as MedicineFormType, MedicineColorTag } from '../types';
import PillTag from '../components/PillTag';
import { cn } from '../lib/utils';

const MedicineForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const { medicines, addMedicine, updateMedicine, fetchMedicines } = useMedicineStore();
  const { settings } = useSettingsStore();

  const [formData, setFormData] = useState<MedicineFormType>({
    name: '',
    strength: '',
    form: 'tablet',
    colorTag: 'blue',
    stockCount: 30,
    refillThreshold: 7,
    nickname: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const isElderlyMode = settings?.elderlyMode || false;

  const medicineColors: { value: MedicineColorTag; label: string; color: string }[] = [
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
    { value: 'gray', label: 'Gray', color: 'bg-gray-500' },
  ];

  const medicineForms = [
    'tablet', 'capsule', 'liquid', 'injection', 'cream', 'drops', 'inhaler', 'patch'
  ];

  useEffect(() => {
    const loadMedicine = async () => {
      if (id && user) {
        setIsEditing(true);
        await fetchMedicines(user.id);
        
        const medicine = medicines.find(m => m.id === id);
        if (medicine) {
          setFormData({
            name: medicine.name,
            strength: medicine.strength,
            form: medicine.form,
            colorTag: medicine.colorTag,
            stockCount: medicine.stockCount,
            refillThreshold: medicine.refillThreshold,
            nickname: medicine.nickname || '',
            notes: medicine.notes || '',
          });
        } else {
          setError('Medicine not found');
        }
      }
    };

    loadMedicine();
  }, [id, user, medicines, fetchMedicines]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stockCount' || name === 'refillThreshold' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Medicine name is required');
      return;
    }

    if (!formData.strength.trim()) {
      setError('Medicine strength is required');
      return;
    }

    if (formData.stockCount < 0) {
      setError('Stock count cannot be negative');
      return;
    }

    if (formData.refillThreshold < 0) {
      setError('Refill threshold cannot be negative');
      return;
    }

    if (formData.refillThreshold >= formData.stockCount) {
      setError('Refill threshold should be less than current stock');
      return;
    }

    try {
      setIsLoading(true);

      if (isEditing && id) {
        await updateMedicine(id, formData);
      } else {
        await addMedicine(formData);
      }

      navigate('/medicines');
    } catch (err) {
      setError('Failed to save medicine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/medicines')}
          className={cn(
            isElderlyMode && "h-12 text-lg px-4"
          )}
        >
          <ArrowLeft className={cn(
            "mr-2",
            isElderlyMode ? "h-6 w-6" : "h-4 w-4"
          )} />
          Back to Medicines
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={cn(
            isElderlyMode ? "text-2xl" : "text-xl"
          )}>
            {isEditing ? 'Edit Medicine' : 'Add New Medicine'}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Preview */}
            {formData.name && formData.strength && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className={cn(
                  "text-base font-medium mb-2 block",
                  isElderlyMode && "text-lg"
                )}>
                  Preview
                </Label>
                <PillTag
                  name={formData.name}
                  strength={formData.strength}
                  form={formData.form}
                  colorTag={formData.colorTag}
                  size={isElderlyMode ? 'lg' : 'md'}
                />
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className={cn(
                  "text-base font-medium",
                  isElderlyMode && "text-lg"
                )}>
                  Medicine Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Lisinopril"
                  required
                  className={cn(
                    "mt-1",
                    isElderlyMode && "h-12 text-lg"
                  )}
                />
              </div>

              <div>
                <Label htmlFor="strength" className={cn(
                  "text-base font-medium",
                  isElderlyMode && "text-lg"
                )}>
                  Strength *
                </Label>
                <Input
                  id="strength"
                  name="strength"
                  value={formData.strength}
                  onChange={handleInputChange}
                  placeholder="e.g., 10mg"
                  required
                  className={cn(
                    "mt-1",
                    isElderlyMode && "h-12 text-lg"
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className={cn(
                  "text-base font-medium",
                  isElderlyMode && "text-lg"
                )}>
                  Form
                </Label>
                <Select
                  value={formData.form}
                  onValueChange={(value) => handleSelectChange('form', value)}
                >
                  <SelectTrigger className={cn(
                    "mt-1",
                    isElderlyMode && "h-12 text-lg"
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {medicineForms.map(form => (
                      <SelectItem key={form} value={form}>
                        {form.charAt(0).toUpperCase() + form.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={cn(
                  "text-base font-medium",
                  isElderlyMode && "text-lg"
                )}>
                  Color Tag
                </Label>
                <Select
                  value={formData.colorTag}
                  onValueChange={(value) => handleSelectChange('colorTag', value)}
                >
                  <SelectTrigger className={cn(
                    "mt-1",
                    isElderlyMode && "h-12 text-lg"
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {medicineColors.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center space-x-2">
                          <div className={cn("w-4 h-4 rounded-full", color.color)} />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stock Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stockCount" className={cn(
                  "text-base font-medium",
                  isElderlyMode && "text-lg"
                )}>
                  Current Stock Count
                </Label>
                <Input
                  id="stockCount"
                  name="stockCount"
                  type="number"
                  min="0"
                  value={formData.stockCount}
                  onChange={handleInputChange}
                  className={cn(
                    "mt-1",
                    isElderlyMode && "h-12 text-lg"
                  )}
                />
              </div>

              <div>
                <Label htmlFor="refillThreshold" className={cn(
                  "text-base font-medium",
                  isElderlyMode && "text-lg"
                )}>
                  Refill Threshold
                </Label>
                <Input
                  id="refillThreshold"
                  name="refillThreshold"
                  type="number"
                  min="0"
                  value={formData.refillThreshold}
                  onChange={handleInputChange}
                  className={cn(
                    "mt-1",
                    isElderlyMode && "h-12 text-lg"
                  )}
                />
                <p className={cn(
                  "text-gray-500 mt-1",
                  isElderlyMode ? "text-sm" : "text-xs"
                )}>
                  Alert when stock reaches this number
                </p>
              </div>
            </div>

            {/* Optional Fields */}
            <div>
              <Label htmlFor="nickname" className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Nickname (Optional)
              </Label>
              <Input
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder="e.g., Blood pressure pill"
                className={cn(
                  "mt-1",
                  isElderlyMode && "h-12 text-lg"
                )}
              />
              <p className={cn(
                "text-gray-500 mt-1",
                isElderlyMode ? "text-sm" : "text-xs"
              )}>
                A friendly name to help you remember this medicine
              </p>
            </div>

            <div>
              <Label htmlFor="notes" className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes about this medicine..."
                rows={3}
                className={cn(
                  "mt-1",
                  isElderlyMode && "text-lg"
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/medicines')}
                className={cn(
                  isElderlyMode && "h-12 text-lg px-6"
                )}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  isElderlyMode && "h-12 text-lg px-6"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className={cn(
                      "mr-2",
                      isElderlyMode ? "h-6 w-6" : "h-4 w-4"
                    )} />
                    {isEditing ? 'Update Medicine' : 'Add Medicine'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineForm;