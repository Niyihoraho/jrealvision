import React, { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Compass,
  Check,
  ExternalLink,
  Store,
  Search,
  Map as MapIcon,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";

export interface DeliveryLandmark {
  id: string;
  name: string;
  district: string;
  category: "Hub" | "Mall / Landmark" | "Market / Station" | "Office Hub";
  coordinates: { lat: number; lng: number };
}

export const POPULAR_DELIVERY_LOCATIONS: DeliveryLandmark[] = [
  // Kicukiro
  {
    id: "kicukiro-centre",
    name: "Kicukiro Centre (near Market & Eco-Bank)",
    district: "Kicukiro",
    category: "Hub",
    coordinates: { lat: -1.9705, lng: 30.1044 },
  },
  {
    id: "sonatubes-niboye",
    name: "Sonatubes Junction / Niboye Centre",
    district: "Kicukiro",
    category: "Hub",
    coordinates: { lat: -1.9634, lng: 30.0988 },
  },
  {
    id: "gikondo-magerwa",
    name: "Gikondo Industrial Park / MAGERWA",
    district: "Kicukiro",
    category: "Office Hub",
    coordinates: { lat: -1.9723, lng: 30.0811 },
  },
  {
    id: "gahanga-cricket",
    name: "Gahanga / Cricket Stadium & Market",
    district: "Kicukiro",
    category: "Hub",
    coordinates: { lat: -2.0321, lng: 30.0915 },
  },
  {
    id: "kagarama-st-joseph",
    name: "Kagarama / Saint Joseph",
    district: "Kicukiro",
    category: "Hub",
    coordinates: { lat: -1.9842, lng: 30.1123 },
  },
  {
    id: "masaka-hospital",
    name: "Masaka / Hospital Hub",
    district: "Kicukiro",
    category: "Hub",
    coordinates: { lat: -1.9984, lng: 30.2132 },
  },
  // Gasabo
  {
    id: "kigali-heights",
    name: "Kigali Heights / KCC (Convention Centre)",
    district: "Gasabo",
    category: "Mall / Landmark",
    coordinates: { lat: -1.9536, lng: 30.0934 },
  },
  {
    id: "remera-corner",
    name: "Remera Corner / Amahoro Stadium / Kisimenti",
    district: "Gasabo",
    category: "Hub",
    coordinates: { lat: -1.9578, lng: 30.1147 },
  },
  {
    id: "kimironko-market",
    name: "Kimironko Market / Gare / Bus Station",
    district: "Gasabo",
    category: "Market / Station",
    coordinates: { lat: -1.9422, lng: 30.1264 },
  },
  {
    id: "gishushu-rdb",
    name: "Gishushu / RDB Headquarters",
    district: "Gasabo",
    category: "Office Hub",
    coordinates: { lat: -1.9525, lng: 30.0986 },
  },
  {
    id: "nyarutarama-mtn",
    name: "Nyarutarama / MTN Centre",
    district: "Gasabo",
    category: "Mall / Landmark",
    coordinates: { lat: -1.9365, lng: 30.103 },
  },
  {
    id: "kacyiru-embassy",
    name: "Kacyiru / MINAFFET / US Embassy",
    district: "Gasabo",
    category: "Office Hub",
    coordinates: { lat: -1.9431, lng: 30.0768 },
  },
  {
    id: "kagugu-batsinda",
    name: "Kagugu / Batsinda Centre",
    district: "Gasabo",
    category: "Hub",
    coordinates: { lat: -1.9056, lng: 30.0812 },
  },
  {
    id: "kibagabaga-hospital",
    name: "Kibagabaga / Hospital Area",
    district: "Gasabo",
    category: "Hub",
    coordinates: { lat: -1.9351, lng: 30.1189 },
  },
  // Nyarugenge
  {
    id: "downtown-chic",
    name: "Downtown Kigali / City Market / CHIC Mall",
    district: "Nyarugenge",
    category: "Mall / Landmark",
    coordinates: { lat: -1.9441, lng: 30.0619 },
  },
  {
    id: "nyamirambo-biryogo",
    name: "Nyamirambo / Biryogo Car-Free Food Street",
    district: "Nyarugenge",
    category: "Hub",
    coordinates: { lat: -1.9785, lng: 30.0492 },
  },
  {
    id: "kiyovu-serena",
    name: "Kiyovu / Serena Hotel / Camp Kigali",
    district: "Nyarugenge",
    category: "Office Hub",
    coordinates: { lat: -1.9567, lng: 30.0633 },
  },
  {
    id: "nyabugogo-gare",
    name: "Nyabugogo Main Bus Terminal / Gare",
    district: "Nyarugenge",
    category: "Market / Station",
    coordinates: { lat: -1.9392, lng: 30.0465 },
  },
  // Provincial Hubs
  {
    id: "musanze-goico",
    name: "Musanze Town / Goico Plaza",
    district: "Musanze",
    category: "Hub",
    coordinates: { lat: -1.4988, lng: 29.6349 },
  },
  {
    id: "rubavu-gisenyi",
    name: "Rubavu / Gisenyi Beach / Border Hub",
    district: "Rubavu",
    category: "Hub",
    coordinates: { lat: -1.6975, lng: 29.2564 },
  },
  {
    id: "huye-centre",
    name: "Huye Town / UR University Hub",
    district: "Huye",
    category: "Hub",
    coordinates: { lat: -2.6074, lng: 29.7394 },
  },
];

interface DirectLocationPickerProps {
  selectedDistrict: string;
  selectedAddress: string;
  locationUrl: string;
  onSelectLocation: (data: {
    district: string;
    address: string;
    locationUrl: string;
    landmarkName?: string;
  }) => void;
  deliveryMethod: "standard" | "express" | "pickup";
  onSelectPickup: () => void;
  additionalDetails: string;
  onChangeAdditionalDetails: (val: string) => void;
}

export default function DirectLocationPicker({
  selectedDistrict,
  selectedAddress,
  locationUrl,
  onSelectLocation,
  deliveryMethod,
  onSelectPickup,
  additionalDetails,
  onChangeAdditionalDetails,
}: DirectLocationPickerProps) {
  const [activeTab, setActiveTab] = useState<"landmark" | "gps" | "map" | "pickup">("landmark");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // GPS state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsData, setGpsData] = useState<{ lat: number; lng: number } | null>(null);

  // Map click state
  const [selectedMapPin, setSelectedMapPin] = useState<{
    name: string;
    district: string;
    lat: number;
    lng: number;
  } | null>(null);

  // Filter landmarks
  const filteredLandmarks = POPULAR_DELIVERY_LOCATIONS.filter((item) => {
    const matchesDistrict = districtFilter === "All" || item.district === districtFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.district.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    return matchesDistrict && matchesSearch;
  });

  // Handle GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser. Please select a landmark below.");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsData({ lat: latitude, lng: longitude });
        setGpsLoading(false);

        // Approximate Kigali sector or keep current district
        const detectedDistrict =
          latitude > -1.94 ? "Gasabo" : latitude > -1.97 ? "Nyarugenge" : "Kicukiro";

        const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        const autoAddress = `Live GPS Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

        onSelectLocation({
          district: detectedDistrict,
          address: autoAddress,
          locationUrl: mapUrl,
          landmarkName: `Current GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        });
      },
      (error) => {
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError("Location permission denied. You can select your area or landmark directly from the list below.");
        } else {
          setGpsError("Unable to detect GPS position. Please pick a landmark from the list.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle selecting a landmark
  const handleSelectLandmark = (item: DeliveryLandmark) => {
    const mapUrl = `https://maps.google.com/?q=${item.coordinates.lat},${item.coordinates.lng}`;
    onSelectLocation({
      district: item.district,
      address: item.name,
      locationUrl: mapUrl,
      landmarkName: item.name,
    });
  };

  // Handle Studio Pickup
  const handleChooseStudioPickup = () => {
    setActiveTab("pickup");
    onSelectPickup();
    onSelectLocation({
      district: "Kicukiro",
      address: "JREAL VISION DESIGN Studio, Kicukiro Centre, Kigali",
      locationUrl: "https://maps.google.com/?q=-1.9705,30.1044",
      landmarkName: "JREAL Creative Studio (Kicukiro)",
    });
  };

  const isCurrentSelection = (name: string) => {
    return selectedAddress === name || selectedAddress.includes(name);
  };

  return (
    <div className="space-y-4">
      {/* Top Method Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-gray-100 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab("landmark")}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "landmark"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-[#128C38]" />
          <span>Popular Hubs</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("gps");
            if (!gpsData) handleDetectGPS();
          }}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "gps"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-[#128C38]" />
          <span>Use GPS Pin</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("map")}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "map"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <MapIcon className="w-3.5 h-3.5 text-[#128C38]" />
          <span>Map Pin</span>
        </button>

        <button
          type="button"
          onClick={handleChooseStudioPickup}
          className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "pickup" || deliveryMethod === "pickup"
              ? "bg-[#128C38] text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Studio Pickup</span>
        </button>
      </div>

      {/* TAB 1: POPULAR HUBS & LANDMARKS */}
      {activeTab === "landmark" && (
        <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <p className="text-xs font-bold text-gray-900">
                Select Your Delivery Hub or Landmark
              </p>
              <p className="text-[11px] text-gray-500">
                Click any location below — no typing needed. Couriers deliver directly to this point.
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter locations..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#128C38]"
              />
            </div>
          </div>

          {/* District Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {["All", "Kicukiro", "Gasabo", "Nyarugenge", "Musanze", "Rubavu", "Huye"].map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => setDistrictFilter(dist)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  districtFilter === dist
                    ? "bg-[#128C38] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {dist}
              </button>
            ))}
          </div>

          {/* Landmarks Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredLandmarks.map((item) => {
              const selected = isCurrentSelection(item.name);
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectLandmark(item)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 text-left group ${
                    selected
                      ? "border-[#128C38] bg-emerald-50/40 ring-1 ring-[#128C38]"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      selected
                        ? "bg-[#128C38] text-white"
                        : "bg-gray-100 text-gray-500 group-hover:text-gray-800"
                    }`}
                  >
                    {selected ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold leading-tight line-clamp-1 ${
                        selected ? "text-[#128C38]" : "text-gray-800"
                      }`}
                    >
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                      <span className="font-medium text-gray-600">{item.district}</span>
                      <span>•</span>
                      <span>{item.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE GPS PIN */}
      {activeTab === "gps" && (
        <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-5 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#128C38]/10 text-[#128C38] flex items-center justify-center mx-auto">
            <Navigation className={`w-6 h-6 ${gpsLoading ? "animate-spin" : ""}`} />
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">
              Deliver to Your Current GPS Location
            </h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Our system will pin your exact location via satellite coordinates. Our courier will navigate straight to your pin.
            </p>
          </div>

          {gpsError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 max-w-md mx-auto text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {gpsData && (
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-left max-w-md mx-auto space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-[#128C38]" />
                <span>Live GPS Location Acquired!</span>
              </div>
              <p className="text-xs text-emerald-800 font-mono">
                Latitude: {gpsData.lat.toFixed(5)}, Longitude: {gpsData.lng.toFixed(5)}
              </p>
              <div className="pt-1">
                <a
                  href={`https://maps.google.com/?q=${gpsData.lat},${gpsData.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#128C38] hover:underline"
                >
                  Verify Pin on Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={gpsLoading}
              className="px-6 py-2.5 bg-[#128C38] hover:bg-[#0B5424] text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{gpsLoading ? "Detecting Satellite Signal…" : "Detect My Location Now"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE MAP PIN */}
      {activeTab === "map" && (
        <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900">Interactive Kigali / Rwanda Area Map</p>
              <p className="text-[11px] text-gray-500">
                Click any key sector pin to lock in your delivery destination.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#128C38] bg-[#128C38]/10 px-2 py-0.5 rounded">
              Interactive
            </span>
          </div>

          {/* Visual Interactive Map Graphic with Clickable Pinpoints */}
          <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full bg-slate-900 rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center p-4">
            {/* Background grid */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#128C38_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

            {/* Clickable Map Pins */}
            {[
              { name: "Kigali Heights / KCC", district: "Gasabo", top: "35%", left: "54%", lat: -1.9536, lng: 30.0934 },
              { name: "Kimironko / Amahoro", district: "Gasabo", top: "30%", left: "68%", lat: -1.9422, lng: 30.1264 },
              { name: "Kicukiro Centre", district: "Kicukiro", top: "62%", left: "58%", lat: -1.9705, lng: 30.1044 },
              { name: "Downtown / CHIC", district: "Nyarugenge", top: "42%", left: "38%", lat: -1.9441, lng: 30.0619 },
              { name: "Nyamirambo / Biryogo", district: "Nyarugenge", top: "68%", left: "34%", lat: -1.9785, lng: 30.0492 },
              { name: "Musanze Hub", district: "Musanze", top: "15%", left: "20%", lat: -1.4988, lng: 29.6349 },
              { name: "Rubavu / Gisenyi", district: "Rubavu", top: "48%", left: "12%", lat: -1.6975, lng: 29.2564 },
              { name: "Huye / Butare", district: "Huye", top: "82%", left: "22%", lat: -2.6074, lng: 29.7394 },
            ].map((pin) => {
              const isSelected = selectedAddress.includes(pin.name);
              return (
                <button
                  key={pin.name}
                  type="button"
                  onClick={() => {
                    setSelectedMapPin(pin);
                    onSelectLocation({
                      district: pin.district,
                      address: pin.name,
                      locationUrl: `https://maps.google.com/?q=${pin.lat},${pin.lng}`,
                      landmarkName: pin.name,
                    });
                  }}
                  style={{ top: pin.top, left: pin.left }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-125 z-10`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all ${
                      isSelected ? "bg-amber-400 text-black scale-125 ring-4 ring-[#128C38]" : "bg-[#128C38] text-white hover:bg-emerald-400"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  {/* Tooltip Label */}
                  <span className="absolute top-7 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap opacity-90 group-hover:opacity-100 shadow-md">
                    {pin.name}
                  </span>
                </button>
              );
            })}

            <div className="absolute bottom-2 right-3 text-[10px] text-gray-400">
              Tap any pin to select delivery point
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDIO PICKUP */}
      {activeTab === "pickup" && (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#128C38] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Collect In-Person at JREAL Studio (Free Delivery)
              </h4>
              <p className="text-xs text-gray-500">
                KG 14 Ave, Kicukiro Centre, Kigali • Mon-Sat 8:00 AM - 7:00 PM
              </p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs text-gray-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900 block">Delivery Fee: 0 RWF</span>
              <span className="text-[11px] text-gray-500">Ready in 24 hours. We notify you via WhatsApp.</span>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#128C38]/10 text-[#128C38] font-bold text-xs">
              Selected ✓
            </span>
          </div>
        </div>
      )}

      {/* ACTIVE SELECTION SUMMARY CARD */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#128C38]/10 text-[#128C38] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-[#128C38]" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#128C38] block">
                Selected Delivery Location (No typing required)
              </span>
              <p className="text-xs font-bold text-gray-900">
                {selectedAddress || "Kicukiro Centre, Kigali"}
              </p>
              <p className="text-[11px] text-gray-500">
                District: <span className="font-semibold text-gray-800">{selectedDistrict}</span>
              </p>
            </div>
          </div>

          {locationUrl && (
            <a
              href={locationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-[#128C38] hover:text-[#0B5424] hover:underline flex items-center gap-1 shrink-0 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200/80"
            >
              <span>View Map</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Optional Extra Gate / Floor Details */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-[11px] font-medium text-gray-500 mb-1">
            Apartment, Room, or Gate color (Optional):
          </label>
          <input
            type="text"
            value={additionalDetails}
            onChange={(e) => onChangeAdditionalDetails(e.target.value)}
            placeholder="e.g. 2nd Floor, Room 14 or Blue Gate (Optional)"
            className="w-full text-xs p-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] focus:bg-white transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
