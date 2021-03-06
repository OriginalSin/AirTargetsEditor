import './index.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'gmx-drawing/dist/gmxDrawing-src.js';
import 'gmx-drawing/dist/gmxDrawing.css';

import 'leaflet-curve/leaflet.curve.js';
import {CONTROL_POINTS} from './const.js';

window.addEventListener('load', async () => {
	const cont = document.body;
	const header = L.DomUtil.create('div', 'header', cont);
	const leftMenu = L.DomUtil.create('div', 'leftMenu', cont);
	const mapCont = L.DomUtil.create('div', 'map', cont);
	const leftCont = L.DomUtil.create('span', 'left', header);
	L.DomEvent.on(L.DomUtil.create('span', 'icon sidebar', leftCont), 'click', (ev) => {
		const cList = leftMenu.classList;
		if (cList.contains('opened')) {
			cList.remove('opened');
			mapCont.classList.remove('opened');
		} else {
			cList.add('opened');
			mapCont.classList.add('opened');
		}
	});
	const centerCont = L.DomUtil.create('span', 'center', header);
	const playButton = L.DomUtil.create('span', 'icon play', centerCont);
	const rightCont = L.DomUtil.create('span', 'right', header);
	const playButton1 = L.DomUtil.create('span', 'icon play', rightCont);

    const map = L.map(mapCont, {}).setView([42.779275360241904, 17.666015625000004], 4);
	window._test = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

	const latlngs = CONTROL_POINTS;
	map.gmxDrawing.add(L.polyline(latlngs), {
		lineStyle: {dashArray: [5, 5], color: 'red'},
		pointStyle: {size:20, fillColor: 'red'}
	});
	const curveArr = ['M', latlngs[0]];
	for (let i = 0, len = latlngs.length - 1; i < len; i++) {
		let p = latlngs[i];
		let p1 = latlngs[i + 1];
		curveArr.push('C');
		curveArr.push([p[0],	p[1]	+ 2]);
		curveArr.push([p1[0],	p1[1]	- 2]);
		curveArr.push(p1);
	}

	var pathOne = L.curve(curveArr).addTo(map);
/*
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
*/
});