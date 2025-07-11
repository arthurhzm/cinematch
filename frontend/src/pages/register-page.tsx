import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/input-text";
import InputPassword from "@/components/input-password";

export default function RegisterPage() {

    const schema = z.object({
        username: z.string().min(3, { message: "Informe um nome com pelo menos 3 caracteres" }),
        email: z.email({ message: "Email inválido" }),
        password: z.string().min(6, { message: "Senha é obrigatória" }),
        confirmPassword: z.string().min(6, { message: "Confirmação de senha é obrigatória" }),
    }).refine(data => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

    type RegisterFormData = z.infer<typeof schema>;

    const { register, handleSubmit, formState } = useForm<RegisterFormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = (data: RegisterFormData) => {
        console.log(data);
    }


    return (
        <div>
            <h1>Criar conta</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <InputText
                    label="Nome"
                    type="text"
                    {...register("username")}
                    errors={formState.errors.username}
                />
                <InputText
                    label="Email"
                    type="email"
                    {...register("email")}
                    errors={formState.errors.email}
                />
                <div className="flex">
                    <InputPassword
                        label="Senha"
                        {...register("password")}
                        errors={formState.errors.password}
                    />
                    <InputPassword
                        label="Confirmar Senha"
                        {...register("confirmPassword")}
                        errors={formState.errors.confirmPassword}
                    />
                </div>
                <div>
                    <Button className="mt-4" type="submit">
                        Criar conta
                    </Button>
                </div>
            </form>
        </div>
    )
}