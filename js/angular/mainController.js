import GameEngine from './../gameEngine';
import MapController from './../map/mapController';
import { GAME_PHASES, TURN_PHASES } from './../gameConstants';
import { getTerritoryByName } from './../map/mapHelpers';

export function MainController($scope, $rootScope, gameEngine) {
    var vm = this;

    // PUBLIC FUNCTIONS
    vm.filterByOwner = filterByOwner;
    vm.filterByRegion = filterByRegion;
    vm.nextTurn = nextTurn;
    vm.checkIfNextIsDisabled = checkIfNextIsDisabled;
    vm.getCurrentPlayerColor = getCurrentPlayerColor;
    vm.init = init;
    vm.startGame = startGame;

    vm.gamePhases = GAME_PHASES;
    vm.currentGamePhase = GAME_PHASES.PLAYER_SETUP;

    vm.turn = {};

    var mapController;

    function init() {
        console.log('Initialization of mainController');
    }

    function startGame(players) {
        gameEngine.startGame(players);
        vm.currentGamePhase = vm.gamePhases.GAME;
        vm.troopsToDeploy = gameEngine.troopsToDeploy;

        mapController = new MapController(gameEngine.players, gameEngine.map);
        document.querySelectorAll('.country').forEach(country => {
            country.addEventListener('click', (e) => {
                clickCountry(e);
            });
        });

        vm.turn = gameEngine.turn;
        vm.filter = 'byOwner';
        mapController.updateMap(gameEngine.map, vm.filter, gameEngine.turn);
    }

    function filterByOwner() {
        vm.filter = 'byOwner';
        mapController.updateMap(gameEngine.map, vm.filter, gameEngine.turn);
    }

    function filterByRegion() {
        vm.filter = 'byRegion';
        mapController.updateMap(gameEngine.map, vm.filter, gameEngine.turn);
    }

    function nextTurn() {
        vm.turn = gameEngine.nextTurn();
        mapController.updateMap(gameEngine.map, vm.filter, gameEngine.turn);
        console.log(vm.turn);
    }

    function checkIfNextIsDisabled() {
        if (!gameEngine.turn) {
            return;
        }
        if (gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT && gameEngine.troopsToDeploy > 0) {
            return true;
        } else {
            return false;
        }
    }

    function getCurrentPlayerColor() {
        return gameEngine.players ? gameEngine.players.get(vm.turn.player.name).color.mainColor : '';
    }

    function clickCountry(evt) {
        let country = evt.target.getAttribute('id');

        if (gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
            gameEngine.addTroopToTerritory(country);
            mapController.updateMap(gameEngine.map, vm.filter, gameEngine.turn);
            vm.troopsToDeploy = gameEngine.troopsToDeploy;
            $scope.$apply();
        } else if (gameEngine.turn.turnPhase === TURN_PHASES.ATTACK) {
            let territory = getTerritoryByName(gameEngine.map, country);
            if (gameEngine.selectedTerritory && territory.owner !== gameEngine.turn.player.name && territory.adjacentTerritories.includes(gameEngine.selectedTerritory.name)) {
                let attack = {
                    territoryAttacked: territory,
                    attackFrom: gameEngine.selectedTerritory,
                    attacker: gameEngine.players.get(gameEngine.selectedTerritory.owner),
                    defender: gameEngine.players.get(territory.owner)
                };
                $rootScope.$emit('engageAttackPhase', attack);
            } else {
                gameEngine.selectedTerritory = territory;
                mapController.updateMap(gameEngine.map, vm.filter, gameEngine.turn);
                mapController.hightlightTerritory(country, vm.turn.player.name);
            }
        }
    }
}