import './index.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'gmx-drawing/dist/gmxDrawing-src.js';
import 'gmx-drawing/dist/gmxDrawing.css';

import './leaflet.curve.js';
import {prepareNodes, AMPLITUDE, DELAY, getLatLngsArr} from './utils.js';

window.addEventListener('load', async () => {
	
	const nodes = prepareNodes(document.body);

    const map = L.map(nodes.mapCont, {}).setView([42.779275360241904, 17.666015625000004], 4);
	nodes.mapCont._map = map;
	window._test = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
	map.on('contextmenu', L.Util.falseFn);

	function refreshCurves(item) {
		if (item.pathOne) { map.removeLayer(item.pathOne); }
		const arr = item.trace ? getLatLngsArr(item) : [];
		if (arr.length) {
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

			item.pathOne = L.curve(curveArr, {
			   interactive: false,
			   dashArray: '5',
			   // animate: {duration: 3000, iterations: Infinity, delay: 1000}
			   // ,
			   // renderer: canvasRenderer
			}).addTo(map);
		}
	}
	map._refreshCurves = refreshCurves;

	function traceCurves(item) {
		let traceArr = [];
		if (item.pathOne) {
			const arr = [];
			for (let i = 0; i <= 1; i+= DELAY) { arr.push(i); }
			traceArr = [];

			item.pathOne.trace(arr).forEach(i => {
				traceArr.push(i);
			});
		}
		item.traceArr = traceArr;
	}

	let _animRequest;
	const disable = () => {
		nodes.pauseButton.classList.add('disabled');
		nodes.stopButton.classList.add('disabled');
		nodes.playButton.classList.remove('run');
		L.Util.cancelAnimFrame(_animRequest);
	}
	const recheckItems = () => {
		if (!nodes.pauseButton.classList.contains('run')) {
			const items = nodes.targets._targets;
			let doneCnt = items.length;
			items.forEach(item => {
				const target = item.target;
				if (!item.pathOne) { refreshCurves(item); }
				if (!item.traceArr) { traceCurves(item); }
				let traceArr = item.traceArr;
				let latlng = traceArr.shift();
				if (latlng) {
					target.setLatLng(latlng);
					let latlng1 = traceArr[5] || traceArr[traceArr.length - 1];
					if (latlng1) {
						let angle = L.GeometryUtil.angle(map, latlng, latlng1);
						target.setRotationAngle(angle);
					}
				} else {
					doneCnt--;
				}
			});
			if (doneCnt === 0) {
				disable();
			} else {
				L.Util.cancelAnimFrame(_animRequest);
				_animRequest = L.Util.requestAnimFrame(recheckItems);
			}
		}
	}
	const runMe = () => {
		nodes.playButton.classList.add('run');
		nodes.pauseButton.classList.remove('run');
		nodes.pauseButton.classList.remove('disabled');
		nodes.stopButton.classList.remove('disabled');
		const items = nodes.targets._targets;
		let doneCnt = items.length;
		items.forEach(item => {
			refreshCurves(item);
			item.traceArr = null;
		});

		L.Util.cancelAnimFrame(_animRequest);
		_animRequest = L.Util.requestAnimFrame(recheckItems);
	}

	L.DomEvent.on(nodes.stopButton, 'click', (ev) => {
		disable();
		const items = nodes.targets._targets;
		items.forEach(item => {
			const target = item.target;
			const latlngs = getLatLngsArr(item);
			if (latlngs.length) {
				target.options._blatlng = latlngs[0];
				target.setLatLng(target.options._blatlng);
				traceCurves(item);
			}
		});
	});

	L.DomEvent.on(nodes.pauseButton, 'click', (ev) => {
		const cList = nodes.pauseButton.classList;
		if (cList.contains('run')) {
			cList.remove('run');
		} else {
			cList.add('run');
		}
		L.Util.cancelAnimFrame(_animRequest);
		_animRequest = L.Util.requestAnimFrame(recheckItems);
	});

	L.DomEvent.on(nodes.playButton, 'click', (ev) => {
		const cList = ev.target.classList;
		if (cList.contains('run')) {
			disable();
		} else {
			runMe();
		}
	});
});