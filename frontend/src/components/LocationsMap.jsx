/**
 * @fileoverview Интерактивная карта Яндекса с метками студий. Данные из БД (coordinates).
 */

import { useEffect, useRef, useState } from "react";

const DEFAULT_CENTER = [55.7558, 37.6176];
const DEFAULT_ZOOM = 11;

/**
 * Ждёт появления window.ymaps (скрипт API подгружается асинхронно).
 * @returns {Promise<typeof window.ymaps>}
 */
function waitForYmaps() {
  if (typeof window === "undefined" || !window.ymaps) {
    return new Promise((resolve) => {
      const check = () => {
        if (window.ymaps) {
          resolve(window.ymaps);
          return;
        }
        setTimeout(check, 100);
      };
      check();
    });
  }
  return Promise.resolve(window.ymaps);
}

/**
 * Карта с метками локаций. Для каждой локации с coordinates.lat/lng ставится Placemark.
 * @param {Object} props
 * @param {Array<{ id: string, name: string, address?: string, metro?: string, pricePerHour?: number, coordinates?: { lat: number, lng: number } }>} props.locations
 * @param {[number, number]} [props.center]
 * @param {number} [props.zoom]
 * @param {string} [props.className]
 */
export function LocationsMap({ locations = [], center, zoom = DEFAULT_ZOOM, className = "" }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !locations.length) {
      setReady(false);
      return;
    }

    let cancelled = false;

    waitForYmaps()
      .then((ymaps) => {
        if (cancelled) return;
        return new Promise((resolve) => ymaps.ready(resolve));
      })
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const ymaps = window.ymaps;
        const firstWithCoords = locations.find(
          (loc) => loc.coordinates?.lat != null && loc.coordinates?.lng != null
        );
        const mapCenter = center || (firstWithCoords
          ? [firstWithCoords.coordinates.lat, firstWithCoords.coordinates.lng]
          : DEFAULT_CENTER);

        const map = new ymaps.Map(containerRef.current, {
          center: mapCenter,
          zoom,
          controls: ["zoomControl", "typeSelector", "fullscreenControl"],
        });

        mapRef.current = map;

        locations.forEach((loc) => {
          if (loc.coordinates?.lat == null || loc.coordinates?.lng == null) return;

          const price = loc.pricePerHour != null
            ? `${Number(loc.pricePerHour).toLocaleString("ru-RU")} ₽/час`
            : loc.price || "";

          const placemark = new ymaps.Placemark(
            [loc.coordinates.lat, loc.coordinates.lng],
            {
              balloonContentHeader: loc.name,
              balloonContentBody: [
                loc.address && `Адрес: ${loc.address}`,
                loc.metro && `Метро: ${loc.metro}`,
                price && `Цена: ${price}`,
              ]
                .filter(Boolean)
                .join("<br/>"),
            },
            {
              preset: "islands#violetCircleDotIconWithCaption",
            }
          );

          map.geoObjects.add(placemark);
        });

        setReady(true);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Не удалось загрузить карту");
          setReady(false);
        }
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
      setReady(false);
    };
  }, [locations, center, zoom]);

  return (
    <div className={`relative w-full h-full min-h-[300px] ${className}`}>
      <div ref={containerRef} className="w-full h-full min-h-[300px] rounded-2xl overflow-hidden" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-2xl text-gray-600 text-sm">
          {error}
        </div>
      )}
      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-2xl">
          <div className="animate-pulse text-purple-500">
            <i className="ri-map-line text-4xl"></i>
            <p className="mt-2 text-sm">Загрузка карты...</p>
          </div>
        </div>
      )}
    </div>
  );
}
