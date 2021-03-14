import L from 'leaflet';
import 'leaflet-rotatedmarker/leaflet.rotatedMarker.js';
import 'leaflet-geometryutil/src/leaflet.geometryutil.js';

export const AMPLITUDE = 0.1;
export const DELAY = 0.01;
// export const CONTROL_POINTS = [[45.213004,-11.25],[40.178873,11.25],[47.517201,20.566406],[44.715514,27.949219],[47.398349,49.746094]];

const types = ['Aircraft', 'Helicopter', 'Cruise missile', 'Drone'];

export const prepareNodes = () => {
	const cont = document.body;
	const header = L.DomUtil.create('div', 'header', cont);
	const leftMenu = L.DomUtil.create('div', 'leftMenu opened', cont);
	const title = L.DomUtil.create('div', 'title', leftMenu);
	title.innerHTML = 'Target types';
	const lBody = L.DomUtil.create('div', 'body', leftMenu);
	const targetsTitle = L.DomUtil.create('div', 'title', leftMenu);
	targetsTitle.innerHTML = 'Targets';
	const targetsNode = L.DomUtil.create('div', 'bodyTargets', leftMenu);
	targetsNode._targets = [];
	targetsNode._current;

	let ship = L.DomUtil.create('div', 'icon ship hidden', cont);
	var myIcon = L.icon({
		iconSize: [24, 24],
		iconAnchor: [12, 12],
		iconUrl: './ship.svg'
	});
	types.map(key => {
		const bNode = L.DomUtil.create('div', '', lBody);
		bNode.innerHTML = key;
		bNode.title = 'Drag/Drop на карту';
		L.DomEvent.on(bNode, 'mousedown', (ev) => {
			ship.style.left = ev.clientX - 12 + 'px';
			ship.style.top = ev.clientY - 12 + 'px';
			L.DomUtil.setPosition(ship, L.point(0, 0));
		});

		const draggable = new L.Draggable(ship, bNode);
		draggable
			.on('dragstart', ev => {
				ship.classList.remove('hidden');
			})
			.on('dragend', ev => {
				// console.log('dddd', ev);
				const map = mapCont._map;
				ship.classList.add('hidden');
				const target = ev.target;
				const p = target._newPos.add(target._startPoint).subtract(L.point(301, 42));
				const latlng = map.containerPointToLatLng(p);
				const node = L.DomUtil.create('div', '', targetsNode);
				const dragStartTarget = ev.target._dragStartTarget;
				let _cnt = dragStartTarget._cnt;
				_cnt = !_cnt ? 1 : ++_cnt;
				dragStartTarget._cnt = _cnt;
				const title = dragStartTarget.innerHTML + '-' + _cnt;
				node.innerHTML = title;

				targetsNode._current = targetsNode._targets.length;
				let item = {
					target: L.marker(latlng, {icon: myIcon, rotationAngle: 45, title: title, _blatlng: latlng, _node: node, draggable: true}).on('drag', ev => {
						let target = ev.target;
						target.options._blatlng = ev.latlng;
						let _node = target.options._node;
						_node.classList.remove('current');
						if (item.trace && item.trace.rings[0])	{
							let ring = item.trace.rings[0].ring;
							let arr = ring._getLatLngsArr();
							arr[0] = ev.latlng;
							ring.setLatLngs(arr);
						}

					}).addTo(map)
				};
				targetsNode._targets.push(item);
				map.gmxDrawing
					.once('add', ev => {
						item.trace = ev.object;
					})
					.once('drawstop', ev => {
						playButton.classList.remove('disabled');
					});
				
				map.gmxDrawing.create('Polyline', {
					lineStyle: {dashArray: [5, 5], color: 'red'},
					pointStyle: {size:10, fillColor: 'red'}
				});
				map.fire('click', {
					latlng: latlng
				});
			})
			.enable();
	});
	const mapCont = L.DomUtil.create('div', 'map opened', cont);
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
	const playButton = L.DomUtil.create('span', 'icon play disabled', centerCont);
	playButton.title = 'Просмотр';
	const pauseButton = L.DomUtil.create('span', 'icon pause disabled', centerCont);
	pauseButton.title = 'Пауза';
	const stopButton = L.DomUtil.create('span', 'icon stop disabled', centerCont);
	stopButton.title = 'Стоп';
	const rightCont = L.DomUtil.create('span', 'right', header);

	return {
		mapCont: mapCont,
		playButton: playButton,
		pauseButton: pauseButton,
		stopButton: stopButton,
		targets: targetsNode
	};
}

export const getLatLngsArr = (drawingFeature) => {
	const ring0 = drawingFeature.trace.rings[0];
	return ring0 ? ring0.ring._getLatLngsArr().map(p => [p.lat, p.lng]) : [];
}

export const getAngle = (a, b) => {
	return Math.PI / 2 + Math.atan2(b[1] - a[1], a[0] - b[0]);
}
