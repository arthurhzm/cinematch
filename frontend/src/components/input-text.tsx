import { forwardRef } from 'react';
import { Input } from './ui/input';
import type { FieldError } from 'react-hook-form';
import { Label } from './ui/label';

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    type: React.HTMLInputTypeAttribute;
    errors?: FieldError;
}

const InputText = forwardRef<HTMLInputElement, InputTextProps>(
    ({ label, type, errors, value, ...props }, ref) => {

        return (
            <div>
                <Label htmlFor={props.id}>{label}</Label>
                <Input
                    id={props.id}
                    ref={ref}
                    type={type}
                    value={value}
                    {...props}
                />
                {errors && <span className="text-red-500 text-xs mt-1">{errors.message}</span>}
            </div>
        );
    }
);

InputText.displayName = 'InputText';

export default InputText;
