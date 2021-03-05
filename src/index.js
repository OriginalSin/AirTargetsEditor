import './index.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'gmx-drawing/dist/gmxDrawing-src.js';
import 'gmx-drawing/dist/gmxDrawing.css';

import 'leaflet-curve/leaflet.curve.js';

window.addEventListener('load', async () => {
	const contPoints = {
		"type":"Feature",
		"properties":{"name":"контрольные точки"},
		"geometry":{"type":"LineString","coordinates":[[-11.25,45.213004],[11.25,40.178873],[20.566406,47.517201],[27.949219,44.715514],[49.746094,47.398349]]}
	};
	const latlngs = contPoints.geometry.coordinates.map(it => { return it.reverse(); });
	// L.Dom
    const map = L.map('map', {}).setView([55.45, 37.37], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
	console.log('kjjj', map.gmxDrawing);
	map.gmxDrawing.add(L.polyline(latlngs), {
		lineStyle: {dashArray: [5, 5], color: 'red'},
		pointStyle: {size:20, fillColor: 'red'}
	});

var customPane = map.createPane("customPane");
var canvasRenderer = L.canvas({pane:"customPane"});
customPane.style.zIndex = 399; // put just behind the standard overlay pane which is at 400

// var pathOne = L.curve(['M',[50.14874640066278,14.106445312500002],
					   // 'Q',[51.67255514839676,16.303710937500004],
						   // [50.14874640066278,18.676757812500004],
					   // 'T',[49.866316729538674,25.0927734375]], {
// квадратичная кривая Безье B(t)=(1-t)^2*P0+2*t*(1-t)*P1+t^2*P2, t=0..1
// B(0)=P0, B(1)=P2, B'(0)=-2*P0+2*P1, B'(1)=-2*P1+2*P2
// P[1]=P0[1]+B'(0)*(P[0]-P0[0])=P2[1]+B'(1)*(P[0]-P2[0])
// P[0]=(P0[1]-B'(0)*P0[0]-P2[1]+B'(1)*P2[0])/(B'(1)-B'(0))
// P[1]= P2[1]-B'(1)*P2[0]+B'(1)*(P0[1]-B'(0)*P0[0]-P2[1]+B'(1)*P2[0])/(B'(1)-B'(0))
// = (P2[1]-B'(1)*P2[0]))

var pathOne = L.curve([
	'M', latlngs[0],
	'C', [latlngs[0][0], latlngs[0][1] + 2], [latlngs[1][0], latlngs[1][1] - 2], latlngs[1],
	'C', [latlngs[1][0], latlngs[1][1] + 2], [latlngs[2][0], latlngs[2][1] - 2], latlngs[2],
	'C', [latlngs[2][0], latlngs[2][1] + 2], [latlngs[3][0], latlngs[3][1] - 2], latlngs[3],
	'C', [latlngs[3][0], latlngs[3][1] + 2], [latlngs[4][0], latlngs[4][1] - 2], latlngs[4]
	//'Q', latlngs[3], latlngs[4], latlngs[2]
	//'T', latlngs[4]
   ], {
	   animate: 3000
	   // ,
	   // renderer: canvasRenderer
   }).addTo(map);

	
/*
    const dataManager = new Worker("dataManager.js");
    
    const dateEnd = Math.floor(Date.now() / 1000);
    const testLayer = new CanvasLayer({
        // dateBegin: dateEnd - 24 * 60 * 60,
        // dateEnd,
        dataManager
    });

    testLayer.addTo(map);

    const moveend = () => {
        const zoom = map.getZoom();
        const sbbox = map.getBounds();
        const sw = sbbox.getSouthWest();
        const ne = sbbox.getNorthEast();
        const m1 = L.Projection.Mercator.project(L.latLng([sw.lat, sw.lng]));
        const m2 = L.Projection.Mercator.project(L.latLng([ne.lat, ne.lng]));
    
		dataManager.postMessage({
			cmd: 'moveend',
			zoom,
			bbox: [m1.x, m1.y, m2.x, m2.y],
            bounds: map.getPixelBounds(),
		});
	}; 
	map.on('moveend', moveend);
	dataManager.onmessage = msg => {
		 // console.log('Main dataManager', msg.data);
		const data = msg.data || {};
		const {cmd, layerId, tileKey} = data;
		switch(cmd) {
			case 'rendered':
				// if (data.bitmap) {
				requestAnimationFrame(() => {
					testLayer.rendered(data.bitmap);
				});
				// }
				break;
			default:
				console.warn('Warning: Bad message from worker ', data);
				break;
		}

	};
 	moveend();
*/
});