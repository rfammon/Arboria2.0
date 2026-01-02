import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import type { LucideIcon } from 'lucide-react';

interface ArrayFieldSectionProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    options?: string[];
    selectedValues: string[];
    onValueChange: (values: string[]) => void;
    placeholder?: string;
    customLabel?: string;
    columns?: number;
}

export function ArrayFieldSection({
    title,
    description,
    icon: Icon,
    options,
    selectedValues,
    onValueChange,
    placeholder = "Adicionar novo...",
    customLabel = "Outros:",
    columns = 2
}: ArrayFieldSectionProps) {
    const [inputValue, setInputValue] = useState('');

    const handleToggle = (value: string, checked: boolean) => {
        if (checked) {
            onValueChange([...selectedValues, value]);
        } else {
            onValueChange(selectedValues.filter(v => v !== value));
        }
    };

    const handleAddCustom = () => {
        if (inputValue.trim() && !selectedValues.includes(inputValue.trim())) {
            onValueChange([...selectedValues, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleRemove = (value: string) => {
        onValueChange(selectedValues.filter(v => v !== value));
    };

    const gridCols = columns === 3 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {Icon && <Icon className="w-5 h-5 text-primary" />}
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {options && options.length > 0 && (
                    <div className={`grid ${gridCols} gap-3`}>
                        {options.map((opt) => {
                            const isChecked = selectedValues.includes(opt);
                            return (
                                <div key={opt} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${title}-${opt}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) => handleToggle(opt, !!checked)}
                                    />
                                    <label
                                        htmlFor={`${title}-${opt}`}
                                        className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                        {opt}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className={options && options.length > 0 ? "pt-2 border-t mt-2" : ""}>
                    {options && options.length > 0 && (
                        <Label className="text-xs text-muted-foreground mb-2 block">{customLabel}</Label>
                    )}
                    <div className="flex gap-2">
                        <Input
                            placeholder={placeholder}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustom())}
                        />
                        <Button type="button" onClick={handleAddCustom} variant="secondary">
                            Adicionar
                        </Button>
                    </div>
                </div>

                {selectedValues.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {selectedValues.map((val, index) => (
                            <div
                                key={`${title}-selected-${index}`}
                                className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm animate-in fade-in zoom-in duration-200"
                            >
                                <span>{val}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(val)}
                                    className="text-muted-foreground hover:text-foreground ml-1"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
