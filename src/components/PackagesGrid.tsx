// src/components/PackagesGrid.jsx
import PackageCard from "./PackageCard";

export default function PackagesGrid() {
  const paquetes = [
    { id: "pkg1", title: "1 clase/semana (4 al mes)", sessions: 4, price: 1400, inscription: 1000 },
    { id: "pkg2", title: "2 clases/semana (8 al mes)", sessions: 8, price: 2250, inscription: 1000 },
    { id: "pkg3", title: "3 clases/semana (12 al mes)", sessions: 12, price: 2500, inscription: 1000 },
  ];

  return (
    <div className="row g-4">
      {paquetes.map(p => (
        <div key={p.id} className="col-12 col-md-4">
          <PackageCard pkg={p} />
        </div>
      ))}
    </div>
  );
}
