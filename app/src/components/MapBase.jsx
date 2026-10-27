import React, { useEffect, useRef } from 'react'
import L from 'leaflet'

// Thin wrapper around Leaflet that follows the site theme. Children get the map via onReady.
const TILES = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
}

export function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

export default function MapBase({ onReady, center = [54.3, -2.6], zoom = 6, className = 'map-box', minZoom = 5 }) {
  const el = useRef(null)
  useEffect(() => {
    const map = L.map(el.current, { zoomControl: true, minZoom, maxZoom: 17, preferCanvas: true }).setView(center, zoom)
    let tile = L.tileLayer(TILES[currentTheme()], {
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map)
    const mo = new MutationObserver(() => {
      map.removeLayer(tile)
      tile = L.tileLayer(TILES[currentTheme()], { subdomains: 'abcd', attribution: tile.options.attribution }).addTo(map)
      tile.bringToBack()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const cleanup = onReady?.(map, L)
    setTimeout(() => map.invalidateSize(), 120)
    return () => {
      mo.disconnect()
      if (typeof cleanup === 'function') cleanup()
      map.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <div ref={el} className={className} />
}
