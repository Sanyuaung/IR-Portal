import React, { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

interface RemittanceMapProps {
  countryCounts: [string, number][];
}

const WORLD_TOPOLOGY_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  singapore: [103.8198, 1.3521],
  thailand: [100.9925, 15.87],
  "united states": [-95.7129, 37.0902],
  usa: [-95.7129, 37.0902],
  japan: [138.2529, 36.2048],
  "united arab emirates": [53.8478, 23.4241],
  uae: [53.8478, 23.4241],
  "united kingdom": [-3.436, 55.3781],
  uk: [-3.436, 55.3781],
  germany: [10.4515, 51.1657],
  france: [2.2137, 46.2276],
  europe: [10.4515, 51.1657],
  china: [104.1954, 35.8617],
  malaysia: [101.9758, 4.2105],
  australia: [133.7751, -25.2744],
  india: [78.9629, 20.5937],
  "south korea": [127.7669, 35.9078],
  korea: [127.7669, 35.9078],
};

const normalizeCountryName = (country: string) => {
  const normalized = country.trim().toLowerCase();
  const aliases: Record<string, string> = {
    "united states of america": "united states",
    "republic of korea": "south korea",
    "united arab emirates": "uae",
    "united kingdom": "uk",
  };
  return aliases[normalized] || normalized;
};

export const RemittanceMap: React.FC<RemittanceMapProps> = ({
  countryCounts,
}) => {
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    country: string;
    x: number;
    y: number;
  } | null>(null);
  const topCountries = countryCounts.slice(0, 10);
  const countryCountByName = useMemo(
    () =>
      new Map(
        topCountries.map(([country, count]) => [
          normalizeCountryName(country),
          { country, count },
        ]),
      ),
    [topCountries],
  );
  const markers = topCountries
    .map(([country, count]) => ({
      country,
      count,
      coordinates: COUNTRY_COORDINATES[normalizeCountryName(country)],
    }))
    .filter(
      (
        marker,
      ): marker is {
        country: string;
        count: number;
        coordinates: [number, number];
      } => Boolean(marker.coordinates),
    );
  const activeTransactionData = activeCountry
    ? countryCountByName.get(normalizeCountryName(activeCountry))
    : null;
  const tooltipTransactionData = tooltip
    ? countryCountByName.get(normalizeCountryName(tooltip.country))
    : null;

  const showTooltip = (
    country: string,
    event: React.MouseEvent<SVGElement>,
  ) => {
    const mapBounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    const tooltipWidth = 210;
    const tooltipHeight = 64;
    const x = mapBounds
      ? Math.min(
          Math.max(event.clientX - mapBounds.left + 12, 8),
          mapBounds.width - tooltipWidth - 8,
        )
      : event.nativeEvent.offsetX;
    const y = mapBounds
      ? Math.min(
          Math.max(event.clientY - mapBounds.top - tooltipHeight - 10, 8),
          mapBounds.height - tooltipHeight - 8,
        )
      : event.nativeEvent.offsetY;

    setTooltip({
      country,
      x,
      y,
    });
  };

  return (
    <div className="relative h-full min-h-[320px] w-full lg:min-h-[420px]">
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 w-[210px] rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
          role="tooltip"
        >
          <p className="truncate font-semibold">{tooltip.country}</p>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-300">
            {tooltipTransactionData
              ? `${tooltipTransactionData.count} transaction${tooltipTransactionData.count === 1 ? "" : "s"} in current view`
              : "No transactions in the current Top 10"}
          </p>
        </div>
      )}

      <div className="h-full overflow-hidden rounded-lg border border-blue-100 bg-[#F5F9FF]">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 145 }}
          width={800}
          height={350}
          className="h-full w-full"
        >
        <Geographies geography={WORLD_TOPOLOGY_URL}>
          {({ geographies }) =>
            geographies.map((geography) =>
              (() => {
                const countryName = String(
                  geography.properties.name ||
                    geography.properties.NAME ||
                    "Unknown country",
                );
                return (
                  <Geography
                    key={geography.rsmKey}
                    geography={geography}
                    fill="#DCEBFA"
                    stroke="#B8D5F2"
                    strokeWidth={0.65}
                    onMouseEnter={(event) => {
                      setActiveCountry(countryName);
                      showTooltip(countryName, event);
                    }}
                    onMouseMove={(event) => showTooltip(countryName, event)}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => setActiveCountry(countryName)}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        fill: "#7FB5E4",
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: { fill: "#5D9ED4", outline: "none" },
                    }}
                  />
                );
              })(),
            )
          }
        </Geographies>
        {markers.map(({ country, count, coordinates }) => (
          <Marker
            key={country}
            coordinates={coordinates}
            onMouseEnter={(event) => {
              setActiveCountry(country);
              showTooltip(country, event);
            }}
            onMouseMove={(event) => showTooltip(country, event)}
            onMouseLeave={() => setTooltip(null)}
            onClick={() => setActiveCountry(country)}
          >
            <title>{`${country}: ${count} transaction${count === 1 ? "" : "s"}`}</title>
            <circle
              r={5 + Math.min(count, 6) * 1.25}
              fill="#E11D2A"
              fillOpacity={0.9}
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          </Marker>
        ))}
        </ComposableMap>
      </div>
    </div>
  );
};
