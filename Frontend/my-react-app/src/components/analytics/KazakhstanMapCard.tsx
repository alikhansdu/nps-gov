import kzMapImg from "../../assets/kz-blank.svg";

export default function KazakhstanMapCard() {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Карта Казахстана</h3>
      <p className="text-xs text-gray-400 mb-3">Активность по регионам</p>
      <div className="flex items-center justify-center">
        <img
          src={kzMapImg}
          alt="Карта Казахстана"
          style={{ width: "100%", maxHeight: "320px", height: "auto", objectFit: "contain" }}
        />
      </div>
    </div>
  );
}

