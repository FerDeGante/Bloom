// src/components/PoolSection.jsx
"use client";

import Image from "next/image";
import Carousel from "react-bootstrap/Carousel";

export default function PoolSection() {
  return (
    <section className="pool-section py-5">
      <div className="container text-center">
        <h2 className="display-5 fw-bold mb-3">Estimulación Acuática</h2>
        <p className="lead mb-4">
          Disfruta de nuestra alberca climatizada para terapias personalizadas
        </p>
        <div className="carousel-container mx-auto">
          <Carousel variant="dark" controls interval={4000}>
            <Carousel.Item>
              <Image
                src="/images/alberca_bloom.png"
                alt="Alberca Bloom"
                width={900}
                height={500}
                style={{ objectFit: "cover", height: "500px", width: "100%" }}
              />
            </Carousel.Item>
            <Carousel.Item>
              <Image
                src="/images/estimulación_acuatica_2.png"
                alt="Estimulación Acuática"
                width={900}
                height={500}
                style={{ objectFit: "cover", height: "500px", width: "100%" }}
              />
            </Carousel.Item>
            <Carousel.Item>
              <Image
                src="/images/estimulación_acuatica.png"
                alt="Estimulación Acuática"
                width={900}
                height={500}
                style={{ objectFit: "cover", height: "500px", width: "100%" }}
              />
            </Carousel.Item>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
