import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * Reconciles a single reservation against Stripe.
 * If the Stripe PaymentIntent has succeeded, marks payment and reservation
 * as confirmed and generates the necessary QR codes.
 */
export async function reconcileReservationPayment(reservationId: number) {
  try {
    const reservation = await prisma.reservations.findUnique({
      where: { id: reservationId },
      include: {
        payments: true,
        qr_codes: true,
        reservation_slots: {
          where: { is_active: true },
          include: {
            time_slots: {
              include: {
                services: true,
              },
            },
          },
        },
      },
    });

    if (!reservation) return null;

    // If already confirmed and has QR codes, nothing to reconcile
    if (reservation.status === "confirmed" && reservation.qr_codes.length > 0) {
      return reservation;
    }

    const payment = reservation.payments;
    if (!payment?.stripe_payment_intent_id) {
      return reservation;
    }

    const intent = await stripe.paymentIntents.retrieve(
      payment.stripe_payment_intent_id
    );

    if (intent.status === "succeeded") {
      const service =
        reservation.reservation_slots[0]?.time_slots?.services ?? null;
      const count =
        service?.qr_type === "group" ? 1 : Math.max(1, reservation.quantity);

      const existingQrs = await prisma.qr_codes.findMany({
        where: { id_reservation: reservation.id },
      });

      if (existingQrs.length === 0) {
        const tokens: string[] = [];
        for (let i = 0; i < count; i += 1) {
          tokens.push(randomBytes(32).toString("hex"));
        }

        await prisma.$transaction(async (tx) => {
          await tx.payments.update({
            where: { stripe_payment_intent_id: payment.stripe_payment_intent_id },
            data: { status: "succeeded" },
          });

          await tx.reservations.update({
            where: { id: reservation.id },
            data: {
              status: "confirmed",
              expires_at: null,
            },
          });

          await tx.qr_codes.createMany({
            data: tokens.map((token) => ({
              id_reservation: reservation.id,
              token,
              used_at: null,
              used_by: null,
            })),
          });
        });
      } else if (reservation.status !== "confirmed") {
        await prisma.$transaction(async (tx) => {
          await tx.payments.update({
            where: { stripe_payment_intent_id: payment.stripe_payment_intent_id },
            data: { status: "succeeded" },
          });

          await tx.reservations.update({
            where: { id: reservation.id },
            data: {
              status: "confirmed",
              expires_at: null,
            },
          });
        });
      }

      // Re-fetch updated reservation
      return await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: {
          payments: true,
          qr_codes: true,
          reservation_slots: {
            where: { is_active: true },
            include: {
              time_slots: {
                include: {
                  services: true,
                },
              },
            },
          },
        },
      });
    }
  } catch (error) {
    console.error(
      `Error reconciling reservation ${reservationId} with Stripe:`,
      error
    );
  }

  return null;
}

/**
 * Expires any pending reservations that have exceeded their expires_at timestamp
 * and releases their reserved slots by setting is_active = false.
 */
export async function expireOutdatedReservations(userId?: string) {
  try {
    const now = new Date();
    const expiredReservations = await prisma.reservations.findMany({
      where: {
        status: "pending",
        expires_at: {
          lt: now,
        },
        ...(userId ? { id_user: userId } : {}),
      },
      select: {
        id: true,
      },
    });

    if (expiredReservations.length === 0) {
      return;
    }

    const ids = expiredReservations.map((r) => r.id);

    await prisma.$transaction(async (tx) => {
      await tx.reservations.updateMany({
        where: {
          id: { in: ids },
          status: "pending",
        },
        data: {
          status: "expired",
        },
      });

      await tx.reservation_slots.updateMany({
        where: {
          id_reservation: { in: ids },
          is_active: true,
        },
        data: {
          is_active: false,
        },
      });
    });
  } catch (error) {
    console.error("Error expiring outdated reservations:", error);
  }
}

/**
 * Reconciles any pending reservations for a given user that have already been paid in Stripe,
 * and automatically marks any expired pending reservations as expired.
 */
export async function reconcileUserPendingReservations(userId: string) {
  try {
    const pendingWithPayment = await prisma.reservations.findMany({
      where: {
        id_user: userId,
        status: "pending",
        payments: {
          isNot: null,
        },
      },
      select: {
        id: true,
      },
    });

    for (const item of pendingWithPayment) {
      await reconcileReservationPayment(item.id);
    }

    await expireOutdatedReservations(userId);
  } catch (error) {
    console.error("Error reconciling user pending reservations:", error);
  }
}
