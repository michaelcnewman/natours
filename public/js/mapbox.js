/* eslint-disable */

export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibmV3bWFuMDM5IiwiYSI6ImNrOXVjeG1leDAwajYzZ252djUwYXVnYTkifQ.-34GZlBI7gyMJXTeBomI3A';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/newman039/ck9udehug1ede1ipggn77vy68',
        scrollZoom: false,
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        //Create Marker
        const el = document.createElement('div');
        el.className = 'marker';

        //Add Marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        //Add Popup
        new mapboxgl.Popup({
            offset: 32
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // Extend Map bounds
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100,
        }
    });
};
