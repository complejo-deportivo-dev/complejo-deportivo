"use client";

import Image from "next/image";
import { useTransform, type MotionValue, motion, useScroll } from "framer-motion";
import type { RefObject } from "react";

const IMAGES = [
  { src: "/images/piscina.webp", alt: "Piscinas climatizadas de Otium Club" },
  {
    src: "/images/zonas-humedas.webp",
    alt: "Zonas húmedas de Otium Club",
  },
  { src: "/images/gym.webp", alt: "Gimnasio de Otium Club" },
  { src: "/images/cancha.webp", alt: "Canchas deportivas de Otium Club" },
];

interface ScrollImageSequenceProps {
  target: RefObject<HTMLElement | null>;
}

function ImageLayer({
  index,
  progress,
}: {
  index: number;
  progress: MotionValue<number>;
}) {
  const lastIndex = IMAGES.length - 1;
  const start = index === 0 ? 0 : (index - 1) / lastIndex;
  const center = index / lastIndex;
  const end = index === lastIndex ? 1 : (index + 1) / lastIndex;
  const input = index === 0 || index === lastIndex
    ? [start, end]
    : [start, center, end];
  const opacityOutput =
    index === 0 ? [1, 0] : index === lastIndex ? [0, 1] : [0, 1, 0];
  const scaleOutput =
    index === 0 ? [1.2, 0.8] : index === lastIndex ? [0.8, 1.2] : [0.8, 1.2, 0.8];

  const opacity = useTransform(progress, input, opacityOutput);
  const scale = useTransform(progress, input, scaleOutput);

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ opacity, scale }}
    >
      <Image
        src={IMAGES[index].src}
        alt={IMAGES[index].alt}
        fill
        priority={index === 0}
        sizes="100vw"
        className="object-cover"
      />
    </motion.div>
  );
}

export default function ScrollImageSequence({
  target,
}: ScrollImageSequenceProps) {
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start start", "end end"],
  });
  const leftCurtain = useTransform(scrollYProgress, [0, 0.16], ["0%", "-105%"]);
  const rightCurtain = useTransform(scrollYProgress, [0, 0.16], ["0%", "105%"]);
  const curtainOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0]);

  return (
    <div className="absolute inset-0">
      {IMAGES.map((image, index) => (
        <ImageLayer key={image.src} index={index} progress={scrollYProgress} />
      ))}

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2 bg-gradient-to-r from-background/90 to-background/20"
        style={{ x: leftCurtain, opacity: curtainOpacity }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-1/2 bg-gradient-to-l from-background/90 to-background/20"
        style={{ x: rightCurtain, opacity: curtainOpacity }}
      />
    </div>
  );
}
