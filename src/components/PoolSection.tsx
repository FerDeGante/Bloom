// src/components/PoolSection.tsx
"use client";

import Image from "next/image";
import Carousel from "react-bootstrap/Carousel";

export default function PoolSection() {
  return (
    <section className="pool-section">
      <div className="container text-center">
        <h2 className="display-5 fw-bold mb-3">Estimulación Acuática</h2>
        <p className="lead mb-4">Disfruta de nuestra alberca climatizada para terapias personalizadas</p>
        <div className="carousel-container">
          <Carousel variant="dark" controls interval={4000}>
            <Carousel.Item>
              <Image
                src="/images/alberca_hd_bloom.png"
                alt="Alberca Bloom HD"
                width={900}
                height={500}
                style={{ objectFit: "cover", width: "100%", height: "500px" }}
              />
            </Carousel.Item>
            <Carousel.Item>
              <Image
                src="/images/pool_baby_animated.png"
                alt="Pool Baby Animated"
                width={900}
                height={500}
                style={{ objectFit: "cover", width: "100%", height: "500px" }}
              />
            </Carousel.Item>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
