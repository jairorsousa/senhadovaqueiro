"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, Copy, QrCode } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, CardContent, PaymentStatus } from "@senha-do-vaqueiro/ui";
import {
  createCheckoutPayment,
  getCheckoutPayment,
  type CheckoutOrder,
  type CheckoutPayment
} from "../../../lib/checkout";

export function PaymentStep({ order }: { order: CheckoutOrder }) {
  const started = useRef(false);
  const [createdPayment, setCreatedPayment] = useState<CheckoutPayment | null>(null);
  const [copied, setCopied] = useState(false);

  const createPaymentMutation = useMutation({
    mutationFn: () => createCheckoutPayment(order.id),
    onSuccess: (payment) => {
      setCreatedPayment(payment);
    }
  });

  const paymentQuery = useQuery({
    queryKey: ["checkout-payment", order.id],
    queryFn: () => getCheckoutPayment(order.id),
    enabled: Boolean(createdPayment),
    refetchInterval: (query) => (query.state.data?.status === "WAITING_PAYMENT" ? 5_000 : false)
  });

  const payment = paymentQuery.data ?? createdPayment;
  const status = toUiPaymentStatus(payment?.status);
  const error = createPaymentMutation.error as { error?: { message?: string } } | null;

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    createPaymentMutation.mutate();
  }, [createPaymentMutation]);

  async function copyPix() {
    if (!payment?.pixCopyPaste) return;
    await navigator.clipboard.writeText(payment.pixCopyPaste);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_280px]">
      <Card>
        <CardContent className="space-y-4 p-4">
          {createPaymentMutation.isPending && !payment ? (
            <div className="grid min-h-56 place-items-center rounded-md border border-dashed border-border bg-background">
              <div className="text-center">
                <QrCode aria-hidden="true" className="mx-auto h-10 w-10 text-primary" />
                <h3 className="mt-3 text-xl">Gerando Pix</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Estamos preparando a cobranca para confirmar suas senhas.
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {error.error?.message ?? "Nao foi possivel gerar o Pix."}
            </div>
          ) : null}

          {payment ? (
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="grid min-h-56 place-items-center rounded-md border border-border bg-white p-3">
                {payment.pixQrCode ? (
                  <img src={payment.pixQrCode} alt="QR Code Pix" className="h-48 w-48" />
                ) : (
                  <QrCode aria-hidden="true" className="h-10 w-10 text-primary" />
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Copia e cola Pix</p>
                  <div className="mt-2 rounded-md border border-border bg-background p-3 text-xs leading-relaxed text-foreground break-all">
                    {payment.pixCopyPaste}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center"
                  onClick={copyPix}
                  disabled={!payment.pixCopyPaste}
                >
                  {copied ? (
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Copy aria-hidden="true" className="h-4 w-4" />
                  )}
                  {copied ? "Copiado" : "Copiar codigo Pix"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  A senha fica confirmada somente depois da compensacao do pagamento.
                </p>
              </div>
            </div>
          ) : null}

          {(payment?.expiresAt ?? order.expiresAt) ? (
            <p className="flex items-center gap-2 text-sm text-warning">
              <Clock aria-hidden="true" className="h-4 w-4" />
              Pague antes de{" "}
              {new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(
                new Date(payment?.expiresAt ?? order.expiresAt ?? "")
              )}
            </p>
          ) : null}
        </CardContent>
      </Card>
      <PaymentStatus status={status} />
    </div>
  );
}

function toUiPaymentStatus(status: CheckoutPayment["status"] | undefined) {
  if (status === "PAID") return "paid";
  if (status === "EXPIRED") return "expired";
  if (status === "FAILED" || status === "CANCELLED") return "refused";
  return "waiting";
}
