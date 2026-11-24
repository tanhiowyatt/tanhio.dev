"use client";

import { siteConfig } from "@/config/site";
import { revealOnMount } from "@/lib/motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  Loader2,
  Upload,
} from "@/components/shared/site-icons";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Step = "idle" | "claimed";

type ClaimError = {
  message: string;
};

type ClaimedSeat = {
  name: string;
  url: string;
  logoName: string;
};

const MAX_LOGO_BYTES = 512 * 1024;
const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];

const SHARE_URL = `https://x.com/intent/post?text=${encodeURIComponent(
  "Just backed this work. Small support, good company.",
)}&url=${encodeURIComponent(`${siteConfig.meta.url}/#sponsors`)}`;

const NEXT_STEPS = [
  {
    label: "Seat details saved",
    detail: "Your name, link and logo are committed.",
    state: "done",
  },
  {
    label: "Deploy running",
    detail: "The site is rebuilding with your seat in it.",
    state: "active",
  },
  {
    label: "On the supporter list",
    detail: "Usually a minute or two from now.",
    state: "pending",
  },
] as const;

const inputClass =
  "micro-transition min-h-11 w-full min-w-0 rounded-md bg-background px-3 py-2.5 text-sm text-foreground ring-1 ring-inset ring-border " +
  "placeholder:text-muted-foreground hover:ring-muted-foreground/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60";
const labelClass = "mb-2 block text-sm font-medium text-foreground";
const COLUMN = "mx-auto w-full max-w-2xl px-4";
const linkClass =
  "micro-transition rounded-sm text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";
const actionClass =
  "micro-transition inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const primaryButtonClass =
  "micro-transition inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-60";

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 font-mono text-[11px] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm">{children}</dd>
    </div>
  );
}

/** Claim form. Verify payment and claim seat in one submit. */
export function ClaimForm() {
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("orderId") ?? "";

  const [step, setStep] = useState<Step>("idle");
  const [senderAddress, setSenderAddress] = useState("");
  const [orderId, setOrderId] = useState(urlOrderId);
  const [url, setUrl] = useState("");
  const [claimError, setClaimError] = useState<ClaimError | null>(null);
  const [claimed, setClaimed] = useState<ClaimedSeat | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoName, setLogoName] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  useEffect(() => {
    if (claimError) errorRef.current?.focus();
  }, [claimError]);

  useEffect(() => {
    if (step === "claimed") {
      successRef.current?.focus();
      return;
    }
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      if (!logoName) return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [step, logoName]);

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    const message = file && !ACCEPTED_LOGO_TYPES.includes(file.type)
      ? "Choose a PNG, JPEG or WebP image."
      : file && file.size > MAX_LOGO_BYTES
        ? "This image is too large. Choose one under 512 KB."
        : file && file.size === 0
          ? "This file is empty. Choose another image."
          : null;

    input.setCustomValidity(message ?? "");
    setLogoError(message);
    setLogoName(file?.name ?? "");
    setLogoPreview(file && !message ? URL.createObjectURL(file) : null);
    if (message) input.focus();
  }

  function removeLogo() {
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
      logoInputRef.current.setCustomValidity("");
      logoInputRef.current.focus();
    }
    setLogoError(null);
    setLogoName("");
    setLogoPreview(null);
  }

  function handleLinkChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUrl(event.currentTarget.value.trim());
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!orderId) {
      setClaimError({ message: "No payment order id provided." });
      return;
    }

    const data = new FormData(event.currentTarget);
    data.set("orderId", orderId);
    data.set("senderAddress", senderAddress);
    data.set("url", url);

    const rawUrl = url.trim();
    if (rawUrl) {
      try {
        new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
      } catch {
        setClaimError({ message: "The URL must start with http:// or https://." });
        return;
      }
    }

    setIsSubmitting(true);
    setClaimError(null);

    try {
      const response = await fetch("/api/ton/claim", {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setClaimError({
          message:
            body?.error ??
            "The claim could not be saved. Check the sender address and order id.",
        });
        setIsSubmitting(false);
        return;
      }
      setClaimed({
        name: String(data.get("name") ?? "").trim(),
        url: rawUrl,
        logoName,
      });
      setStep("claimed");
    } catch {
      setClaimError({
        message:
          "The claim could not be saved. Check your connection and try again.",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className={`${COLUMN} pb-8`}>
        {/* Section 01: Payment verification inputs (no button) */}
        <section aria-labelledby="claim-verify" className="pb-8">
          <motion.div {...revealOnMount({ y: 6 })}>
            <h2
              ref={errorRef}
              id="claim-verify"
              tabIndex={-1}
              className="w-fit rounded-sm text-base font-medium tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Verify your TON payment
            </h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              Enter the TON wallet address you sent from and the order id.
              We’ll check the blockchain when you claim your seat below.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="verify-sender" className={labelClass}>
                  Sender address
                </label>
                <input
                  id="verify-sender"
                  type="text"
                  autoComplete="off"
                  placeholder="EQC… or UQC…"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value.trim())}
                  className={inputClass}
                />
                <p id="verify-sender-help" className="mt-2 text-xs text-muted-foreground">
                  The TON wallet address that sent the payment.
                </p>
              </div>
              <div>
                <label htmlFor="verify-order-id" className={labelClass}>
                  Order id
                </label>
                <input
                  id="verify-order-id"
                  type="text"
                  autoComplete="off"
                  placeholder="ton_…"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.trim())}
                  className={inputClass}
                />
                <p id="verify-order-id-help" className="mt-2 text-xs text-muted-foreground">
                  The order id shown when you created the payment.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 02: Personalize seat + claim (one button) */}
        <section aria-labelledby="claim-personalize" className="pb-8">
          <motion.div {...revealOnMount({ y: 6 })}>
            <form
              onSubmit={handleSubmit}
              aria-label="Claim your sponsor seat"
              aria-busy={isSubmitting}
            >
              <div aria-hidden="true" className="mb-1 flex items-center gap-2.5 text-sm font-medium tracking-tight">
                <span className="font-mono text-[11px] tabular-nums text-primary">02</span>
                Personalize your seat
              </div>
              <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
                All optional. Leave a field blank to keep its current details.
              </p>
              <fieldset
                disabled={isSubmitting}
                className="mt-7 min-w-0 border-t border-dashed pt-6"
              >
                <div className="space-y-5">
                  <div>
                    <label htmlFor="claim-name" className={labelClass}>
                      Display name
                    </label>
                    <input
                      id="claim-name"
                      name="name"
                      type="text"
                      autoComplete="nickname"
                      maxLength={60}
                      placeholder="Your name or project…"
                      className={inputClass}
                    />
                  </div>
                  <div className="micro-transition flex min-h-11 items-stretch overflow-hidden rounded-md bg-background ring-1 ring-inset ring-border focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
                    <span
                      aria-hidden="true"
                      className="flex select-none items-center border-r bg-muted px-3 font-mono text-xs text-muted-foreground"
                    >
                      https://
                    </span>
                    <input
                      id="claim-link-url"
                      name="url"
                      type="text"
                      inputMode="url"
                      autoComplete="url"
                      spellCheck={false}
                      autoCapitalize="none"
                      maxLength={292}
                      placeholder="your-site.dev"
                      value={url}
                      onChange={handleLinkChange}
                      className="min-h-11 w-full min-w-0 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                  <p id="claim-link-help" className="mt-2 text-xs text-muted-foreground">
                    Your website, repo, or profile. Shown next to your name.
                  </p>
                  <div>
                    <label htmlFor="claim-logo" className={labelClass}>
                      Your logo
                    </label>
                    <div className="relative rounded-md bg-muted/20 ring-1 ring-inset ring-border focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
                      <input
                        ref={logoInputRef}
                        id="claim-logo"
                        name="logo"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleLogoChange}
                        aria-describedby={`claim-logo-help${logoError ? " claim-logo-error" : ""}`}
                        aria-invalid={Boolean(logoError)}
                        className="peer sr-only"
                      />
                      <label htmlFor="claim-logo" className="micro-transition flex min-h-20 cursor-pointer items-center gap-3 rounded-md p-3 hover:bg-muted/60 peer-disabled:cursor-wait peer-disabled:opacity-60">
                        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background text-muted-foreground">
                          {logoPreview ? (
                            <Image src={logoPreview} alt="" width={40} height={40} className="size-full object-cover" />
                          ) : (
                            <Upload className="size-4" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-medium" title={logoName || undefined}>
                            {logoName || "Choose a logo"}
                          </span>
                          <span className="mt-1 block text-[11px] text-muted-foreground">
                            PNG, JPEG or WebP · Up to 512 KB
                          </span>
                        </span>
                      </label>
                    </div>
                    {logoName && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        className={`${linkClass} mt-2 min-h-8 text-xs`}
                      >
                        Remove logo
                      </button>
                    )}
                    {logoError && (
                      <p id="claim-logo-error" role="alert" className="mt-2 text-xs leading-relaxed text-destructive">
                        {logoError}
                      </p>
                    )}
                    <p id="claim-logo-help" className="mt-2 text-xs text-muted-foreground">
                      Shown in a circle. Skip it to keep your generated avatar.
                    </p>
                  </div>
                </div>
              </fieldset>

              <div className="mt-7 border-t border-dashed pt-5">
                {claimError && (
                  <div
                    ref={errorRef}
                    tabIndex={-1}
                    role="alert"
                    className="mb-4 space-y-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
                  >
                    <p className="flex items-start gap-2 rounded-md bg-destructive/5 p-3 text-xs leading-relaxed text-destructive">
                      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                      <span>{claimError.message}</span>
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={primaryButtonClass}
                >
                  {isSubmitting
                    ? <><Loader2 aria-hidden className="size-4 motion-safe:animate-spin" /> Saving your seat…</>
                    : <>Claim my seat <ArrowRight aria-hidden className="size-4" /></>}
                </button>
                <span role="status" className="sr-only">
                  {isSubmitting ? "Saving your seat. Please wait." : ""}
                </span>
                <p className="mt-3 text-pretty text-xs leading-relaxed text-muted-foreground">
                  Check your details before claiming. This form can only be
                  submitted once per seat.
                </p>
              </div>
            </form>
          </motion.div>
        </section>

        {/* Section 03: Success */}
        {step === "claimed" && (
          <section aria-labelledby="claim-success" className="pb-8">
            <motion.div {...revealOnMount({ y: 6 })}>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[11px] text-primary ring-1 ring-inset ring-primary/25">
                <Check aria-hidden className="size-3" />
                Seat claimed
              </p>
              <h2
                ref={successRef}
                id="claim-success"
                tabIndex={-1}
                className="mt-3 w-fit rounded-sm text-base font-medium tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                You’re in, right beside Bit.
              </h2>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                Your details are saved and a deploy is already on its way.
                There is nothing else for you to do.
              </p>

              <div className="mt-7 border-t border-dashed pt-6">
                <p className="text-sm font-medium tracking-tight">What you saved</p>
                <dl className="mt-2 divide-y divide-dashed">
                  <SummaryRow label="Display name">
                    {claimed?.name || (
                      <span className="text-muted-foreground">Left as it was</span>
                    )}
                  </SummaryRow>
                  <SummaryRow label="Link">
                    {claimed?.url ? (
                      <a
                        href={`https://${claimed.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${linkClass} inline-flex max-w-full items-center gap-1`}
                      >
                        <span className="truncate">{claimed.url}</span>
                        <ArrowUpRight aria-hidden className="size-3.5 shrink-0" />
                        <span className="sr-only">, opens in a new tab</span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground">None added</span>
                    )}
                  </SummaryRow>
                  <SummaryRow label="Logo">
                    {claimed?.logoName || (
                      <span className="text-muted-foreground">Generated avatar kept</span>
                    )}
                  </SummaryRow>
                </dl>
              </div>

              <div className="mt-7 border-t border-dashed pt-6">
                <p className="text-sm font-medium tracking-tight">What happens next</p>
                <ol className="mt-3 space-y-3">
                  {NEXT_STEPS.map((stepItem) => (
                    <li key={stepItem.label} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                          stepItem.state === "done"
                            ? "bg-primary text-primary-foreground"
                            : stepItem.state === "active"
                              ? "ring-1 ring-inset ring-primary/50"
                              : "ring-1 ring-inset ring-border"
                        }`}
                      >
                        {stepItem.state === "done" ? (
                          <Check className="size-3" />
                        ) : (
                          <span
                            className={`size-1.5 rounded-full ${
                              stepItem.state === "active"
                                ? "bg-primary motion-safe:animate-pulse"
                                : "bg-muted-foreground/40"
                            }`}
                          />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-sm ${
                            stepItem.state === "pending"
                              ? "text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {stepItem.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {stepItem.detail}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-7 border-t border-dashed pt-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/#sponsors"
                    className={`${actionClass} bg-primary text-primary-foreground hover:bg-primary/90`}
                  >
                    See the supporters <ArrowRight aria-hidden className="size-4" />
                  </Link>
                  <a
                    href={SHARE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${actionClass} bg-background ring-1 ring-inset ring-border hover:bg-muted`}
                  >
                    Share on X <ArrowUpRight aria-hidden className="size-4" />
                    <span className="sr-only">, opens in a new tab</span>
                  </a>
                </div>
                <p className="mt-3 text-pretty text-xs leading-relaxed text-muted-foreground">
                  The seat is permanent. Nothing renews, nothing expires, and
                  there is nothing to manage.
                </p>
              </div>
            </motion.div>
          </section>
        )}
      </div>
    </>
  );
}
