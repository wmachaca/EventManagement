'use client';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'


const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export default function RegisterPage() {
  const t = useTranslations('Auth.register')
  const router = useRouter()
  const {locale} = router
  const { register, handleSubmit, formState: { errors,isSubmitting  } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    // Call API to register user, handle errors accordingly
    try {
      const result = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      const response = await result.json()

      if (!response.success) {
        // Handle registration error, show message to user
        //   console.error('Registration failed:', response.error)
        alert(`Registration failed: ${response.error || 'Unknown error'}`)

      } else {
        // If registration succeeds, sign in the user automatically
        await signIn('credentials', {
          redirect: false,
          email: data.email,
          password: data.password,
        })
        router.push('/') // Redirect to home page after successful registration
      }
    } catch (error) {
      console.error('Error during registration:', error)
      alert('An error occurred during registration. Please try again later.')
    }
  }

  return (
    <div className="form-container">
      <h1>{t('title')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className="form-group">
          <label htmlFor="email">{t('email')}</label>
          <input 
            id="email"
            type="email" 
            placeholder={t('email')}
            {...register('email')} 
            className="input"
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">{t('password')}</label>
          <input 
            id="password"
            type="password" 
            placeholder={t('password')}
            {...register('password')} 
            className="input"
          />
          {errors.password && <span className="error-message">{errors.password.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
          <input 
            id="confirmPassword"
            type="password" 
            placeholder={t('confirmPassword')}
            {...register('confirmPassword')} 
            className="input"
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
        </div>

        <div className="form-footer">
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
