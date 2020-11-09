const Game = (function() {
	let userBombs		= 0;
	let pcBombs		= 0;
	let userHits		= 0;
	let pcHits		= 0;
	let lastValues = [];
	let userShips 		= {};
	let pcShips 		= {};
	let letters 	= "ABCDEFGHIJ";		
	let $rows 		= {};

	function start() {
		setUserShips();
		setPcShips();
	}

	function setUserShips() {
		setTable('userShips');
		setCoords('userShips');
		setShipsForUser('userShips');
		showShips('userShips');
	}

	function setPcShips() {
		setTable('pcShips');
		setCoords('pcShips');
		setEvents('pcShips');
		setShipsForPc('pcShips');
		showShips('pcShips');
	}
	
	function setTable(id) {
		$table = $('<table></table>');
		for	(x = 0; x < 10; x++) {
			$tr = $('<tr></tr>');
			for	(z = 0; z < 10; z++) {
				$td = $('<td></td>');
				$tr.append($td);
			}
			$table.append($tr);
		}
		$(`#${id}`).html($table);
	}

	function setCoords(id) {
		$rows = $(`#${id} table tr`);
		for (x = 0, length = $rows.length; x < length; x++) {
			$rows.eq(x).attr('data-row', letters[x]);
			let $cols = $rows.eq(x).find('td');
			for (y = 0, length = $cols.length; y < length; y++) {
				$cols.eq(y).attr('data-col', (y + 1));
				$cols.eq(y).attr('title', 'Jogar bomba em ' + letters[x] +  (y + 1));
			}
		}
	}

	function setEvents(id) {
		$(`#${id} table td`).off('click').click(function() {
			const $this = $(this);
			const row = $this.parent().data('row'); 
			const col = $this.data('col');
			attack($this, row, col, id);
		});
	}

	function setShipsForUser() {
		setShip(4, 'userShips');
		setShip(3, 'userShips');
		setShip(2, 'userShips');
	}

	function setShipsForPc() {
		setShip(4, 'pcShips');
		setShip(3, 'pcShips');
		setShip(2, 'pcShips');
	}

	function canSetShip(length, id) {
		let _great = true;
		let _row, _col, _orientation, _direction;

		let ships = id === 'userShips' ? userShips : pcShips;
		
		_orientation = random(1, 2);
		_row = random(1, 10);
		_col = random(1, 10);
		
		if (_orientation == 1) { // vertical
			while(!(_row - 10 >= length) && !(_row >= length)) {							
				_row = random(1, 10);
			}
			
			if ((_row >= length) && (_row - 10 >= length)) {
				_direction = random(1, 2);
			}
			else if (_row >= length) {
				_direction = 1;
			}
			else {
				_direction = 2;
			}
			
			row = _row;
			col = _col;
			if (_direction == 1) { // up
				for (x = 0; x < length; x++) {
					if (ships[letters[row - 1]] && ships[letters[row - 1]][col]) {
						_great = false;
					}
					row--;
				}
			}
			else { // down						
				for (x = 0; x < length; x++) {
					if (ships[letters[row - 1]] && ships[letters[row - 1]][col]) {
						_great = false;
					}
					row++;
				}
			}
		}
		else { // horizontal
			while(!(_col - 10 >= length) && !(_col >= length)) {							
				_col = random(1, 10);
			}
			
			if ((_col >= length) && (_col - 10 >= length)) {
				_direction = random(1, 2);
			}
			else if (_col >= length) {
				_direction = 1;
			}
			else {
				_direction = 2;
			}
			
			row = _row;
			col = _col;
			if (_direction == 1) { // left	
				for (x = 0; x < length; x++) {
					if (ships[letters[row - 1]] && ships[letters[row - 1]][col]) {
						_great = false;
					}
					col--;
				}
			}
			else { // right			
				ships[letters[_row - 1]] = {};						
				for (x = 0; x < length; x++) {
					if (ships[letters[row - 1]] && ships[letters[row - 1]][col]) {
						_great = false;
					}
					col++;
				}
			}
		}
		
		if (_great) {
			return { 
				'row'			: _row,
				'col'			: _col,
				'orientation'	: _orientation, 
				'direction' 	: _direction
			};
		}
		else {
			return canSetShip(length);
		}
	}

	function setShip(length, id) {
		const data 		= canSetShip(length);

		let ships = id === 'userShips' ? userShips : pcShips;

		let row 		= data['row'];
		let col 		= data['col'];
		let orientation	= data['orientation']
		let direction 	= data['direction']
		
		if (orientation == 1) { // vertical						
			if (direction == 1) { // up
				for (x = 0; x < length; x++) {
					ships[letters[row - 1]] = ships[letters[row - 1]] || {};
					ships[letters[row - 1]][col] = true;
					row--;
				}
			}
			else { // down						
				for (x = 0; x < length; x++) {
					ships[letters[row - 1]] = ships[letters[row - 1]] || {};
					ships[letters[row - 1]][col] = true;
					row++;
				}
			}
		}
		else { // horizontal
			if (direction == 1) { // left	
				ships[letters[row - 1]] = ships[letters[row - 1]] || {};
				for (x = 0; x < length; x++) {
					ships[letters[row - 1]][col] = true;
					col--;
				}
			}
			else { // right			
				ships[letters[_row - 1]] = ships[letters[_row - 1]] || {};						
				for (x = 0; x < length; x++) {
					ships[letters[row - 1]][col] = true;
					col++;
				}
			}
		}
	}

	function random(start, end) {
		return Math.floor((Math.random() * end) + start);
	}

	function attack($cell, row, column, id, user = false) {
		$cell.off('click');

		if (id === 'userShips') {
			ships = userShips;
			userBombs++;
		} else {
			ships = pcShips;
			pcBombs++;
		}

		if (ships[row] && ships[row][column]) {
			$cell.css('background-color', 'red');
			if (id === 'userShips') {
				pcHits++;
			} else {
				userHits++;
			}
		}
		else {						
			$cell.css('background-color', '#0D47A1');
		}
		
		checkGameOver(id);

		if (!user) {
			attackPc();
		}
	}

	function attackPc() {
		const tdArray = $(`#userShips table td`);

		let positionExist, position = null;

		do {
			position = random(0, tdArray.length);

			positionExist = lastValues.find(item => item === position);
		} while (positionExist);

		lastValues.push(position);

		const currentTd = $(tdArray[position]);
		const row = currentTd.parent().data('row'); 
		const column = currentTd.data('col');

		attack(currentTd, row, column, 'userShips', true);
	}

	function showShips(id) {
		const tdArray = $(`#userShips table td`);

		for (let td of tdArray) {
			const currentTd = $(td);
			let row = currentTd.parent().data('row'); 
			let column = currentTd.data('col');

			if (userShips[row] && userShips[row][column]) {
				currentTd.css('background-color', 'black');
			}
		}
	}

	function checkGameOver(id) {
		if (id === 'userShips') {
			if (userHits === 7) {			
				if (confirm('Você ganhou com ' + ((userHits/userBombs) * 100).toFixed() + '% de taxa de acerto.\nTentativas: '+userBombs+'\nAcertos: '+userHits+'\nDeseja iniciar um novo jogo?')) {
					location.reload();
				}
			}
		} else {
			if (pcHits === 7) {			
				if (confirm('Você perdeu! O Computador ganhou com ' + ((pcHits/pcBombs) * 100).toFixed() + '% de taxa de acerto.\nTentativas: '+pcBombs+'\nAcertos: '+pcHits+'\nDeseja iniciar um novo jogo?')) {
					location.reload();
				}
			}
		}
		
	}

	return {
		start: start
	}
})();

Game.start()