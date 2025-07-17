import AppLayout from "@/components/app-layout";
import InputText from "@/components/input-text";

export default function SearchPage() {
    return (
        <AppLayout>
            <InputText 
                label="Buscar filmes..."
            />
        </AppLayout>
    )
}