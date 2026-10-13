import { BookOpen, HeartPulse, Target, UsersRound, Waves } from "lucide-react";

const VALUES = [
  {
    title: "Muévete",
    description: "Encuentra espacios para entrenar y disfrutar del deporte.",
    icon: HeartPulse,
  },
  {
    title: "Recarga energía",
    description: "Haz una pausa y dedica tiempo a tu bienestar.",
    icon: Waves,
  },
  {
    title: "Comparte",
    description: "Vive cada visita en compañía de quienes más disfrutas.",
    icon: UsersRound,
  },
];

export default function ClubAboutSection() {
  return (
    <section
      id="nosotros"
      aria-labelledby="about-heading"
      className="scroll-mt-24 border-t border-border px-6 py-16 lg:px-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1280px] space-y-12">
        <div className="max-w-3xl">
          <span className="text-xs font-bold tracking-widest text-secondary uppercase">
            Conoce Otium Club
          </span>
          <h2
            id="about-heading"
            className="mt-2 font-heading text-3xl font-extrabold text-text-primary lg:text-4xl"
          >
            ¿Quiénes somos?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-text-secondary">
            Un espacio donde el deporte y el bienestar se encuentran para
            ayudarte a vivir con más equilibrio, energía y conexión.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-surface p-6">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-5 font-heading text-xl font-bold text-text-primary">
              Nuestra misión
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Inspirar un estilo de vida pleno a través del equilibrio entre el
              movimiento, el descanso y la comunidad. En Otium, trabajamos para
              ofrecer un espacio de vanguardia donde el deporte y el bienestar
              se fusionan. Nuestro compromiso es brindar a cada miembro las
              herramientas, las instalaciones y la motivación necesarias para
              que encuentre su propio ritmo, recargue su energía y disfrute de
              una vida más saludable y conectada.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-surface p-6">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-5 font-heading text-xl font-bold text-text-primary">
              Nuestra historia
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Otium nació de una visión simple pero poderosa: redefinir la
              relación con el ejercicio y el bienestar. En un mundo que nunca
              se detiene, nos dimos cuenta de la falta de espacios que no solo
              exigieran el máximo rendimiento físico, sino que también
              ofrecieran un refugio para relajar la mente y conectar con
              otros.
            </p>
          </article>
        </div>

        <ul className="grid gap-6 sm:grid-cols-3 lg:col-span-2">
          {VALUES.map(({ title, description, icon: Icon }) => (
            <li
              key={title}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-5 font-heading text-lg font-bold text-text-primary">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
