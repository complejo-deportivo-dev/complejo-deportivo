import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "¿Cómo puedo hacer una reserva?",
    answer:
      "Inicia sesión o crea una cuenta, elige una categoría y un servicio, y selecciona una franja disponible. Luego completa los datos solicitados y el pago para confirmar tu reserva.",
  },
  {
    question: "¿Con cuánta anticipación puedo reservar?",
    answer:
      "Puedes consultar y elegir franjas disponibles desde hoy hasta los próximos 15 días.",
  },
  {
    question: "¿Cómo recibo el código para ingresar?",
    answer:
      "Cuando tu reserva se confirma, recibirás un código QR por correo. También podrás encontrarlo en la sección “Mis reservas” para presentarlo en el complejo.",
  },
  {
    question: "¿Qué ocurre si el pago falla o vence el tiempo?",
    answer:
      "La franja se libera si el pago falla o si no se completa dentro de los 10 minutos del bloqueo temporal. Después podrás volver a consultar la disponibilidad y elegir otra franja.",
  },
  {
    question: "¿Puedo reservar para varias personas?",
    answer:
      "En los servicios individuales puedes seleccionar la cantidad de personas, siempre que esté dentro del cupo disponible. Para servicios grupales, la reserva se realiza con los datos del titular.",
  },
];

export default function ClubFAQSection() {
  return (
    <section
      id="preguntas-frecuentes"
      aria-labelledby="faq-heading"
      className="scroll-mt-24 border-t border-border px-6 py-16 lg:px-16 lg:py-20"
    >
      <div className="mx-auto max-w-[900px]">
        <div className="mb-10">
          <span className="text-xs font-bold tracking-widest text-secondary uppercase">
            Estamos para ayudarte
          </span>
          <h2
            id="faq-heading"
            className="mt-2 font-heading text-3xl font-extrabold text-text-primary lg:text-4xl"
          >
            Preguntas frecuentes
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map(({ question, answer }) => (
            <details
              key={question}
              className="group rounded-2xl border border-border bg-surface p-5 sm:p-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                  aria-hidden="true"
                  className="size-5 shrink-0 text-text-secondary transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-secondary">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
