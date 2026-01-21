import AuthForm from '@/components/AuthForm'
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

export default async function LoginPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <AuthForm lang={lang} dict={dict} />
}
