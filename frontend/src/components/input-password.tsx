import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from "lucide-react"
import { Button } from './ui/button';
import type { FieldError } from 'react-hook-form';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface InputPasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    errors?: FieldError;
}

const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(
    ({ label, errors, value, ...props }, ref) => {

        const [showPassword, setShowPassword] = useState<boolean>(false);

        return (
            <div>
                <div className='flex'>
                    <Label htmlFor={props.id}>{label}</Label>
                    <Input
                        className='rounded-r-none'
                        type={!showPassword ? 'password' : 'text'}
                        ref={ref}
                        value={value}
                        {...props}
                    />
                    <Button
                        type='button'
                        size={"icon"}
                        className="rounded-l-none border-l-0 h-9.5"
                        onClick={() => setShowPassword(!showPassword)}>
                        {!showPassword ? <Eye className='text-white' /> : <EyeOff className='text-white' />}
                    </Button>
                </div>
                {errors && <span className="text-red-500 text-xs mt-1">{errors.message}</span>}
            </div>
        );
    }
);

InputPassword.displayName = 'InputPassword';

export default InputPassword;
