'use client';

import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { THROW_TYPES } from '@/lib/throw-types';

function formatThrowType(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ThrowTypeSelect({
  value,
  onValueChange,
  label = 'Throw type',
  id,
}: {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  id?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Throw type" />
        </SelectTrigger>
        <SelectContent>
          {THROW_TYPES.map((throwType) => (
            <SelectItem key={throwType} value={throwType}>
              {formatThrowType(throwType)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
