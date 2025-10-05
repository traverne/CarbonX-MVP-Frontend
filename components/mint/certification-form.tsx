"use client"

import type React from "react"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const schema = z.object({
  project_name: z.string().min(1),
  issuer_name: z.string().min(1),
  location: z.string().min(1),
  methodology: z.string().min(1),
  amount: z.coerce.number().min(1),
  vintage_year: z.coerce
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 5),
  expiry: z.string().optional(), // date input; convert later
  standard: z.coerce.number().min(0).max(5),
  validation_proof: z.string().min(1),
  recipient: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional()
    .or(z.literal(""))
    .optional(),
})

export type CertificationFormData = z.infer<typeof schema>

export function CertificationForm(props: {
  onRequestSignature: (data: CertificationFormData) => Promise<void>
  onMint: (data: CertificationFormData) => Promise<void>
  signature?: string
  creditId?: string
  connected?: boolean
  loadingSignature?: boolean
  errorMessage?: string
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CertificationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      standard: 0,
    },
  })

  const onSubmitForSignature = (data: CertificationFormData) => props.onRequestSignature(data)
  const onSubmitForMint = (e: React.FormEvent) => {
    e.preventDefault()
    const data = watch()
    props.onMint(data)
  }

  return (
    <div className="space-y-6">
      {props.errorMessage && <div className="text-sm text-destructive">{props.errorMessage}</div>}
      <form onSubmit={handleSubmit(onSubmitForSignature)} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Project Name *</Label>
          <Input placeholder="Solar Farm Alpha" {...register("project_name")} />
          {errors.project_name && <p className="text-xs text-destructive mt-1">{errors.project_name.message}</p>}
        </div>

        <div>
          <Label>Issuer Name *</Label>
          <Input placeholder="Green Energy Corp" {...register("issuer_name")} />
          {errors.issuer_name && <p className="text-xs text-destructive mt-1">{errors.issuer_name.message}</p>}
        </div>

        <div>
          <Label>Location *</Label>
          <Input placeholder="California, USA" {...register("location")} />
          {errors.location && <p className="text-xs text-destructive mt-1">{errors.location.message}</p>}
        </div>

        <div>
          <Label>Methodology *</Label>
          <Input placeholder="ACM0002" {...register("methodology")} />
          {errors.methodology && <p className="text-xs text-destructive mt-1">{errors.methodology.message}</p>}
        </div>

        <div>
          <Label>Amount (CO₂e tons) *</Label>
          <Input type="number" min={1} placeholder="1000" {...register("amount")} />
          {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <Label>Vintage Year *</Label>
          <Input
            type="number"
            min={1900}
            max={new Date().getFullYear() + 5}
            placeholder="2024"
            {...register("vintage_year")}
          />
          {errors.vintage_year && <p className="text-xs text-destructive mt-1">{errors.vintage_year.message}</p>}
        </div>

        <div>
          <Label>Certification Standard *</Label>
          <Select onValueChange={(v) => setValue("standard", Number(v))} defaultValue="0">
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Verra</SelectItem>
              <SelectItem value="1">Gold Standard</SelectItem>
              <SelectItem value="2">CDM</SelectItem>
              <SelectItem value="3">ACR</SelectItem>
              <SelectItem value="4">CAR</SelectItem>
              <SelectItem value="5">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.standard && <p className="text-xs text-destructive mt-1">{errors.standard.message}</p>}
        </div>

        <div>
          <Label>Expiry Date (optional)</Label>
          <Input type="date" {...register("expiry")} />
        </div>

        <div className="md:col-span-2">
          <Label>Validation Proof *</Label>
          <Input placeholder="ipfs://Qm... or https://..." {...register("validation_proof")} />
          {errors.validation_proof && (
            <p className="text-xs text-destructive mt-1">{errors.validation_proof.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label>Recipient Address (optional)</Label>
          <Input placeholder="0x..." {...register("recipient")} />
          {errors.recipient && <p className="text-xs text-destructive mt-1">{errors.recipient.message}</p>}
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <Button type="submit" disabled={props.loadingSignature || !props.connected}>
            {props.loadingSignature ? "Requesting..." : "Request Signature"}
          </Button>
          {props.signature && props.creditId && (
            <span className="text-xs text-muted-foreground">
              Signature ready. Credit ID:{" "}
              <span className="font-mono">
                {props.creditId.slice(0, 10)}...{props.creditId.slice(-6)}
              </span>
            </span>
          )}
        </div>
      </form>

      <form onSubmit={onSubmitForMint}>
        <Button type="submit" disabled={!props.signature || !props.connected}>
          Mint Credit
        </Button>
      </form>
    </div>
  )
}
