import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calculator, IndianRupee } from 'lucide-react';
import { PriceCalculatorPayload } from '@/types/inventoryTypes';

interface PriceCalculatorProps {
  onCalculate: (payload: PriceCalculatorPayload) => Promise<void>;
  initialValues?: Partial<PriceCalculatorPayload>;
  isLoading?: boolean;
}

export function PriceCalculator({ onCalculate, initialValues, isLoading }: PriceCalculatorProps) {
  const [values, setValues] = useState({
    base_price: initialValues?.base_price || '',
    floor_rise_premium: initialValues?.floor_rise_premium || '0',
    facing_premium: initialValues?.facing_premium || '0',
    parking_charges: initialValues?.parking_charges || '0',
    other_charges: initialValues?.other_charges || '0',
  });

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  // Local calculation
  const total = Object.values(values).reduce((sum, val) => {
    const num = parseFloat(val) || 0;
    return sum + num;
  }, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Price Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs">Base Price</Label>
          <Input
            type="number"
            value={values.base_price}
            onChange={(e) => handleChange('base_price', e.target.value)}
            placeholder="8500000"
            className="h-8 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Floor Rise</Label>
            <Input
              type="number"
              value={values.floor_rise_premium}
              onChange={(e) => handleChange('floor_rise_premium', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Facing Premium</Label>
            <Input
              type="number"
              value={values.facing_premium}
              onChange={(e) => handleChange('facing_premium', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Parking</Label>
            <Input
              type="number"
              value={values.parking_charges}
              onChange={(e) => handleChange('parking_charges', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Other</Label>
            <Input
              type="number"
              value={values.other_charges}
              onChange={(e) => handleChange('other_charges', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-1">
            <IndianRupee className="h-3.5 w-3.5" />
            Total
          </span>
          <span className="text-lg font-bold">{total.toLocaleString('en-IN')}</span>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => onCalculate(values)}
          disabled={isLoading || !values.base_price}
        >
          Verify with Server
        </Button>
      </CardContent>
    </Card>
  );
}
