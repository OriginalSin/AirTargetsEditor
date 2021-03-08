import L from 'leaflet';

export const AMPLITUDE = 0.1;
export const CONTROL_POINTS = [[45.213004,-11.25],[40.178873,11.25],[47.517201,20.566406],[44.715514,27.949219],[47.398349,49.746094]];

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
		iconUrl: './ship.svg'
	});
	const chkCurent = pNode => {
		const _current = pNode._current;
		[...pNode.childNodes].forEach((it, i) => {
			it.classList[i === _current ? 'add' : 'remove']('current');
		});
	}

	types.map(key => {
		const bNode = L.DomUtil.create('div', '', lBody);
		bNode.innerHTML = key;
		L.DomEvent.on(bNode, 'mousedown', (ev) => {
			ship.style.left = ev.clientX - 12 + 'px';
			ship.style.top = ev.clientY - 12 + 'px';
			L.DomUtil.setPosition(ship, L.point(0, 0));
			ship.classList.remove('hidden');
			// console.log('mousedown', ev);
		});

		const draggable = new L.Draggable(ship, bNode);
		draggable
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
				L.DomEvent.on(node, 'click', (ev) => {
					targetsNode._current = undefined;
					[...targetsNode.childNodes].forEach((it, i) => {
						if (it === ev.target && !it.classList.contains('current')) {
							it.classList.add('current');
							targetsNode._current = i;
							playButton.classList.remove('disabled');
						} else {
							it.classList.remove('current');
						}
					});
					// if (targetsNode._current !== undefined) {
						map._refreshCurves(targetsNode._current === undefined);
					// }
				});

				targetsNode._current = targetsNode._targets.length;
				targetsNode._targets.push(L.marker(latlng, {icon: myIcon, title: title}).addTo(map));
				map._refreshCurves();
				playButton.classList.remove('disabled');
				chkCurent(targetsNode);
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
	const rightCont = L.DomUtil.create('span', 'right', header);
	// const playButton1 = L.DomUtil.create('span', 'icon play', rightCont);

	L.DomEvent.on(pauseButton, 'click', (ev) => {
		const cList = pauseButton.classList;
		if (cList.contains('run')) {
			cList.remove('run');
		} else {
			cList.add('run');
		}
	});

	return {
		mapCont: mapCont,
		playButton: playButton,
		pauseButton: pauseButton,
		targets: targetsNode
	};

}
