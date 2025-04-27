// src/components/NuestrosServicios.jsx
import Link from "next/link";
import {
  FaWater,
  FaChild,
  FaHands,
  FaSpa,
  FaLeaf,
  FaDumbbell,
  FaAppleAlt,
  FaPills,
} from "react-icons/fa";

export default function NuestrosServicios() {
  const items = [
    { id: "agua",                   icon: <FaWater />,      label: "Estimulación en agua"          },
    { id: "piso",                   icon: <FaChild />,      label: "Estimulación en piso"          },
    { id: "quiropráctica",          icon: <FaHands />,      label: "Quiropráctica"                 },
    { id: "fisioterapia",           icon: <FaSpa />,        label: "Fisioterapia"                  },
    { id: "masajes",                icon: <FaLeaf />,       label: "Masajes"                       },
    { id: "cosmetologia",           icon: <FaSpa />,        label: "Cosmetología"                  },
    { id: "prevencion-lesiones",    icon: <FaDumbbell />,   label: "Prevención de lesiones"        },
    { id: "preparacion-fisica",     icon: <FaDumbbell />,   label: "Preparación física"            },
    { id: "nutricion",              icon: <FaAppleAlt />,   label: "Nutrición"                     },
    { id: "medicina-rehabilitacion",icon: <FaPills />,      label: "Medicina en rehabilitación"    },
  ];

  const colorClasses = [
    "service-primary",
    "service-secondary",
    "service-tertiary",
  ];

  return (
    <section className="py-5">
      <div className="container text-center">
        <h2 className="mb-4">Nuestros servicios</h2>
        <div className="row g-3 justify-content-center">
          {items.map((s, i) => (
            <div key={s.id} className="col-6 col-sm-4 col-md-3">
              <Link
                href={`/servicios/${s.id}`}
                className={`service-btn ${colorClasses[i % 3]}`}
              >
                <div className="icon">{s.icon}</div>
                <div className="label">{s.label}</div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
