import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getInitials } from "@/lib/utils";
import { Camera, User } from "lucide-react";
import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import useUser from "@/hooks/use-user";

interface UpdateProfilePictureProps {
    onImageChange?: (base64Image: string) => void;
    previewImage?: string | null;
    autoUpdate?: boolean;
}

export default function UpdateProfilePicture({ onImageChange, previewImage, autoUpdate = false }: UpdateProfilePictureProps) {
    const { userData, setUserData } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showError, showSuccess } = useToast();
    const { updateUser } = useUser();

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!userData) return;

        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            showError("Por favor, selecione apenas arquivos de imagem");
            return;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError("A imagem deve ter no máximo 5MB");
            return;
        }

        try {
            const base64 = await convertToBase64(file);
            onImageChange?.(base64);
            if (autoUpdate) {
                try {
                    await updateUser(userData?.id, { profilePicture: base64 });
                    setUserData({ ...userData, profilePicture: base64 });
                    showSuccess("Foto de perfil atualizada com sucesso");
                } catch (error) {
                    showError("Erro ao atualizar a foto de perfil");
                    console.error(error);
                }
            }
        } catch (error) {
            showError("Erro ao processar a imagem");
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/30">
                    <AvatarImage src={previewImage || userData?.profilePicture || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl font-semibold">
                        {userData ? getInitials(userData.username) : <User />}
                    </AvatarFallback>
                </Avatar>
                <Button
                    type="button"
                    size="icon"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Camera className="w-4 h-4" />
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />
            </div>
            <div className="text-center">
                <p className="text-sm text-muted-foreground"></p>
                Clique no ícone da câmera para alterar sua foto
            </div>
            <p className="text-xs text-muted-foreground">
                Máximo 5MB • JPG, PNG, GIF
            </p>
        </div>

    )
}