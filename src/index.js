import './index.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'gmx-drawing/dist/gmxDrawing-src.js';
import 'gmx-drawing/dist/gmxDrawing.css';

import './leaflet.curve.js';
import {prepareNodes, AMPLITUDE, CONTROL_POINTS} from './utils.js';

window.addEventListener('load', async () => {
	
	const nodes = prepareNodes(document.body);

    const map = L.map(nodes.mapCont, {}).setView([42.779275360241904, 17.666015625000004], 4);
	nodes.mapCont._map = map;
	window._test = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

	let latlngs = CONTROL_POINTS;
	map.gmxDrawing.add(L.polyline(latlngs), {
		lineStyle: {dashArray: [5, 5], color: 'red'},
		pointStyle: {size:20, fillColor: 'red'}
	}).on('edit', ev => {
		latlngs = ev.object.rings[0].ring._getLatLngsArr().map(p => [p.lat, p.lng]);
		refreshCurves();
	});

	let pathOne;
	function refreshCurves(flag) {
		if (pathOne) { map.removeLayer(pathOne); }
		if (flag) {
			nodes.playButton.classList.add('disabled');
			return;
		}
		const target = nodes.targets._targets[nodes.targets._current];
		// const target = nodes.targets._targets[nodes.targets._targets.length - 1];
		let first = [];
		if (target) {
			let latLng = target.getLatLng();
			first = [[latLng.lat, latLng.lng]];
		}
		const arr = first.concat(latlngs);
		let p0 = arr[0];
		const curveArr = ['M', p0];
		for (let i = 0, len = arr.length - 1; i < len; i++) {
			let p1 = arr[i];
			let p2 = arr[i + 1];
			let p3 = i === len - 1 ? p2 : arr[i + 2];
			curveArr.push('C');
			curveArr.push([p1[0] + AMPLITUDE * (p2[0] - p0[0]), p1[1] + AMPLITUDE * (p2[1] - p0[1])]);
			curveArr.push([
				p2[0] - AMPLITUDE * (p3[0] - p1[0]),
				p2[1] - AMPLITUDE * (p3[1] - p1[1])
			]);
			curveArr.push(p2);
			p0 = p1;
		}

		pathOne = L.curve(curveArr, {
		   dashArray: '5',
		   animate: {duration: 3000, iterations: Infinity, delay: 1000}
		   // ,
		   // renderer: canvasRenderer
		}).addTo(map);
	}
	map._refreshCurves = refreshCurves;

	let traceArr = [];
	function traceCurves() {
		if (pathOne) {
			// const target = targets[0];
			const arr = [];
			for (let i = 0; i <= 1; i+= 0.01) {
				arr.push(i);
			}
			traceArr = [];

			pathOne.trace(arr).forEach(i => {
				traceArr.push(i);
			});
		}
	}

	let intId;
	const disable = (cList) => {
		// console.log('ddd');
		nodes.pauseButton.classList.add('disabled');
		cList.remove('run');
		clearInterval(intId);
	}

	L.DomEvent.on(nodes.playButton, 'click', (ev) => {
		const target = nodes.targets._targets[nodes.targets._current];
		if (target) {
			target.setLatLng(target.options._blatlng);
			const cList = ev.target.classList;
			if (cList.contains('run')) {
				disable(cList);
			} else {
				cList.add('run');
				nodes.pauseButton.classList.remove('disabled');
				traceCurves();
				intId = setInterval(() => {
					if (!nodes.pauseButton.classList.contains('run')) {
						let latlng = traceArr.shift();
						if (latlng) {
							target.setLatLng(latlng);
						} else {
							disable(cList);
						}
					}
				}, 100);
			}
		}
	});
});