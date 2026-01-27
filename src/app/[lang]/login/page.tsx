import AuthForm from '@/components/AuthForm'
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";
import { Suspense } from 'react';

export default async function LoginPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthForm lang={lang} dict={dict} />
        </Suspense>
    )
}
