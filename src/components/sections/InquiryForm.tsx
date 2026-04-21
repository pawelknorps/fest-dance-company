import { useState } from 'react'
import { motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Turnstile } from '@marsidev/react-turnstile'
import { contact } from '../../data/contact'
import { SectionHeading } from '../ui/SectionHeading'
import type { CTAInquiry } from '../../types'
import { MagneticButton } from '../ui/MagneticButton'
import { useTranslation } from '../../lib/i18n'


export function InquiryForm() {
  const t = useTranslation()
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>(
    'idle',
  )

  const inquirySchema = z.object({
    serviceType: z.string().min(1, t.formValService),
    name: z.string().min(2, t.formValName),
    company: z.string(),
    email: z.string().email(t.formValEmail),
    deadline: z.string().min(2, t.formValDeadline),
    budget: z.string().min(1, t.formValBudget),
    brief: z.string().min(20, t.formValBrief),
  })

  type InquiryInput = z.infer<typeof inquirySchema>

  const initialForm: CTAInquiry = {
    serviceType: t.lang === 'pl' ? contact.serviceOptions[0] : 'Concerts',
    name: '',
    company: '',
    email: '',
    deadline: '',
    budget: t.lang === 'pl' ? contact.budgetOptions[1] : '10–25k',
    brief: '',
  }

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: initialForm satisfies InquiryInput,
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!turnstileToken) {
      setError('root', { message: t.formValTurnstile })
      return
    }

    setSubmitState('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, turnstileToken })
      })

      if (!response.ok) {
        throw new Error('api_error')
      }

      setSubmitState('success')
      reset(initialForm)
      setTurnstileToken('')
    } catch {
      setSubmitState('error')
      setError('root', {
        message: t.formValSubmitError,
      })
    }
  })

  const budgetOptions = t.lang === 'pl' 
    ? contact.budgetOptions 
    : ['< 10k', '10–25k', '25–50k', '50k +']
    
  const serviceOptions = t.lang === 'pl'
    ? contact.serviceOptions
    : ['Concerts', 'Music Videos', 'Events', 'Ad Campaigns']

  return (
    <section id="kontakt" className="section-premium section-shell">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <div>
          <SectionHeading
            eyebrow="Inquiry"
            title={t.inquiryHeadline}
            copy={t.inquiryBody}
          />

          <div className="mt-8 space-y-4 border-t border-white/12 pt-6 text-sm uppercase tracking-[0.24em] text-white/58">

            <p>{t.contactEmail}</p>
            <p>{contact.phone}</p>
            <p>{t.contactCity}</p>
            <p>{t.contactAvailability}</p>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.75 }}
          onSubmit={onSubmit}
          noValidate
          className="rounded-[32px] border border-white/10 bg-white/[0.035] p-[clamp(1.5rem,1.1rem+1.4vw,2rem)]"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={t.formService} error={errors.serviceType?.message}>
              <select {...register('serviceType')} className="field-base" data-cursor={t.cursorClick}>
                {serviceOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </FormField>

            <FormField label={t.formBudget} error={errors.budget?.message}>
              <select {...register('budget')} className="field-base" data-cursor={t.cursorClick}>
                {budgetOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </FormField>

            <FormField label={t.formName} error={errors.name?.message}>
              <input {...register('name')} className="field-base" data-cursor={t.cursorType} />
            </FormField>

            <FormField label={t.formCompany} error={errors.company?.message}>
              <input {...register('company')} className="field-base" data-cursor={t.cursorType} />
            </FormField>

            <FormField label={t.formEmail} error={errors.email?.message}>
              <input {...register('email')} type="email" className="field-base" data-cursor={t.cursorType} />
            </FormField>

            <FormField label={t.formDeadline} error={errors.deadline?.message}>
              <input
                {...register('deadline')}
                type="text"
                placeholder={t.formDeadlinePlaceholder}
                className="field-base"
                data-cursor={t.cursorType}
              />
            </FormField>
          </div>

          <FormField
            label={t.formBrief}
            error={errors.brief?.message}
            className="mt-4"
          >
            <textarea
              {...register('brief')}
              rows={6}
              className="field-base min-h-40 resize-y"
              data-cursor={t.cursorType}
            />
          </FormField>

{/* <div className="mt-6">
            <Turnstile
              siteKey="TWOJ_KLUCZ_PUBLICZNY_TURNSTILE" 
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken('')}
              options={{ theme: 'dark' }}
            />
          </div> */}

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <MagneticButton hitPadding={32}>
              <button
                type="submit"
                disabled={isSubmitting}
                data-cursor={t.cursorClick}
                className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff58f8,#a83fff)] px-6 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-black shadow-[0_0_32px_rgba(255,88,248,0.35)] transition disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-300"
              >
                {isSubmitting ? t.formSending : t.formSubmit}
              </button>
            </MagneticButton>

            <div aria-live="polite" className="max-w-md text-sm leading-7">
              {submitState === 'success' ? (
                <p className="text-emerald-300">
                  {t.formSuccess}
                </p>
              ) : null}
              {submitState === 'error' || errors.root?.message ? (
                <p className="text-rose-300">
                  {errors.root?.message ?? t.formError}
                </p>
              ) : null}
              {submitState === 'idle' ? (
                <p className="text-white/54">
                  {t.formIdle}
                </p>
              ) : null}
            </div>
          </div>
        </motion.form>
      </div>
    </section>
  )
}

type FormFieldProps = {
  label: string
  children: React.ReactNode
  className?: string
  error?: string
}

function FormField({
  label,
  children,
  className = '',
  error,
}: FormFieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-white/54">
        {label}
      </span>
      {children}
      <span className="mt-2 block min-h-6 text-sm text-rose-300">
        {error ?? ''}
      </span>
    </label>
  )
}
