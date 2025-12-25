import Image from "next/image";

export default function Hero() {
  return (
    <div className="w-full">
      <Image
        src="/images/banner.png"
        alt="Cloud Sculptor Designs - Unique 3D Printed Art"
        width={1920}
        height={600}
        className="w-full h-auto"
        priority
      />
    </div>
  );
}
