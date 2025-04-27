'use client';
// app/[locale]/(auth)/signin/page.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default function SignInPage() {
  const t = useTranslations('Auth.login')
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    })
    
    if (result?.error) {
      // Handle error
    } else {
      router.push('/')
    }
  }

  return (
<form onSubmit={handleSubmit(onSubmit)}>
  <input placeholder={t('email')} {...register('email')} />
  {errors.email && <span>{errors.email.message}</span>}
  
  <input type="password" placeholder={t('password')} {...register('password')} />
  {errors.password && <span>{errors.password.message}</span>}
  
  <button type="submit">{t('submit')}</button>
</form>
  )
}